require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function analyzeResume(jdText, resumeText) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error("Missing GEMINI_API_KEY in environment variables.");
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const prompt = `
You are an advanced ATS system and expert career coach.
Compare the following Job Description (JD) and Resume.

**CRITICAL INSTRUCTION - SANITY CHECK FIRST:**
Before running the analysis, you must examine the inputs.
1. If the 'Job Description' looks like a Candidate's Resume, OR the 'Resume' looks like a Job Posting, you MUST abort and output exactly: ERROR_SWAPPED_DOCS
2. If both inputs appear to be Resumes, output exactly: ERROR_BOTH_RESUMES
3. If both inputs appear to be Job Descriptions, output exactly: ERROR_BOTH_JDS
4. If the inputs are valid, proceed with the Match Report below.

Output MUST exactly follow this highly structured Markdown format with emojis to make it interactive and visually stunning for the user:

# 📊 ATS Match Report

**Overall Compatibility Score:** [Score]/100 🎯
*(Brief 1-line reason for this score based on core requirements)*

### 🟢 Strengths & Matching Skills
- ✅ **[Skill 1]:** [Where it was found / How it matches]
- ✅ **[Skill 2]:** [Where it was found / How it matches]
...

### 🔴 Critical Missing Skills. 
- ❌ **[Skill 1]:** [Why it is important for the JD]
- ❌ **[Skill 2]:** [Why it is important for the JD]
...

### ⚠️ Areas for Improvement (Weak Points)
- 📌 [Point 1: Focus on what's lacking in experience/formatting]
- 📌 [Point 2: Focus on what's lacking in experience/formatting]
...

### 💡 Strategic Action Plan
1. 🚀 **[Action Item 1]:** [Detail how they can fix this]
2. 🚀 **[Action Item 2]:** [Detail how they can fix this]
...

### 🏁 Final Verdict
**[Excellent Match 🌟 / Average Match ⚖️ / Poor Match 💔]** 
*[1 sentence explaining the final decision from an HR perspective]*
 ====================
Job Description:
${jdText}
====================
Resume:
${resumeText}
`;

        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.error("AI Analysis Error:", error);
        return "❌ Error: Could not generate AI analysis. Ensure GEMINI_API_KEY is correct and try again.";
    }
}

async function optimizeResume(jdText, resumeText) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const prompt = `
You are an expert Resume Writer and ATS Optimizer. 

I will provide a Job Description (JD) and a Candidate's Resume. 
Your task is to rewrite the resume to perfectly align with the JD, maximizing ATS score while remaining truthful. 

You must generate exactly 2 different rewritten Resume drafts perfectly formatted like a strict, professional academic CV (like standard Overleaf templates).
Format them entirely in Markdown, but you must use the inline HTML specified below for dates.
Start EVERY resume directly with:

# [Candidate Name]
<p style="text-align: center;">[Phone] | [Email] | [LinkedIn URL] | [GitHub URL]<br><i>(Do NOT use markdown link syntax like [text](url). Just write the clean URL text, e.g., linkedin.com/in/name)</i></p>

## EDUCATION
### **[University Name]** | [Degree] <span style="float: right;">[Start] – [End]</span>
- [CGPA/Percentage]

## PROFESSIONAL EXPERIENCE
### **[Company Name]** | *[Role]* <span style="float: right;">[Start Date] – [End Date]</span>
- [High-impact bullet point]
- [Keep bullets concise and action-driven]

## PROJECTS
### **[Project Name]** <span style="float: right;">[Date]</span>
- [Bullet points]

## TECHNICAL SKILLS
- **Languages:** [...]

Option 1: The Corporate Executive. Format normally. Keep tone extremely formal, heavily technical, matching exactly to the JD requirements.
Option 2: The Modern Innovator. Make this structurally DIFFERENT from Option 1. 
- MUST include a "## PROFESSIONAL SUMMARY" section immediately after the contact info.
- When generating bullet points using STAR, DO NOT literally type the words "Situation:", "Task:", "Action:", or "Result:". DO NOT type "Achievement:" or "Impact:". 
- Instead, merge the entire STAR concept into a SINGLE, powerful, flowing sentence per bullet that starts with an Action Verb (e.g. "Engineered scalable REST APIs using Node.js to automate logic, reducing manual overhead by 60%"). 

Do NOT add any filler text before or after the resumes. 
Separate the two resumes ONLY using this EXACT string on its own line:
|||SEPARATOR|||

====================
Job Description:
${jdText}
====================
Resume:
${resumeText}
`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const parts = text.split("|||SEPARATOR|||");
        
        return {
            option1: parts[0] ? parts[0].trim() : "Option 1 generation failed.",
            option2: parts[1] ? parts[1].trim() : "Option 2 generation failed."
        };
    } catch (error) {
        console.error("AI Optimization Error:", error);
        throw new Error("Could not optimize the resume.");
    }
}

module.exports = { analyzeResume, optimizeResume };
