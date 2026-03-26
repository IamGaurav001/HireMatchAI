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

module.exports = { analyzeResume };
