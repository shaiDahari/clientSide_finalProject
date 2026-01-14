/**
 * Dashboard Component - Main data visualization and reporting interface
 * Displays monthly expense reports, category pie charts, and yearly bar charts
 * Handles currency conversion and responsive design for mobile/desktop
 */

import { useState, useEffect } from 'react';
import { Box, Paper, Typography, TextField, MenuItem,
    Grid, CircularProgress, Alert, Tabs, Tab
} from '@mui/material';
import { openCostsDB } from '../utils/idb';
import { fetchAndConvertWithUrl } from '../utils/helperFunctions';
import DashboardFilters from './DashboardFilters';
import MonthlyCostTable from './MonthlyCostTable';
import CategoryPieChart from "./CategoryPieChart.jsx";
import YearlyBarChart from "./YearlyBarChart.jsx";

/**
 * Main Dashboard component with expense tracking and visualization
 * @param {Object} props - Component props
 * @param {any} props.refreshTrigger - Dependency for triggering data refresh
 * @param {Object} props.refreshTrigger - Triggers data reload when changed
 * @returns {JSX.Element} Dashboard component with tabbed interface
 */
const Dashboard = ({ refreshTrigger }) => {
    // Filter state - user-selected time period and currency
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [displayCurrency, setDisplayCurrency] = useState('USD');
    const [activeTab, setActiveTab] = useState(0);

    // Data state - holds processed expense information
    const [monthlyCosts, setMonthlyCosts] = useState([]);
    const [allCosts, setAllCosts] = useState([]);
    const [categoryData, setCategoryData] = useState([]);
    const [monthlyData, setMonthlyData] = useState([]);

    // UI state - manages loading and error display
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [monthlyTotal, setMonthlyTotal] = useState(0);

    /**
     * Effect hook to reload data when filters or refresh trigger changes
     * Monitors: selectedMonth, selectedYear, displayCurrency, refreshTrigger
     */
    useEffect(() => {
        loadData();
    }, [selectedMonth, selectedYear, displayCurrency, refreshTrigger]);

    /**
     * Effect hook to recalculate monthly total when costs or currency changes
     * Updates total whenever monthlyCosts or displayCurrency changes
     */
    useEffect(() => {
        const updateTotal = async () => {
            // Calculate total only if we have cost data
            if (monthlyCosts.length > 0) {
                const total = await calculateTotal();
                setMonthlyTotal(total);
            } else {
                setMonthlyTotal(0); // Reset to zero for empty months
            }
        };
        updateTotal();
    }, [monthlyCosts, displayCurrency]);

    /**
     * Fetch and process cost data from IndexedDB
     * Loads monthly costs, chart data with currency conversion
     */
    const loadData = async () => {
        // Initialize loading state and clear previous errors
        setLoading(true);
        setError(null);


        // Open database connection
        const db = await openCostsDB("costsdb", 1);
        //await db.setSetting('exchangeRateUrl', DEFAULT_EXCHANGE_URL);


        try {
            // Fetch all costs and monthly costs concurrently for performance
            const [allCostsData, monthCostsData] = await Promise.all([
                db.getAllCosts(),
                db.getCostsByMonth(selectedMonth, selectedYear)
            ]);

            // Store all costs for potential future use
            setAllCosts(allCostsData);

            // Convert monthly costs to display currency with current exchange rates
            const costsWithConverted = await fetchAndConvertWithUrl(db, monthCostsData, displayCurrency);
            setMonthlyCosts(costsWithConverted);

            // Generate category breakdown data for pie chart visualization
            const categoryData = await db.getPieChartData(selectedYear, selectedMonth + 1, displayCurrency);
            setCategoryData(categoryData);

            // Generate yearly overview data for bar chart visualization
            const monthlyData = await db.getBarChartData(selectedYear, displayCurrency);
            setMonthlyData(monthlyData);

        } catch (err) {
            // Handle and display any data loading errors
            setError(`Failed to load data: ${err.message}`);
        } finally {
            // Ensure loading state is cleared regardless of success/failure
            setLoading(false);
        }
    };

    /**
     * Calculate total amount for monthly costs in display currency
     * @returns {Promise<number>} Total amount in selected display currency
     */
    const calculateTotal = async () => {
        try {
            // Open database connection for exchange rate access
            const db = await openCostsDB("costsdb", 1);

            // Convert all monthly costs to display currency
            const costsWithConverted = await fetchAndConvertWithUrl(db, monthlyCosts, displayCurrency);

            // Sum all converted amounts for monthly total
            return costsWithConverted.reduce((total, cost) => total + cost.convertedAmount, 0);
        } catch (error) {
            // Log error and return zero as safe fallback
            console.error('Error calculating total:', error);
            return 0;
        }
    };

    /**
     * Format currency amount for display with proper symbols and locale
     * Handles invalid amounts and unsupported currency codes gracefully
     * @param {number} amount - Amount to format
     * @returns {string} Formatted currency string
     */
    const formatCurrency = (amount) => {
        // Sanitize input amount to prevent display errors
        if (amount === undefined || amount === null || isNaN(amount)) {
            amount = 0;
        }

        try {
            // Use browser's Intl API for proper currency formatting
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: displayCurrency
            }).format(amount);
        } catch (error) {
            // Fallback formatting for unsupported currency codes (e.g., EURO)
            const symbol = displayCurrency === 'EURO' ? '€' : displayCurrency;
            return `${symbol}${amount.toFixed(2)}`;
        }
    };

    /**
     * Format date string for user-friendly display
     * @param {string} dateString - ISO date string or date-compatible string
     * @returns {string} Formatted date in 'MMM DD, YYYY' format
     */
    const formatDate = (dateString) => {
        // Convert to Date object and format for display
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Generate year options for dropdown (current year and 5 previous years)
    const yearOptions = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i);

    // Display loading spinner while data is being fetched
    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
            {/* Filter controls for month, year, and currency selection */}
            <DashboardFilters
                selectedMonth={selectedMonth}
                setSelectedMonth={setSelectedMonth}
                selectedYear={selectedYear}
                setSelectedYear={setSelectedYear}
                displayCurrency={displayCurrency}
                setDisplayCurrency={setDisplayCurrency}
                yearOptions={yearOptions}
            />

            {/* Display error message if data loading fails */}
            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {/* Tab navigation for switching between different dashboard views */}
            <Paper elevation={2} sx={{ mb: { xs: 2, sm: 3 }, borderRadius: 2 }}>
                <Tabs
                    value={activeTab}
                    onChange={(e, newValue) => setActiveTab(newValue)}
                    variant="fullWidth"
                    sx={{
                        '& .MuiTab-root': {
                            fontSize: { xs: '0.7rem', sm: '0.875rem' },
                            minHeight: { xs: 48, sm: 56 },
                            py: { xs: 1, sm: 1.5 },
                            px: { xs: 0.5, sm: 2 }
                        }
                    }}
                >
                    {/* Tab 0: Monthly Report - shows full expense table */}
                    <Tab label={<Box sx={{ display: { xs: 'none', sm: 'block' } }}>Monthly Report</Box>}
                         icon={<Box sx={{ display: { xs: 'block', sm: 'none' }, fontSize: '0.75rem' }}>Report</Box>} />
                    {/* Tab 1: Category Chart - shows pie chart breakdown */}
                    <Tab label={<Box sx={{ display: { xs: 'none', sm: 'block' } }}>Category Chart</Box>}
                         icon={<Box sx={{ display: { xs: 'block', sm: 'none' }, fontSize: '0.75rem' }}>Categories</Box>} />
                    {/* Tab 2: Yearly Overview - shows bar chart of monthly trends */}
                    <Tab label={<Box sx={{ display: { xs: 'none', sm: 'block' } }}>Yearly Overview</Box>}
                         icon={<Box sx={{ display: { xs: 'block', sm: 'none' }, fontSize: '0.75rem' }}>Yearly</Box>} />
                </Tabs>
            </Paper>

            {/* Tab 0: Monthly Report - detailed expense table with summary */}
            {activeTab === 0 && (
                <MonthlyCostTable
                    monthlyCosts={monthlyCosts}
                    monthlyTotal={monthlyTotal}
                    selectedMonth={selectedMonth}
                    selectedYear={selectedYear}
                    displayCurrency={displayCurrency}
                    formatCurrency={formatCurrency}
                    formatDate={formatDate}
                />
            )}

            {/* Tab 1: Category Pie Chart - visual breakdown by expense category */}
            {activeTab === 1 && (
                <CategoryPieChart
                    categoryData={categoryData}
                    selectedMonth={selectedMonth}
                    selectedYear={selectedYear}
                    formatCurrency={formatCurrency}
                />
            )}

            {/* Tab 2: Yearly Bar Chart - monthly spending trends for selected year */}
            {activeTab === 2 && (
                <YearlyBarChart
                    monthlyData={monthlyData}
                    selectedYear={selectedYear}
                    displayCurrency={displayCurrency}
                    formatCurrency={formatCurrency}
                />
            )}
        </Box>
    );
};

export default Dashboard;
