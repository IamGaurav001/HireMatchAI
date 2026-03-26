require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const { parsePDFBuffer } = require('../parser/pdf');
const { analyzeResume } = require('../ai/model');

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
    console.warn("TELEGRAM_BOT_TOKEN is missing in .env! Telegram bot is disabled until token is provided.");
    return;
}

// Setup Bot
const bot = new TelegramBot(token, { polling: true });

// Basic State Memory
const userState = {};
const STATE_WAIT_JD = 'WAIT_JD';
const STATE_WAIT_RESUME = 'WAIT_RESUME';
const STATE_PROCESSING = 'PROCESSING';

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    userState[chatId] = { state: STATE_WAIT_JD, jdText: null, resumeText: null };
    bot.sendMessage(chatId, "Welcome to the AI Resume vs JD Matcher Bot! 🤖\n\nPlease send me the **Job Description** first.\nYou can send it as plain text or as a PDF file.");
});

async function extractText(msg) {
    if (msg.text && !msg.text.startsWith('/')) {
        return msg.text;
    } 
    
    if (msg.document) {
        if (msg.document.mime_type !== 'application/pdf') {
            throw new Error("Only PDF files are supported!");
        }

        const fileId = msg.document.file_id;
        const stream = bot.getFileStream(fileId);
        
        const buffer = await new Promise((resolve, reject) => {
            const chunks = [];
            stream.on('data', chunk => chunks.push(chunk));
            stream.on('end', () => resolve(Buffer.concat(chunks)));
            stream.on('error', err => reject(err));
        });

        const extractedText = await parsePDFBuffer(buffer);
        if (!extractedText || !extractedText.trim()) {
            throw new Error("Could not extract text from the PDF. It might be scanned or empty.");
        }
        return extractedText;
    }
    
    throw new Error("Please provide either plain text or a PDF document.");
}

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;

    // Ignore commands
    if (msg.text && msg.text.startsWith('/')) return;

    if (!userState[chatId] || !userState[chatId].state) {
        return bot.sendMessage(chatId, "Please start the bot by typing /start");
    }

    const state = userState[chatId].state;

    // Don't interrupt while processing
    if (state === STATE_PROCESSING) {
        return bot.sendMessage(chatId, "⏳ Still processing your previous request... Please wait!");
    }

    try {
        if (state === STATE_WAIT_JD) {
            bot.sendMessage(chatId, "Reading Job Description...");
            const jdText = await extractText(msg);
            userState[chatId].jdText = jdText;
            userState[chatId].state = STATE_WAIT_RESUME;
            return bot.sendMessage(chatId, "✅ Job Description saved!\n\nNow, please send the **Resume** (plain text or PDF).");
        }

        if (state === STATE_WAIT_RESUME) {
            bot.sendMessage(chatId, "Reading Resume...");
            const resumeText = await extractText(msg);
            userState[chatId].resumeText = resumeText;
            userState[chatId].state = STATE_PROCESSING;
            
            bot.sendMessage(chatId, "✅ Resume saved!\n\n⏳ Analyzing with AI... This might take a few seconds.");

            const analysisResult = await analyzeResume(userState[chatId].jdText, userState[chatId].resumeText);
            
            await bot.sendMessage(chatId, analysisResult);

            // Reset state
            userState[chatId] = { state: STATE_WAIT_JD, jdText: null, resumeText: null };
            await bot.sendMessage(chatId, "Finished! 🚀\n\nTo start a new matching process, simply send a new **Job Description**.");
            return;
        }

    } catch (err) {
        console.error("User Action Error:", err);
        bot.sendMessage(chatId, "❌ Error: " + err.message);
    }
});

module.exports = { bot };
