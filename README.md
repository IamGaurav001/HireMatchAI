# AI Resume vs Job Description Matcher Bot

An AI-powered Telegram Bot that compares a Job Description (JD) with a Resume and gives a match score, missing skills, and recommendations.

Built for clean architecture and explainability in interviews, this tool leverages modern Generative AI to act as a fair and rigid ATS (Applicant Tracking System).

## 🚀 Features
- **Accepts Inputs:** Job Descriptions and Resumes via plain text or PDF documents.
- **Smart Parsing:** Automatically extracts text from uploaded PDF files.
- **AI Matching Engine:** Compares the Resume against the JD using Gemini AI.
- **Detailed Output:**
  - Match Score (0–100)
  - Matching / Strong Skills
  - Missing Skills
  - Weak Areas
  - Practical Suggestions for Improvement
  - Final Recommendation (`Good match` / `Average match` / `Poor match`)

## 🛠 Tech Stack
- **Backend:** Node.js + Express
- **Bot Engine:** `node-telegram-bot-api` for Telegram integration
- **AI Engine:** Google Gemini (`@google/generative-ai`)
- **PDF Parser:** `pdf-parse`

## 📂 Folder Structure
\`\`\`
project/
  ├── backend/
  │    └── server.js      -> Express API & Bot bootstrapper
  ├── bot/
  │    └── bot.js         -> Telegram Bot message & state handling
  ├── ai/
  │    └── model.js       -> AI processing and prompt logic
  ├── parser/
  │    └── pdf.js         -> PDF text extraction utility
  ├── utils/
  │    └── logger.js      -> Simple custom logger
  ├── .env.example        -> Environment variables template
  └── package.json        -> App dependencies
\`\`\`

## ⚙️ Setup and Installation

1. **Clone the repository** (or navigate to this directory)
2. **Install Dependencies:**
   \`\`\`bash
   npm install
   \`\`\`
3. **Configure Environment Variables:**
   - Copy `.env.example` to `.env`.
   - Add your Telegram Bot Token (from [@BotFather](https://t.me/botfather) on Telegram).
   - Add your Gemini API Key (from Google AI Studio).

   \`\`\`env
   TELEGRAM_BOT_TOKEN=your_token_here
   GEMINI_API_KEY=your_gemini_api_key_here
   PORT=3000
   \`\`\`

4. **Start the Bot:**
   \`\`\`bash
   npm start
   \`\`\`

## 🤖 How to Use
1. Start a chat with your Telegram Bot.
2. Send the `/start` command.
3. The bot will ask for the **Job Description**. Send it as plain text or upload a `.pdf` file.
4. The bot will then ask for the **Resume**. Send it as plain text or upload a `.pdf` file.
5. Wait a few seconds for the AI to analyze and provide a detailed matching breakdown.

## 🤝 Explainability (For Interviews)
- **Separation of Concerns:** The code is cleanly divided into parsing, AI connection, and bot routing.
- **State Management:** Handled simply using an in-memory dictionary mapped to Telegram User Chat IDs, ensuring that multiple users can talk to the bot simultaneously without interference.
- **Extensible:** Easily adaptable to Discord or WhatsApp because the core logic (`ai/model.js` and `parser/pdf.js`) is fully decoupled from the bot's interface.
