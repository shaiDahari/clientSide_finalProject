/**
 * Dashboard Component
 * Displays monthly reports, pie charts by category, and bar charts by month
 */

import { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    MenuItem,
    Grid,
    Card,
    CardContent,
    CircularProgress,
    Alert,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Tabs,
    Tab
} from '@mui/material';
import {
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { openCostsDB, convertCurrency, fetchAndConvert } from '../utils/idb';

// Color palette for charts
const COLORS = [
    '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8',
    '#82CA9D', '#FFC658', '#FF6B9D', '#C780E8', '#4ECDC4'
];

// Months for display
const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const Dashboard = ({ refreshTrigger }) => {
    // State for selected filters
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [displayCurrency, setDisplayCurrency] = useState('USD');
    const [activeTab, setActiveTab] = useState(0);

    // Data state
    const [monthlyCosts, setMonthlyCosts] = useState([]);
    const [allCosts, setAllCosts] = useState([]);
    const [categoryData, setCategoryData] = useState([]);
    const [monthlyData, setMonthlyData] = useState([]);

    // UI state
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [monthlyTotal, setMonthlyTotal] = useState(0);

    /**
     * Load costs from IndexedDB
     * Fetches data on component mount and when refreshTrigger changes
     */
    useEffect(() => {
        loadData();
    }, [selectedMonth, selectedYear, displayCurrency, refreshTrigger]);

    useEffect(() => {
        const updateTotal = async () => {
            if (monthlyCosts.length > 0) {
                const total = await calculateTotal();
                setMonthlyTotal(total);
            } else {
                setMonthlyTotal(0);
            }
        };
        updateTotal();
    }, [monthlyCosts, displayCurrency]);

    /**
     * Fetch and process cost data
     */
    const loadData = async () => {
        setLoading(true);
        setError(null);
        const db = await openCostsDB("costsdb", 1);

        try {
            //Fetch all costs and monthly costs in parallel
            const [allCostsData, monthCostsData] = await Promise.all([
                db.getAllCosts(),
                db.getCostsByMonth(selectedMonth, selectedYear)
            ]);

            setAllCosts(allCostsData);
            const costsWithConverted = await fetchAndConvert(
                monthCostsData,
                displayCurrency,
                db.getExchangeRatesUrl
            );
            setMonthlyCosts(costsWithConverted);

            //Process category data for pie chart using database function
            const categoryData = await db.getPieChartData(selectedYear, selectedMonth + 1, displayCurrency);
            setCategoryData(categoryData);

            //Process monthly data for bar chart using database function
            const monthlyData = await db.getBarChartData(selectedYear, displayCurrency);
            setMonthlyData(monthlyData);

        } catch (err) {
            setError(`Failed to load data: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Calculate total for monthly costs
     */
    const calculateTotal = async () => {
        try {
            const db = await openCostsDB("costsdb", 1);
            const costsWithConverted = await fetchAndConvert(
                monthlyCosts,
                displayCurrency,
                db.getExchangeRatesUrl
            );
            return costsWithConverted.reduce((total, cost) => total + cost.convertedAmount, 0);
        } catch (error) {
            console.error('Error calculating total:', error);
            return 0;
        }
    };

    /**
     * Format currency for display
     */
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: displayCurrency
        }).format(amount);
    };

    /**
     * Format date for display
     */
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Generate year options (current year and 5 years back)
    const yearOptions = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            {/* Filters */}
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={4}>
                        <TextField
                            fullWidth
                            select
                            label="Month"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                        >
                            {MONTHS.map((month, index) => (
                                <MenuItem key={month} value={index}>
                                    {month}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    <Grid item xs={12} sm={4}>
                        <TextField
                            fullWidth
                            select
                            label="Year"
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                        >
                            {yearOptions.map((year) => (
                                <MenuItem key={year} value={year}>
                                    {year}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    <Grid item xs={12} sm={4}>
                        <TextField
                            fullWidth
                            select
                            label="Display Currency"
                            value={displayCurrency}
                            onChange={(e) => setDisplayCurrency(e.target.value)}
                        >
                            {['USD', 'EUR', 'GBP', 'ILS'].map((currency) => (
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
            <Paper elevation={2} sx={{ mb: 3 }}>
                <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
                    <Tab label="Monthly Report" />
                    <Tab label="Category Chart" />
                    <Tab label="Yearly Overview" />
                </Tabs>
            </Paper>

            {/* Tab 0: Monthly Report */}
            {activeTab === 0 && (
                <Box>
                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                {MONTHS[selectedMonth]} {selectedYear} Summary
                            </Typography>
                            <Typography variant="h4" color="primary">
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
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Date</TableCell>
                                        <TableCell>Category</TableCell>
                                        <TableCell>Description</TableCell>
                                        <TableCell align="right">Amount</TableCell>
                                        <TableCell align="right">In {displayCurrency}</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {monthlyCosts.map((cost) => {
                                        const convertedAmount = cost.convertedAmount;
                                        return (
                                            <TableRow key={cost.id}>
                                                <TableCell>{formatDate(cost.date)}</TableCell>
                                                <TableCell>
                                                    <Chip label={cost.category} size="small" color="primary" variant="outlined" />
                                                </TableCell>
                                                <TableCell>{cost.description}</TableCell>
                                                <TableCell align="right">
                                                    {cost.sum.toFixed(2)} {cost.currency}
                                                </TableCell>
                                                <TableCell align="right">
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
                <Paper elevation={2} sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Expenses by Category - {MONTHS[selectedMonth]} {selectedYear}
                    </Typography>

                    {categoryData.length === 0 ? (
                        <Alert severity="info">
                            No data available for the selected month
                        </Alert>
                    ) : (
                        <>
                            <ResponsiveContainer width="100%" height={400}>
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                        outerRadius={120}
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

                            {/* Category Legend */}
                            <Grid container spacing={2} sx={{ mt: 2 }}>
                                {categoryData.map((item, index) => (
                                    <Grid item xs={6} sm={4} md={3} key={item.category}>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Box
                                                sx={{
                                                    width: 16,
                                                    height: 16,
                                                    bgcolor: COLORS[index % COLORS.length],
                                                    mr: 1,
                                                    borderRadius: 1
                                                }}
                                            />
                                            <Typography variant="body2">
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
                <Paper elevation={2} sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Monthly Expenses - {selectedYear}
                    </Typography>

                    {monthlyData.every(item => item.amount === 0) ? (
                        <Alert severity="info">
                            No data available for {selectedYear}
                        </Alert>
                    ) : (
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip formatter={(value) => formatCurrency(value)} />
                                <Legend />
                                <Bar dataKey="amount" fill="#0088FE" name={`Amount (${displayCurrency})`} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </Paper>
            )}
        </Box>
    );
};

export default Dashboard;
