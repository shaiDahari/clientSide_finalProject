# Final Project Submission Checklist

## Pre-Submission Tasks

### Code Cleanup
- [ ] Remove console.log statements from production code
  - Check: `src/utils/idb.js` (lines 306-307, 311)
  - Check: Any other files with console.log

### File Preparation
- [ ] Rename `vanilla/idb_vanilla.js` to `idb.js` for submission
- [ ] Verify vanilla idb.js works with test HTML
- [ ] Test all components in development mode
- [ ] Build production version: `npm run build`

### Deployment
- [ ] Deploy to web server (e.g., render.com, Netlify, Vercel)
- [ ] Test deployed application on Google Chrome (latest version)
- [ ] Verify all features work:
  - [ ] Add cost items
  - [ ] View monthly report
  - [ ] View pie chart
  - [ ] View bar chart
  - [ ] Currency conversion (default URL)
  - [ ] Settings page with custom URL
- [ ] Get deployment URL

### Video Creation
- [ ] Create short video (up to 60 seconds)
- [ ] Show key features:
  - Adding a cost item
  - Viewing reports/charts
  - Currency conversion
  - Settings page
- [ ] Upload to YouTube as unlisted video
- [ ] Get video URL

### PDF Creation
- [ ] Create PDF with header information:
  - [ ] Team manager name
  - [ ] All team members (Name, ID, Mobile, Email)
  - [ ] Clickable video link
  - [ ] Collaborative tools summary (max 100 words)
  - [ ] Additional comments/guidelines (optional)
- [ ] Include all user-coded files:
  - [ ] Components (7 files)
  - [ ] Utils (3 files)
  - [ ] App.jsx
  - [ ] CSS files (if modified)
- [ ] Verify:
  - [ ] File names clearly displayed
  - [ ] No broken lines in code
  - [ ] Code is readable
  - [ ] Proper organization
- [ ] Name PDF: `[firstname]_[lastname].pdf` (lowercase, underscore)

### ZIP File Creation
- [ ] Delete `node_modules/` folder
- [ ] Create ZIP file with entire project
- [ ] Verify ZIP contains:
  - [ ] All source code
  - [ ] Configuration files
  - [ ] README (if exists)
  - [ ] No node_modules

### idb.js File
- [ ] Copy vanilla version to root as `idb.js`
- [ ] Verify it works with test HTML
- [ ] Ensure it's a separate file (not in ZIP)

## Submission Files (3 Total)

1. **PDF File**
   - Name: `[firstname]_[lastname].pdf`
   - Contains: Team info, video link, all code files

2. **idb.js File**
   - Name: `idb.js`
   - Vanilla version (no modules)
   - Separate file (not in ZIP)

3. **ZIP File**
   - Name: `[project_name].zip`
   - Contains: Entire project (no node_modules)

## Final Verification

### Code Style
- [ ] Comments every 7-8 lines (✅ Verified)
- [ ] No `var` declarations (✅ Verified)
- [ ] Uses `===` not `==` (✅ Verified)
- [ ] Proper naming conventions (✅ Verified)

### Requirements
- [ ] Add cost items (✅ Verified)
- [ ] Monthly report (✅ Verified)
- [ ] Pie chart (✅ Verified)
- [ ] Bar chart (✅ Verified)
- [ ] Currency conversion (✅ Verified)
- [ ] Settings page (✅ Verified)
- [ ] IndexedDB database (✅ Verified)
- [ ] React + MUI (✅ Verified)
- [ ] Vanilla idb.js (✅ Verified)

### Submission
- [ ] Fill form: https://forms.gle/6Fv4z95dr5R5F9Fn8
- [ ] Upload 3 files to Moodle:
  - [ ] PDF file
  - [ ] idb.js file
  - [ ] ZIP file
- [ ] Submit before deadline: Sunday, January 15, 23:30
  - **Note:** Treat deadline as 23:00 (30 minutes earlier)

## Important Notes

1. **Only Team Manager Submits**
   - Other team members don't need to submit
   - All files must be submitted by team manager

2. **Deadline**
   - Sunday, January 15, 23:30
   - Treat as 23:00 due to server time difference
   - Late submissions won't be accepted

3. **Testing**
   - Project will be tested on Google Chrome (latest version)
   - Vanilla idb.js will be tested with provided HTML
   - Ensure deployment works correctly

4. **Common Rejection Reasons**
   - Missing comments
   - Using `var` instead of `const`/`let`
   - Using `==` instead of `===`
   - Broken lines in PDF
   - Missing file names in PDF
   - Wrong PDF naming format
   - Missing video link
   - Missing team member information

## Quick Reference

### File Locations
- React idb.js: `cost_maneger_mui/src/utils/idb.js`
- Vanilla idb.js: `vanilla/idb_vanilla.js` → Copy to `idb.js` for submission
- Components: `cost_maneger_mui/src/components/`
- Utils: `cost_maneger_mui/src/utils/`

### Key URLs
- Submission form: https://forms.gle/6Fv4z95dr5R5F9Fn8
- Default exchange rates: https://shaidahari.github.io/exchaneRates_json/exchange-rates.json
- Style guide: http://www.abelski.com/courses/stylejs/languagerules.pdf

### Testing
- Test vanilla idb.js: Use `vanilla/test.html` or provided test code
- Test deployment: Open in Google Chrome and verify all features
- Test PDF: Open and verify all code is visible, no broken lines

