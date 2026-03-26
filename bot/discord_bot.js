require('dotenv').config();
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const { parsePDFBuffer } = require('../parser/pdf');
const { analyzeResume, optimizeResume } = require('../ai/model');
const { generateResumesFromMarkdown } = require('../utils/pdf_generator');
const fs = require('fs');

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
        return msg.reply("Welcome to **HireMatch AI**! 👔\n\nI am your intelligent career co-pilot and ATS analyzer. To begin, please send me the **Job Description** you are targeting (upload as a PDF or send as text).");
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
            await msg.channel.send("Scanning Job Description... 🔍");
            const jdText = await extractText(msg);
            userState[userId].jdText = jdText;
            userState[userId].state = STATE_WAIT_RESUME;
            return msg.reply("✅ Job Description securely processed.\n\nNow, please send your **Resume** (as text or PDF) so I can begin the comparative analysis.");
        }

        if (state === STATE_WAIT_RESUME) {
            await msg.channel.send("Evaluating Resume... 📄");
            const resumeText = await extractText(msg);
            userState[userId].resumeText = resumeText;
            userState[userId].state = STATE_PROCESSING;
            
            await msg.reply("✅ Resume received.\n\n⏳ Initializing AI Analysis Engine... Please hold on while I evaluate your profile against the requirements.");

            let analysisResult = await analyzeResume(userState[userId].jdText, userState[userId].resumeText);
            
            // Handle AI Sanity Check Errors
            if (analysisResult.includes("ERROR_SWAPPED_DOCS") || analysisResult.includes("ERROR_BOTH_RESUMES") || analysisResult.includes("ERROR_BOTH_JDS")) {
                let errorMsg = "⚠️ **Oops! There is an issue with your documents.**\n\n";
                if (analysisResult.includes("ERROR_SWAPPED_DOCS")) {
                    errorMsg += "You accidentally swapped the Job Description and the Resume. The AI detected that the second document was actually the company posting!";
                } else if (analysisResult.includes("ERROR_BOTH_RESUMES")) {
                    errorMsg += "You uploaded your Resume both times. Please make sure the first document is the actual Job Description!";
                } else if (analysisResult.includes("ERROR_BOTH_JDS")) {
                    errorMsg += "You uploaded the Job Description both times. Please make sure the second document is your actual Candidate Resume!";
                }
                
                errorMsg += "\n\nLet's restart safely! Please send me the **Job Description** to begin anew.";
                userState[userId] = { state: STATE_WAIT_JD, jdText: null, resumeText: null };
                return msg.reply(errorMsg);
            }

            // Discord limits messages to 2000 characters
            if (analysisResult.length > 1900) {
                const chunks = analysisResult.match(/[\s\S]{1,1900}/g) || [];
                for (let i = 0; i < chunks.length; i++) {
                    await msg.channel.send(chunks[i]);
                }
            } else {
                await msg.reply(analysisResult);
            }

            // Professional Feature: Native PDFs!
            await msg.channel.send("✨ Earning your next interview:\n\nAs part of our premium service, our AI Engine is actively rewriting your resume to natively align with this specific role. Generating printable PDF drafts for you... ⏳");
            
            try {
                const optimized = await optimizeResume(userState[userId].jdText, userState[userId].resumeText);
                
                // Generating styled PDFs
                const pdfPaths = await generateResumesFromMarkdown(optimized.option1, optimized.option2, userId);

                await msg.reply({
                    content: "Here are your newly drafted Resumes, expertly customized for maximum ATS compatibility. 🎉",
                    files: [pdfPaths.opt1pdfPath, pdfPaths.opt2pdfPath]
                });

                fs.unlinkSync(pdfPaths.opt1pdfPath);
                fs.unlinkSync(pdfPaths.opt2pdfPath);
            } catch (optErr) {
                console.error(optErr);
                await msg.reply("❌ We encountered a brief system error while rendering your PDF drafts. Please try again later.");
            }

            // Reset state
            userState[userId] = { state: STATE_WAIT_JD, jdText: null, resumeText: null };
            await msg.channel.send("✅ Analysis Workflow Complete.\n\nWhenever you are ready to evaluate another opportunity, simply upload a new **Job Description** or type `!start` to reset.");
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
