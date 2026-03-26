const { mdToPdf } = require('md-to-pdf');
const path = require('path');
const fs = require('fs');

async function generateResumesFromMarkdown(opt1Markdown, opt2Markdown, identifier) {
    const opt1pdfPath = path.join(__dirname, `../Option1_Professional_${identifier}.pdf`);
    const opt2pdfPath = path.join(__dirname, `../Option2_Modern_${identifier}.pdf`);

    const customCss = `
        body { 
            font-family: 'Times New Roman', Times, serif; 
            font-size: 10.5pt; 
            color: #000; 
            line-height: 1.2; 
        }
        h1 { 
            font-size: 22pt; 
            text-align: center; 
            text-transform: uppercase; 
            margin-bottom: 2px; 
            margin-top: 0;
            font-weight: normal;
        }
        /* Center the contact info */
        h1 + p, h1 + div { 
            text-align: center; 
            margin-top: 0; 
            margin-bottom: 12px;
            font-size: 10.5pt;
        }
        h2 { 
            font-size: 12pt; 
            text-transform: uppercase; 
            border-bottom: 1px solid #000; 
            padding-bottom: 2px; 
            margin-top: 12px; 
            margin-bottom: 6px; 
            font-weight: bold;
        }
        h3 { 
            font-size: 11pt; 
            margin-top: 8px; 
            margin-bottom: 4px; 
            font-weight: normal;
        }
        p { margin: 3px 0; }
        ul { 
            margin-top: 2px; 
            margin-bottom: 6px; 
            padding-left: 18px; 
        }
        li { 
            margin-bottom: 2.5px; 
            text-align: justify;
        }
        a { color: #000; text-decoration: none; }
        strong { font-weight: bold; }
    `;

    try {
        await mdToPdf(
            { content: opt1Markdown }, 
            { 
                dest: opt1pdfPath,
                css: customCss,
                pdf_options: { format: 'A4', margin: '12mm' } 
            }
        );

        await mdToPdf(
            { content: opt2Markdown }, 
            { 
                dest: opt2pdfPath,
                css: customCss,
                pdf_options: { format: 'A4', margin: '12mm' }
            }
        );

        return { opt1pdfPath, opt2pdfPath };
    } catch (e) {
        console.error("PDF Generation failed:", e);
        throw e;
    }
}

module.exports = { generateResumesFromMarkdown };
