# Final Project Requirements: Cost Manager Application

## Project Overview
**Type:** Frontend Web Application  
**Purpose:** Cost Manager Application  
**Language:** English UI  
**Currency:** USD (United States Dollar)  
**Deadline:** January 18, 2025 at 23:00  
**Development Time:** 22 days remaining (as of December 27, 2024)

## Introduction
The final project includes the development of the front end of a website that works as a cost manager application. The UI will be in English, and the main currency will be USD.

---

## Requirements

### Database
- **Database Type:** IndexedDB database
- **Object Stores:** Free to select as many object stores as needed
- **Storage:** Client-side browser storage (no server required)

### Application Development
- **Languages:** JavaScript, HTML, CSS
- **No TypeScript:** Strictly JavaScript only
- **Frontend Only:** Pure client-side application

### Core Features

#### (1) Add New Cost Items
- **Required Fields:**
  - Sum (amount)
  - Currency
  - Category
  - Description
- **Auto-Generated:**
  - Date: Automatically set to the date when the cost item is added
- **Functionality:** Users can create new expense entries with all required information

#### (2) Monthly Reports
- **Functionality:** Generate detailed reports for specific month and year
- **Currency Selection:** User can select the currency for the report display
- **Filter:** Show all cost items within the selected month/year period

#### (3) Pie Chart Visualization
- **Functionality:** Generate pie chart showing total costs by categories
- **Time Period:** For selected month and year
- **Data Grouping:** Expenses grouped by category with totals
- **User Action:** Click button to generate/display pie chart
- **Purpose:** Visual distribution of expenses across different categories

#### (4) Bar Chart Visualization
- **Functionality:** Generate bar chart showing total costs for each month
- **Time Period:** All twelve months (Jan-Dec) for a user-selected year
- **Data Display:** Monthly expense totals across entire year
- **User Selection:** User chooses specific year for analysis
- **Purpose:** Year-over-year monthly spending pattern visualization

#### (5) Currency Conversion for Charts
- **Scope:** Applies to both pie chart and bar chart
- **Supported Currencies:** USD, ILS, GBP, EURO
- **Currency Symbols:** Use exact currency codes (USD, ILS, GBP, EURO)
- **User Selection:** User can choose display currency for charts
- **Exchange Rates:**
  - Retrieved from server-side using Fetch API
  - Server-side: Custom developed and deployed on web
  - Implementation: Static JSON file on web server is sufficient
  - Real-time conversion based on fetched rates

#### (6) Settings - Custom Exchange Rate URL
- **Feature:** User can specify custom URL for currency exchange rates
- **CORS Support:** Assume URL includes `Access-Control-Allow-Origin: *` header
- **JSON Response Format:**
  ```json
  {"USD":1, "GBP":0.6, "EURO":0.7, "ILS":3.4}
  ```
- **Exchange Rate Logic:**
  - USD is base currency (always 1)
  - All rates relative to USD: ILS 3.4 = USD 1, EURO 0.7 = USD 1, GBP 0.6 = USD 1
- **Flexibility:** User can override default exchange rate source

### Technical Implementation Requirements

#### IndexedDB Library (idb_vanilla.js)
- **Purpose:** Wrapper library for IndexedDB operations
- **Implementation:** Must use Promise objects
- **Two Versions Required:**
  1. **React Module Version:** Compatible with React module system
  2. **Vanilla JS Version:** Simple JS file for testing and submission
- **Testing:** Simple HTML file testing (similar to provided example)
- **Submission:** Vanilla JS version must be submitted separately from ZIP file

### idb_vanilla.js Library Detailed Specification

#### Vanilla Version Requirements
- **Global Object:** When included via `<script>` tag, adds `idb` property to global object
- **Function Definitions:** Must include specific functions according to provided specification

#### Required Functions

##### (2) openCostsDB(databaseName, databaseVersion)
- **Parameters:**
  - `databaseName` (string): Name of the database
  - `databaseVersion` (number): Version number of the database
- **Returns:** Promise object representing asynchronous database connection operation
- **Success Result:** Database object that represents the connected database
- **Purpose:** Establishes connection to IndexedDB database with specified name and version

##### (3) addCost(cost)
- **Parameters:**
  - `cost` (object): Cost item with properties:
    - `sum` (number): Amount
    - `currency` (string): Currency code
    - `category` (string): Expense category
    - `description` (string): Item description
- **Auto-Generated:** Function automatically adds current date when storing
- **Returns:** Promise object representing asynchronous add operation
- **Success Result:** Object representing the newly added cost item with properties:
  - `sum` (number), `currency` (string), `category` (string), `description` (string), `date` (Date object - auto-generated)
- **Storage:** Costs saved in original currency (NO automatic conversion to USD)
- **Date Logic:** All time-based filtering/reports use these auto-generated database dates
- **Purpose:** Adds new expense item to database with automatic timestamping, preserving original currency

##### (4) getReport(year, month, currency)
- **Parameters:**
  - `year` (number): Target year
  - `month` (number): Target month 
  - `currency` (string): Desired display currency for report
- **Returns:** Promise object representing asynchronous report generation operation
- **Success Result:** Report object with structure:
  ```javascript
  {
    year: 2025,
    month: 9,
    costs: [
      {
        sum: 200,
        currency: "USD",
        category: "Food", 
        description: "Milk 3%",
        date: {day: 12}
      },
      {
        sum: 120,
        currency: "GBP",
        category: "Education",
        description: "Zoom License", 
        date: {day: 18}
      }
    ],
    total: {currency: "USD", total: 440}
  }
  ```
- **Logic:** 
  - Individual costs shown in their **original stored currency**
  - Total calculated in **requested display currency** using exchange rates from Fetch API
- **Purpose:** Detailed monthly report preserving original cost currencies while providing converted total

---

## User Interface Requirements

### Frontend Framework
- **Framework:** React
- **UI Library:** MUI (Material-UI)
- **Compatibility:** Desktop web browsers
- **Design:** Responsive design for desktop usage

## Deployment Requirements

### Web Deployment
- **Platform:** Deploy on web server (e.g., https://render.com)
- **Submission:** Team manager fills form with project URL (URL to be specified by teacher)
- **Testing Browser:** Google Chrome (latest version)
- **Requirement:** Project must work perfectly on Google Chrome
- **Accessibility:** Public URL for evaluation

## Code Style Requirements

### JavaScript Style Guide
- **Style Guide:** Follow http://www.abelski.com/courses/stylejs/languagerules.pdf
- **Comments:** Must include appropriate code comments
- **Documentation:** Proper commenting for code readability and maintenance

---

## Submission Guidelines

**Important:** Follow these guidelines carefully. Points deducted for non-compliance.

### 1. Video Demo
- **Duration:** Up to 60 seconds showing project functionality
- **Platform:** Upload to YouTube as **unlisted video**
- **Purpose:** Demonstrate working application

### 2. File Submission (3 files required)
Submit exactly **3 separate files** (NOT a single ZIP):
1. **ZIP file:** Entire project (delete node_modules folder first)
2. **PDF file:** All code files with proper formatting
3. **idb_vanilla.js file:** Vanilla version (separate from ZIP)

### 3. PDF File Requirements
- **Filename:** `firstname_lastname.pdf` (lowercase with underscore)
- **Content:** All coded files with unbroken lines, properly organized
- **Beginning of PDF must include:**
  - Team manager's first and last name
  - Each team member: First name + Last name + ID + Mobile + Email
  - Clickable link to YouTube video
  - Optional: Additional comments/guidelines (like README)
  - **Collaborative tools summary** (max 100 words, minimum 2 tools)

### 4. Submission Details
- **Who submits:** Team manager ONLY
- **Platform:** Moodle assignment box
- **Deadline:** Sunday, January 18, 23:30 (treat as 23:00 due to server time difference)
- **Team requirements:** Must include students from same group
- **Late submissions:** NOT accepted

### 5. Final Meeting
- **Date:** January 19
- **Activities:** Automatic testing + project presentations

---

## Testing Code Sample for idb_vanilla.js

**Note:** This is a sample test. Different code may be used during final grading.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>
<script src="vanilla/idb_vanilla.js"></script>
<script>
    async function test() {
        const db = await idb.openCostsDB("costsdb", 1);
        const result1 =
                await db.addCost({
                    sum: 200, currency: "USD", category: "FOOD",
                    description: "pizza"
                });
        const result2 =
                await db.addCost({
                    sum: 400, currency: "USD", category: "CAR",
                    description: "fuel"
                });
        if (db) {
            console.log("creating db succeeded");
        }
        if (result1) {
            console.log("adding 1st cost item succeeded");
        }
        if (result2) {
            console.log("adding 2nd cost item succeeded");
        }
    }

    test()
</script>
</body>
</html>
```

---

## Questions and Answers

### (1) Additional Functions in idb_vanilla.js
**Question:** Can we add more functions to idb_vanilla.js beyond the three mentioned (openCostsDB, addCost, getReport)?

**Answer:** Yes, you can certainly add more functions in addition to the ones mentioned in the final project document.

### (2) Data Processing for Charts (React version)
**Question:** Where should data processing for bar and pie charts be handled? Inside components or as functions in idb_vanilla.js?

**Answer:** Follow the SRP (Single Responsibility Principle). The idb_vanilla.js is responsible for getting/updating data in the IndexedDB database. Adding functions to that file for generating chart data is certainly an option. Adding a function to idb_vanilla.js for getting required chart data (where code queries database and serves data in required structure) is similar to getting a specific cost item as an object from a defined class.

---

## Technical Specifications

*[To be filled based on complete requirements]*

## Development Timeline

- **Current Date:** December 27, 2024
- **Deadline:** January 18, 2025 at 23:30
- **Time Remaining:** 22 days
- **First Priority:** Develop vanilla idb_vanilla.js library

## Notes
- Document created: December 27, 2024
- Requirements gathering in progress