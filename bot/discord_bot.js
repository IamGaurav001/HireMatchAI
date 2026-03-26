require('dotenv').config();
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const { parsePDFBuffer } = require('../parser/pdf');
const { analyzeResume } = require('../ai/model');

const token = process.env.DISCORD_BOT_TOKEN;

if (!token) {
    console.warn("DISCORD_BOT_TOKEN is missing in .env! Discord bot is disabled until token is provided.");
    return;
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
    ],
    partials: [Partials.Channel, Partials.Message]
});

// Basic State Memory mapped by User ID
const userState = {};
const STATE_WAIT_JD = 'WAIT_JD';
const STATE_WAIT_RESUME = 'WAIT_RESUME';
const STATE_PROCESSING = 'PROCESSING';

client.once('ready', () => {
    console.log(`[BOT] Discord Bot logged in as ${client.user.tag}!`);
});

async function extractText(msg) {
    if (msg.attachments.size > 0) {
        const attachment = msg.attachments.first();
        
        if (!attachment.contentType?.includes('pdf') && !attachment.name.toLowerCase().endsWith('.pdf')) {
            throw new Error("Only PDF files are supported! Please upload a valid PDF.");
        }

        const response = await fetch(attachment.url);
        if (!response.ok) throw new Error("Failed to download the PDF file.");
        
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        const extractedText = await parsePDFBuffer(buffer);
        if (!extractedText || !extractedText.trim()) {
            throw new Error("Could not extract text from the PDF. It might be scanned or empty.");
        }
        return extractedText;
    }

    if (msg.content && msg.content.trim()) {
        const content = msg.content.trim();
        if (content.startsWith('/') || content.startsWith('!')) {
            throw new Error("Please provide the document text, not a command.");
        }
        return content;
    }
    
    throw new Error("Please provide either plain text or a PDF document.");
}

client.on('messageCreate', async (msg) => {
    // Ignore bot's own messages
    if (msg.author.bot) return;

    const userId = msg.author.id;
    const content = msg.content.trim().toLowerCase();

    // Start Command Handler
    if (content === '/start' || content === '!start') {
        userState[userId] = { state: STATE_WAIT_JD, jdText: null, resumeText: null };
        return msg.reply("Welcome to the AI Resume vs JD Matcher Bot! 🤖\n\nPlease send me the **Job Description** first.\nYou can send it as plain text or upload a PDF file.");
    }

    if (!userState[userId] || !userState[userId].state) {
        if (!msg.guild) {
             msg.reply("Please start the bot by typing `/start` or `!start`");
        }
        return;
    }

    const state = userState[userId].state;

    // Don't interrupt while processing
    if (state === STATE_PROCESSING) {
        return msg.reply("⏳ Still processing your previous request... Please wait!");
    }

    try {
        if (state === STATE_WAIT_JD) {
            await msg.channel.send("Reading Job Description...");
            const jdText = await extractText(msg);
            userState[userId].jdText = jdText;
            userState[userId].state = STATE_WAIT_RESUME;
            return msg.reply("✅ Job Description saved!\n\nNow, please send the **Resume** (plain text or PDF).");
        }

        if (state === STATE_WAIT_RESUME) {
            await msg.channel.send("Reading Resume...");
            const resumeText = await extractText(msg);
            userState[userId].resumeText = resumeText;
            userState[userId].state = STATE_PROCESSING;
            
            await msg.reply("✅ Resume saved!\n\n⏳ Analyzing with AI... This might take a few seconds.");

            let analysisResult = await analyzeResume(userState[userId].jdText, userState[userId].resumeText);
            
            // Discord limits messages to 2000 characters
            if (analysisResult.length > 1900) {
                const chunks = analysisResult.match(/[\s\S]{1,1900}/g) || [];
                for (let i = 0; i < chunks.length; i++) {
                    await msg.channel.send(chunks[i]);
                }
            } else {
                await msg.reply(analysisResult);
            }

            // Reset state
            userState[userId] = { state: STATE_WAIT_JD, jdText: null, resumeText: null };
            await msg.channel.send("Finished! 🚀\n\nTo start a new matching process, simply send a new **Job Description** or type `!start`.");
            return;
        }

    } catch (err) {
        if (err.message.includes("not a command")) return;
        console.error("Discord User Action Error:", err);
        msg.reply("❌ Error: " + err.message);
    }
});

client.login(token).catch(err => {
    if (err.message.includes('token')) {
        console.warn("Invalid DISCORD_BOT_TOKEN provided or authentication failed.");
    } else {
        console.error("Discord login error:", err);
    }
});

module.exports = { client };
