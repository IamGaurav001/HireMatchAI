<div align="center">
  <img src="https://img.icons8.com/color/96/000000/brain--v1.png" alt="HireMatchAI Logo" width="80" />
  
  # HireMatchAI
  **Your Personal AI Recruiter & ATS Optimizer**

  [![Telegram](https://img.shields.io/badge/Bot-Telegram-2CA5E0?style=for-the-badge&logo=telegram&logoColor=white)](https://t.me/Hire_Match_Bot)
  [![Discord](https://img.shields.io/badge/Bot-Discord-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.com/api/oauth2/authorize?client_id=1486600313975734443&permissions=0&scope=bot)
  [![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](#)
  [![Gemini](https://img.shields.io/badge/Google_Gemini-8E75B2?style=for-the-badge&logo=google-bard&logoColor=white)](#)

  **[View Live Landing Page](https://iamgaurav001.github.io/HireMatchAI/)** 
</div>

---

## 🎯 Overview

**HireMatchAI** is an advanced, AI-powered multi-platform bot (Telegram & Discord) designed to act as a fair and rigid Applicant Tracking System (ATS). It performs deep-level comparative analysis between a candidate's Resume and a target Job Description (JD), while also dynamically drafting and generating fresh, tailored Resume PDFs!

Built with modern architectural patterns to ensure high maintainability, and engineered to serve as an exemplary project in technical interviews.

---

## 🚀 Key Features

- **Multi-Platform Support:** Seamlessly connect and interact via **Telegram** and **Discord**.
- **Smart PDF Parsing:** Robust, error-tolerant text extraction directly from user-uploaded PDF documents.
- **Deep AI Analysis Engine:** Powered by **Google Gemini AI** to deliver:
  - Exact Percentage Match Score (0–100%)
  - Strong Alignments / Core Skill Coverage
  - Critical Missing Skills identification
  - Practical, actionable improvement tips
- **Auto-Draft Resume Generator (Premium Feature):** The AI automatically rewrites your resume content to specifically target the JD, generating **two beautifully styled, ready-to-download PDFs** (Corporate & Modern).
- **Beautiful Web Presence:** Includes a stunning dark-theme glassmorphism landing page deployed securely via GitHub Actions.

---

## 🛠️ Tech Stack & Architecture

- **Backend Framework:** Node.js, Express.js (serving static API & frontend)
- **Bot Integrations:** `node-telegram-bot-api`, `discord.js`
- **AI Core:** `@google/generative-ai`
- **Document Processing:** `pdf-parse`, `md-to-pdf`
- **Frontend UI:** HTML5, Vanilla CSS (Glassmorphism), Vanilla JavaScript
- **CI/CD Deployment:** GitHub Actions (Automated static page deployments)

### 📂 Directory Structure

```text
HireMatchAI/
  ├── backend/
  │    └── server.js      # Express API & Bootstrap loader for Bots
  ├── bot/
  │    ├── bot.js         # Telegram event handling & conversational state
  │    └── discord_bot.js # Discord Gateway intent handling & interactions
  ├── ai/
  │    └── model.js       # Core Gemini prompt engineering & LLM connection
  ├── parser/
  │    └── pdf.js         # Buffer streams to raw text extraction logic
  ├── utils/
  │    ├── logger.js      # App logging utilities
  │    └── pdf_generator.js # Markdown to PDF compilation layer
  ├── public/             # Full static assets for the Product Landing Page
  ├── .github/workflows/  # CI/CD pipelines
  └── package.json        # Project metadata & configurations
```

---

## ⚙️ Setup and Local Installation

### 1. Clone the Repository
```bash
git clone https://github.com/IamGaurav001/HireMatchAI.git
cd HireMatchAI
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy the template file to create your local `.env`:
```bash
cp .env.example .env
```
Inside `.env`, populate your API keys:
```env
TELEGRAM_BOT_TOKEN=your_telegram_token_here
DISCORD_BOT_TOKEN=your_discord_token_here
GEMINI_API_KEY=your_google_gemini_key_here
PORT=3000
```

### 4. Start the Application
```bash
npm start
```
The Express server will boostrap on `http://localhost:3000` (serving the frontend) and seamlessly initialize the Telegram and Discord socket connections.

---

## 🤝 Interview Explainability 

If you are reviewing this repository for an engineering role, please note the following architectural decisions:

1. **Separation of Concerns (SoC):** 
   - **Protocol agnostic:** The core logic (`ai/model.js` and `parser/pdf.js`) is decoupled from the user-interfaces (Discord/Telegram). Adding WhatsApp or Slack support would require writing purely integration layers without touching business rules.
2. **State Management:** 
   - Utilizes conversational memory dictionaries. It maps user/chat IDs to an explicit localized state (`WAIT_JD`, `WAIT_RESUME`), enabling highly concurrent usage across servers without payload collisions or race conditions.
3. **Graceful Error Handling:** 
   - Built-in sanity checks directly within the AI prompt instructions. If a user accidentally swaps a Resume for a Job Description (or sends two of the same formats), the AI identifies the structural anomalies and gracefully halts the transaction, asking for safe re-upload sequences instead of breaking.

---

<div align="center">
  <i>Developed with ❤️ for job seekers worldwide.</i>
</div>
