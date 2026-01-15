// Script to generate A4-optimized PDF content with proper line wrapping
const fs = require('fs');
const path = require('path');

// A4 portrait with 1cm margins, 9pt monospace font = ~100 chars per line
const MAX_LINE_WIDTH = 95;

/**
 * Wrap long lines while preserving indentation
 * @param {string} line - Original line
 * @param {number} maxWidth - Maximum line width
 * @returns {string} Wrapped line(s)
 */
function wrapLine(line, maxWidth) {
    if (line.length <= maxWidth) {
        return line;
    }

    // Detect indentation
    const indentMatch = line.match(/^(\s*)/);
    const indent = indentMatch ? indentMatch[1] : '';
    const continuationIndent = indent + '    '; // Extra indent for wrapped lines

    const words = [];
    let currentWord = '';

    // Split by spaces but preserve strings and special syntax
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === ' ' && currentWord.length > 0) {
            words.push(currentWord);
            currentWord = '';
        } else {
            currentWord += char;
        }
    }
    if (currentWord) words.push(currentWord);

    const lines = [];
    let currentLine = '';

    for (const word of words) {
        const testLine = currentLine ? currentLine + ' ' + word : word;

        if (testLine.length <= maxWidth) {
            currentLine = testLine;
        } else {
            if (currentLine) {
                lines.push(currentLine);
                // Use continuation indent for wrapped lines
                currentLine = continuationIndent + word.trimStart();
            } else {
                // Word itself is too long, force break
                lines.push(word.substring(0, maxWidth));
                currentLine = continuationIndent + word.substring(maxWidth);
            }
        }
    }

    if (currentLine) {
        lines.push(currentLine);
    }

    return lines.join('\n');
}

/**
 * Process file content for A4 output
 * @param {string} content - File content
 * @returns {string} A4-optimized content
 */
function processForA4(content) {
    const lines = content.split('\n');
    const processedLines = lines.map(line => {
        // Don't wrap empty lines or very short lines
        if (line.trim().length === 0 || line.length <= MAX_LINE_WIDTH) {
            return line;
        }
        return wrapLine(line, MAX_LINE_WIDTH);
    });
    return processedLines.join('\n');
}

const codeFiles = [
    { name: 'cost_maneger_mui/src/App.jsx', display: 'src/App.jsx' },
    { name: 'cost_maneger_mui/src/index.css', display: 'src/index.css' },
    { name: 'cost_maneger_mui/src/App.css', display: 'src/App.css' },
    { name: 'cost_maneger_mui/src/components/CostForm.jsx', display: 'src/components/CostForm.jsx' },
    { name: 'cost_maneger_mui/src/components/Dashboard.jsx', display: 'src/components/Dashboard.jsx' },
    { name: 'cost_maneger_mui/src/components/DashboardFilters.jsx', display: 'src/components/DashboardFilters.jsx' },
    { name: 'cost_maneger_mui/src/components/MonthlyCostTable.jsx', display: 'src/components/MonthlyCostTable.jsx' },
    { name: 'cost_maneger_mui/src/components/CategoryPieChart.jsx', display: 'src/components/CategoryPieChart.jsx' },
    { name: 'cost_maneger_mui/src/components/YearlyBarChart.jsx', display: 'src/components/YearlyBarChart.jsx' },
    { name: 'cost_maneger_mui/src/components/Settings.jsx', display: 'src/components/Settings.jsx' },
    { name: 'cost_maneger_mui/src/utils/constants.js', display: 'src/utils/constants.js' },
    { name: 'cost_maneger_mui/src/utils/helperFunctions.js', display: 'src/utils/helperFunctions.js' },
    { name: 'cost_maneger_mui/src/utils/idb.js', display: 'src/utils/idb.js' }
];

// Read header template
let content = fs.readFileSync('PDF_SUBMISSION_DOCUMENT.md', 'utf8');

// Add each code file
codeFiles.forEach((file, index) => {
    try {
        const fileContent = fs.readFileSync(file.name, 'utf8');
        const processedContent = processForA4(fileContent);

        content += `\n\n${'='.repeat(90)}\n`;
        content += `FILE ${index + 1}/13: ${file.display}\n`;
        content += `${'='.repeat(90)}\n\n`;
        content += '```javascript\n';
        content += processedContent;
        content += '\n```\n';
    } catch (error) {
        console.error(`Error reading ${file.name}:`, error.message);
    }
});

content += `\n\n${'='.repeat(90)}\n`;
content += `END OF SUBMISSION - 13 FILES TOTAL\n`;
content += `${'='.repeat(90)}\n`;

fs.writeFileSync('PDF_A4_READY.md', content);
console.log('A4-optimized PDF document generated: PDF_A4_READY.md');
console.log(`Max line width: ${MAX_LINE_WIDTH} characters`);
