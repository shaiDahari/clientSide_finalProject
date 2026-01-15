# Files to Include in PDF Submission

## Complete File List (User-Coded Files Only)

### 1. Components Directory
```
cost_maneger_mui/src/components/CostForm.jsx
cost_maneger_mui/src/components/Dashboard.jsx
cost_maneger_mui/src/components/DashboardFilters.jsx
cost_maneger_mui/src/components/MonthlyCostTable.jsx
cost_maneger_mui/src/components/CategoryPieChart.jsx
cost_maneger_mui/src/components/YearlyBarChart.jsx
cost_maneger_mui/src/components/Settings.jsx
```

### 2. Utils Directory
```
cost_maneger_mui/src/utils/idb.js
cost_maneger_mui/src/utils/helperFunctions.js
cost_maneger_mui/src/utils/constants.js
```

### 3. Root Source Files
```
cost_maneger_mui/src/App.jsx
cost_maneger_mui/src/index.css
cost_maneger_mui/src/App.css
```

### 4. Vanilla Version (For Reference - Submit Separately)
```
vanilla/idb_vanilla.js
```

## Total Files: 13 files

## File Organization Order for PDF

1. **Header Section** (Team info, video link, etc.)

2. **Root Files**
   - App.jsx
   - index.css
   - App.css

3. **Components Directory**
   - CostForm.jsx
   - Dashboard.jsx
   - DashboardFilters.jsx
   - MonthlyCostTable.jsx
   - CategoryPieChart.jsx
   - YearlyBarChart.jsx
   - Settings.jsx

4. **Utils Directory**
   - constants.js
   - helperFunctions.js
   - idb.js

## Files to EXCLUDE

- main.jsx (auto-generated)
- package.json (dependency file)
- package-lock.json (dependency file)
- vite.config.js (build config)
- eslint.config.js (linting config)
- index.html (template)
- Any files in node_modules/
- Any files in dist/
- Any files in public/ (except if you modified them)

## Quick Copy Command (for reference)

To get file list:
```bash
# Components
ls cost_maneger_mui/src/components/*.jsx

# Utils
ls cost_maneger_mui/src/utils/*.js

# Root
ls cost_maneger_mui/src/App.jsx cost_maneger_mui/src/*.css
```

