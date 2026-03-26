const { mdToPdf } = require('md-to-pdf');
const path = require('path');
const fs = require('fs');

/**
 * Converts Markdown Strings into styled PDF files.
 * Returns the absolute paths of the generated PDFs.
 */
async function generateResumesFromMarkdown(opt1Markdown, opt2Markdown, identifier) {
    const opt1pdfPath = path.join(__dirname, `../Option1_Professional_${identifier}.pdf`);
    const opt2pdfPath = path.join(__dirname, `../Option2_Modern_${identifier}.pdf`);

    // Optional custom CSS for formatting the resume nicely in PDF
    const customCss = `
        body { font-family: 'Helvetica', 'Arial', sans-serif; font-size: 14px; color: #333; line-height: 1.6; }
        h1, h2, h3 { color: #2c3e50; }
        h1 { border-bottom: 2px solid #2c3e50; padding-bottom: 5px; }
        ul { margin-top: 5px; }
        li { margin-bottom: 5px; }
    `;

    try {
        await mdToPdf(
            { content: opt1Markdown }, 
            { 
                dest: opt1pdfPath,
                css: customCss,
                pdf_options: { format: 'A4', margin: '20mm' } 
            }
        );

        await mdToPdf(
            { content: opt2Markdown }, 
            { 
                dest: opt2pdfPath,
                css: customCss,
                pdf_options: { format: 'A4', margin: '20mm' }
            }
        );

        return { opt1pdfPath, opt2pdfPath };
    } catch (e) {
        console.error("PDF Generation failed:", e);
        throw e;
    }
}

module.exports = { generateResumesFromMarkdown };
