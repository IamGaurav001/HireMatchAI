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
You are an ATS system acting as a strict, fair applicant tracking system.
Compare the following Job Description (JD) and Resume.

Output MUST exactly follow this plain-text format:

Score: [Score out of 100]

Matching Skills:
- [Skill 1]
- [Skill 2]
...

Missing Skills:
- [Skill 1]
- [Skill 2]
...

Weak Points:
- [Point 1]
- [Point 2]
...

Suggestions:
- [Suggestion 1]
- [Suggestion 2]
...

Recommendation:
[Good match / Average match / Poor match]

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

You must generate exactly 2 different rewritten Resume Options. Format them in clean Markdown.

Option 1: Professional & Technical. Focus on matching keywords and hard skills directly from the JD. Keep it formal.
Option 2: Impact-Driven & Modern. Focus on rewriting bullet points using the STAR method (Situation, Task, Action, Result). Emphasize leadership and achievements along with keywords.

Separate the two options using this EXACT string on its own line:
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
