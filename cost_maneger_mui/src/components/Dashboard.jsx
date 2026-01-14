/**
 * Dashboard Component - Main data visualization and reporting interface
 * Displays monthly expense reports, category pie charts, and yearly bar charts
 * Handles currency conversion and responsive design for mobile/desktop
 * @param {Object} props.refreshTrigger - Triggers data reload when changed
 * @returns {JSX.Element} Dashboard component with tabbed interface
 */

import { useState, useEffect } from 'react';
import { Box, Paper, Typography, TextField, MenuItem,
    Grid, Card, CardContent, CircularProgress, Alert,
    Table, TableBody, TableCell, TableContainer, TableHead,
    TableRow, Chip, Tabs, Tab
} from '@mui/material';
import { PieChart, Pie, Cell, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip,
    Legend, ResponsiveContainer
} from 'recharts';
import { openCostsDB } from '../utils/idb';
import { fetchAndConvertWithUrl } from '../utils/helperFunctions';

// Color palette for chart visualization - 10 distinct colors
const COLORS = [
    '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8',
    '#82CA9D', '#FFC658', '#FF6B9D', '#C780E8', '#4ECDC4'
];

// Month names for user-friendly date display
const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * Main Dashboard component with expense tracking and visualization
 * @param {Object} props - Component props
 * @param {any} props.refreshTrigger - Dependency for triggering data refresh
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

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
            {/* Filters */}
            <Paper elevation={2} sx={{ p: { xs: 1.5, sm: 2, md: 3 }, mb: { xs: 2, sm: 3 }, borderRadius: 2 }}>
                <Grid container spacing={{ xs: 1.5, sm: 2 }} alignItems="center">
                    <Grid item xs={4} sm={4}>
                        <TextField
                            fullWidth
                            select
                            label="Month"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            size="small"
                            InputLabelProps={{ sx: { fontSize: { xs: '0.8rem', sm: '1rem' } } }}
                        >
                            {MONTHS.map((month, index) => (
                                <MenuItem key={month} value={index}>
                                    <Box sx={{ display: { xs: 'none', sm: 'block' } }}>{month}</Box>
                                    <Box sx={{ display: { xs: 'block', sm: 'none' } }}>{month.substring(0, 3)}</Box>
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    <Grid item xs={4} sm={4}>
                        <TextField
                            fullWidth
                            select
                            label="Year"
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            size="small"
                            InputLabelProps={{ sx: { fontSize: { xs: '0.8rem', sm: '1rem' } } }}
                        >
                            {yearOptions.map((year) => (
                                <MenuItem key={year} value={year}>
                                    {year}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    <Grid item xs={4} sm={4}>
                        <TextField
                            fullWidth
                            select
                            label="Currency"
                            value={displayCurrency}
                            onChange={(e) => setDisplayCurrency(e.target.value)}
                            size="small"
                            InputLabelProps={{ sx: { fontSize: { xs: '0.8rem', sm: '1rem' } } }}
                        >
                            {['USD', 'EURO', 'GBP', 'ILS'].map((currency) => (
                                <MenuItem key={currency} value={currency}>
                                    {currency}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                </Grid>
            </Paper>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {/* Tabs for different views */}
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
                    <Tab label={<Box sx={{ display: { xs: 'none', sm: 'block' } }}>Monthly Report</Box>}
                        icon={<Box sx={{ display: { xs: 'block', sm: 'none' }, fontSize: '0.75rem' }}>Report</Box>} />
                    <Tab label={<Box sx={{ display: { xs: 'none', sm: 'block' } }}>Category Chart</Box>}
                        icon={<Box sx={{ display: { xs: 'block', sm: 'none' }, fontSize: '0.75rem' }}>Categories</Box>} />
                    <Tab label={<Box sx={{ display: { xs: 'none', sm: 'block' } }}>Yearly Overview</Box>}
                        icon={<Box sx={{ display: { xs: 'block', sm: 'none' }, fontSize: '0.75rem' }}>Yearly</Box>} />
                </Tabs>
            </Paper>

            {/* Tab 0: Monthly Report */}
            {activeTab === 0 && (
                <Box>
                    <Card sx={{ mb: { xs: 2, sm: 3 }, borderRadius: 2 }}>
                        <CardContent sx={{ p: { xs: 2, sm: 3 }, '&:last-child': { pb: { xs: 2, sm: 3 } } }}>
                            <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                                {MONTHS[selectedMonth]} {selectedYear} Summary
                            </Typography>
                            <Typography variant="h4" color="primary" sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}>
                                {formatCurrency(monthlyTotal)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Total expenses ({monthlyCosts.length} transactions)
                            </Typography>
                        </CardContent>
                    </Card>

                    {monthlyCosts.length === 0 ? (
                        <Alert severity="info">
                            No expenses recorded for {MONTHS[selectedMonth]} {selectedYear}
                        </Alert>
                    ) : (
                        <TableContainer component={Paper} sx={{ borderRadius: 2, maxHeight: { xs: 400, sm: 'none' } }}>
                            <Table size="small" stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, py: { xs: 1, sm: 2 } }}>Date</TableCell>
                                        <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, py: { xs: 1, sm: 2 }, display: { xs: 'none', md: 'table-cell' } }}>Category</TableCell>
                                        <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, py: { xs: 1, sm: 2 } }}>Description</TableCell>
                                        <TableCell align="right" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, py: { xs: 1, sm: 2 } }}>Amount</TableCell>
                                        <TableCell align="right" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, py: { xs: 1, sm: 2 } }}>{displayCurrency}</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {monthlyCosts.map((cost) => {
                                        const convertedAmount = cost.convertedAmount;
                                        return (
                                            <TableRow key={cost.id} hover>
                                                <TableCell sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' }, py: { xs: 0.75, sm: 1.5 } }}>
                                                    {formatDate(cost.date)}
                                                </TableCell>
                                                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' }, py: { xs: 0.75, sm: 1.5 } }}>
                                                    <Chip label={cost.category} size="small" color="primary" variant="outlined" />
                                                </TableCell>
                                                <TableCell sx={{
                                                    fontSize: { xs: '0.7rem', sm: '0.875rem' },
                                                    py: { xs: 0.75, sm: 1.5 },
                                                    maxWidth: { xs: 100, sm: 200 },
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                    {cost.description}
                                                </TableCell>
                                                <TableCell align="right" sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' }, py: { xs: 0.75, sm: 1.5 } }}>
                                                    {cost.sum.toFixed(2)} {cost.currency}
                                                </TableCell>
                                                <TableCell align="right" sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' }, py: { xs: 0.75, sm: 1.5 }, fontWeight: 600 }}>
                                                    {formatCurrency(convertedAmount)}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Box>
            )}

            {/* Tab 1: Category Pie Chart */}
            {activeTab === 1 && (
                <Paper elevation={2} sx={{ p: { xs: 1.5, sm: 2, md: 3 }, borderRadius: 2 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                        Expenses by Category - {MONTHS[selectedMonth]} {selectedYear}
                    </Typography>

                    {categoryData.length === 0 ? (
                        <Alert severity="info">
                            No data available for the selected month
                        </Alert>
                    ) : (
                        <>
                            <Box sx={{ width: '100%', height: { xs: 280, sm: 350, md: 400 } }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={categoryData.map(item => ({
                                                ...item,
                                                name: item.category || item.name || 'Unknown',
                                                value: item.amount || item.value || 0
                                            }))}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => {
                                                const shortName = name.length > 10 ? name.substring(0, 10) + '...' : name;
                                                return `${shortName} (${(percent * 100).toFixed(0)}%)`;
                                            }}
                                            outerRadius="70%"
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {categoryData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => formatCurrency(value)} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </Box>

                            {/* Category Legend */}
                            <Grid container spacing={{ xs: 1, sm: 2 }} sx={{ mt: { xs: 1, sm: 2 } }}>
                                {categoryData.map((item, index) => (
                                    <Grid item xs={6} sm={4} md={3} key={item.category}>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Box
                                                sx={{
                                                    width: { xs: 12, sm: 16 },
                                                    height: { xs: 12, sm: 16 },
                                                    bgcolor: COLORS[index % COLORS.length],
                                                    mr: 1,
                                                    borderRadius: 0.5,
                                                    flexShrink: 0
                                                }}
                                            />
                                            <Typography variant="body2" sx={{
                                                fontSize: { xs: '0.7rem', sm: '0.875rem' },
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {item.category}: {formatCurrency(item.amount)}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                ))}
                            </Grid>
                        </>
                    )}
                </Paper>
            )}

            {/* Tab 2: Yearly Bar Chart */}
            {activeTab === 2 && (
                <Paper elevation={2} sx={{ p: { xs: 1.5, sm: 2, md: 3 }, borderRadius: 2 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                        Monthly Expenses - {selectedYear}
                    </Typography>

                    {!monthlyData || monthlyData.length === 0 || monthlyData.every(item => item.amount === 0) ? (
                        <Alert severity="info">
                            No data available for {selectedYear}
                        </Alert>
                    ) : (
                        <Box sx={{ width: '100%', height: { xs: 280, sm: 350, md: 400 } }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={monthlyData.map(item => ({
                                        ...item,
                                        monthName: MONTHS[item.month - 1] ? MONTHS[item.month - 1].substring(0, 3) : `M${item.month}`
                                    }))}
                                    margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="monthName"
                                        tick={{ fontSize: 10 }}
                                        interval={0}
                                    />
                                    <YAxis tick={{ fontSize: 10 }} width={50} />
                                    <Tooltip formatter={(value) => formatCurrency(value)} />
                                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                                    <Bar dataKey="amount" fill="#0088FE" name={`Amount (${displayCurrency})`} />
                                </BarChart>
                            </ResponsiveContainer>
                        </Box>
                    )}
                </Paper>
            )}
        </Box>
    );
};

export default Dashboard;
