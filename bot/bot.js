require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const { parsePDFBuffer } = require('../parser/pdf');
const { analyzeResume, optimizeResume } = require('../ai/model');
const { generateResumesFromMarkdown } = require('../utils/pdf_generator');
const fs = require('fs');

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
    bot.sendMessage(chatId, "Welcome to **HireMatch AI**! 👔\n\nI am your intelligent career co-pilot and ATS analyzer. To begin, please send me the **Job Description** you are targeting (upload as a PDF or send as text).", { parse_mode: 'Markdown' });
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
            bot.sendMessage(chatId, "Scanning Job Description... 🔍");
            const jdText = await extractText(msg);
            userState[chatId].jdText = jdText;
            userState[chatId].state = STATE_WAIT_RESUME;
            return bot.sendMessage(chatId, "✅ Job Description securely processed.\n\nNow, please send your **Resume** (as text or PDF) so I can begin the comparative analysis.", { parse_mode: 'Markdown' });
        }

        if (state === STATE_WAIT_RESUME) {
            bot.sendMessage(chatId, "Evaluating Resume... 📄");
            const resumeText = await extractText(msg);
            userState[chatId].resumeText = resumeText;
            userState[chatId].state = STATE_PROCESSING;
            
            bot.sendMessage(chatId, "✅ Resume received.\n\n⏳ Initializing AI Analysis Engine... Please hold on while I evaluate your profile against the requirements.");

            const analysisResult = await analyzeResume(userState[chatId].jdText, userState[chatId].resumeText);
            
            await bot.sendMessage(chatId, analysisResult);

            // Professional Feature: Native PDFs!
            await bot.sendMessage(chatId, "✨ Earning your next interview:\n\nAs part of our premium service, our AI Engine is actively rewriting your resume to natively align with this specific role. Generating printable PDF drafts for you... ⏳");
            
            try {
                const optimized = await optimizeResume(userState[chatId].jdText, userState[chatId].resumeText);
                
                // Now generating actual styled PDFs!
                const pdfPaths = await generateResumesFromMarkdown(optimized.option1, optimized.option2, chatId);

                await bot.sendDocument(chatId, pdfPaths.opt1pdfPath, { caption: "📄 Draft 1: Traditional & Technical Alignment (Corporate Format)" });
                await bot.sendDocument(chatId, pdfPaths.opt2pdfPath, { caption: "🚀 Draft 2: Impact-Driven Achievement Focus (Modern Format)" });

                // Cleanup instantly
                fs.unlinkSync(pdfPaths.opt1pdfPath);
                fs.unlinkSync(pdfPaths.opt2pdfPath);
            } catch (optErr) {
                console.error(optErr);
                await bot.sendMessage(chatId, "❌ We encountered a brief system error while rendering your PDF drafts. Please try again later.");
            }

            // Reset state
            userState[chatId] = { state: STATE_WAIT_JD, jdText: null, resumeText: null };
            await bot.sendMessage(chatId, "✅ Analysis Workflow Complete.\n\nWhenever you are ready to evaluate another opportunity, simply upload a new **Job Description** or type /start to reset.");
            return;
        }

    } catch (err) {
        console.error("User Action Error:", err);
        bot.sendMessage(chatId, "❌ Error: " + err.message);
    }
});

module.exports = { bot };
