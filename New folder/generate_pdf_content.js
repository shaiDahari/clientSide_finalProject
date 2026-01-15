// Script to generate PDF-ready content with all code files
const fs = require('fs');
const path = require('path');

const codeFiles = [
    { name: 'cost_maneger_mui/src/App.jsx', display: 'cost_maneger_mui/src/App.jsx' },
    { name: 'cost_maneger_mui/src/index.css', display: 'cost_maneger_mui/src/index.css' },
    { name: 'cost_maneger_mui/src/App.css', display: 'cost_maneger_mui/src/App.css' },
    { name: 'cost_maneger_mui/src/components/CostForm.jsx', display: 'cost_maneger_mui/src/components/CostForm.jsx' },
    { name: 'cost_maneger_mui/src/components/Dashboard.jsx', display: 'cost_maneger_mui/src/components/Dashboard.jsx' },
    { name: 'cost_maneger_mui/src/components/DashboardFilters.jsx', display: 'cost_maneger_mui/src/components/DashboardFilters.jsx' },
    { name: 'cost_maneger_mui/src/components/MonthlyCostTable.jsx', display: 'cost_maneger_mui/src/components/MonthlyCostTable.jsx' },
    { name: 'cost_maneger_mui/src/components/CategoryPieChart.jsx', display: 'cost_maneger_mui/src/components/CategoryPieChart.jsx' },
    { name: 'cost_maneger_mui/src/components/YearlyBarChart.jsx', display: 'cost_maneger_mui/src/components/YearlyBarChart.jsx' },
    { name: 'cost_maneger_mui/src/components/Settings.jsx', display: 'cost_maneger_mui/src/components/Settings.jsx' },
    { name: 'cost_maneger_mui/src/utils/constants.js', display: 'cost_maneger_mui/src/utils/constants.js' },
    { name: 'cost_maneger_mui/src/utils/helperFunctions.js', display: 'cost_maneger_mui/src/utils/helperFunctions.js' },
    { name: 'cost_maneger_mui/src/utils/idb.js', display: 'cost_maneger_mui/src/utils/idb.js' }
];

let content = fs.readFileSync('PDF_SUBMISSION_DOCUMENT.md', 'utf8');

codeFiles.forEach((file, index) => {
    try {
        const fileContent = fs.readFileSync(file.name, 'utf8');
        content += `\n\n================================================================================\n`;
        content += `FILE: ${file.display}\n`;
        content += `================================================================================\n\n`;
        content += fileContent;
        content += `\n\n`;
    } catch (error) {
        console.error(`Error reading ${file.name}:`, error.message);
    }
});

fs.writeFileSync('PDF_SUBMISSION_DOCUMENT_COMPLETE.md', content);
console.log('PDF document generated successfully!');

