// Script to generate A4 LANDSCAPE PDF content
// A4 Landscape with small margins fits ~130 chars per line at 9pt font
const fs = require('fs');

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

// Check max line length in files
let maxLineLength = 0;
let longestFile = '';
let longestLine = '';

codeFiles.forEach(file => {
    try {
        const content = fs.readFileSync(file.name, 'utf8');
        const lines = content.split('\n');
        lines.forEach(line => {
            if (line.length > maxLineLength) {
                maxLineLength = line.length;
                longestFile = file.name;
                longestLine = line.substring(0, 50) + '...';
            }
        });
    } catch (e) {}
});

console.log('=== LINE LENGTH ANALYSIS ===');
console.log(`Longest line: ${maxLineLength} characters`);
console.log(`In file: ${longestFile}`);
console.log(`Preview: ${longestLine}`);
console.log('');

// A4 Landscape recommendations:
// - 8pt font, 0.5cm margins: ~160 chars
// - 9pt font, 1cm margins: ~130 chars
// - 10pt font, 1cm margins: ~115 chars

if (maxLineLength <= 130) {
    console.log('✓ All lines fit in A4 LANDSCAPE (9pt font, 1cm margins)');
} else if (maxLineLength <= 160) {
    console.log('⚠ Use A4 LANDSCAPE with 8pt font and 0.5cm margins');
} else {
    console.log('✗ Some lines may be cut off. Consider reducing indentation.');
}

// Generate the PDF content
let content = fs.readFileSync('PDF_SUBMISSION_DOCUMENT.md', 'utf8');

// Add page setup instructions at the top
const pageSetup = `
<!--
PDF SETTINGS FOR A4 LANDSCAPE:
- Page Size: A4 Landscape (297mm x 210mm)
- Margins: 1cm all sides
- Font: Consolas or Courier New, 9pt
- Line spacing: 1.0
-->

`;

content = pageSetup + content;

codeFiles.forEach((file, index) => {
    try {
        const fileContent = fs.readFileSync(file.name, 'utf8');

        content += `\n\n${'='.repeat(120)}\n`;
        content += `FILE ${index + 1}/13: ${file.display}\n`;
        content += `${'='.repeat(120)}\n\n`;
        content += '```javascript\n';
        content += fileContent;
        content += '\n```\n';
    } catch (error) {
        console.error(`Error reading ${file.name}:`, error.message);
    }
});

content += `\n\n${'='.repeat(120)}\n`;
content += `END OF SUBMISSION - 13 FILES TOTAL\n`;
content += `${'='.repeat(120)}\n`;

fs.writeFileSync('PDF_A4_LANDSCAPE.md', content);
console.log('');
console.log('Generated: PDF_A4_LANDSCAPE.md');
console.log('');
console.log('=== PDF CONVERSION INSTRUCTIONS ===');
console.log('1. Open PDF_A4_LANDSCAPE.md in VS Code');
console.log('2. Install "Markdown PDF" extension if not installed');
console.log('3. Press Ctrl+Shift+P → "Markdown PDF: Export (pdf)"');
console.log('4. OR use Print to PDF with these settings:');
console.log('   - Layout: Landscape');
console.log('   - Paper: A4');
console.log('   - Margins: Minimum');
console.log('   - Scale: 80-90%');
