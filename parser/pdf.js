const pdfParse = require('pdf-parse');

async function parsePDFBuffer(buffer) {
    try {
        const data = await pdfParse(buffer);
        return data.text;
    } catch (err) {
        console.error("Error parsing PDF:", err);
        throw new Error("Failed to decode the PDF document. Ensure it contains selectable text.");
    }
}

module.exports = { parsePDFBuffer };
