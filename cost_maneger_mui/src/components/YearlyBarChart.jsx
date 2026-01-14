/**
 * YearlyBarChart Component - Bar chart visualization of monthly expenses
 * Displays spending trends across all months of selected year
 * Used in Dashboard Tab 2 (Yearly Overview)
 */

import {
    Box,
    Paper,
    Typography,
    Alert
} from '@mui/material';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { MONTHS } from '../utils/constants';

/**
 * YearlyBarChart function for visualizing monthly expenses across a year
 * @param {Object} props - Component props
 * @param {Array} props.monthlyData - Array of monthly expense objects with amount and month
 * @param {number} props.selectedYear - Selected year for display
 * @param {string} props.displayCurrency - Currency code for amount display
 * @param {Function} props.formatCurrency - Function to format amount as currency string
 * @returns {JSX.Element} Bar chart component showing monthly spending trends
 */
const YearlyBarChart = ({
                            monthlyData,
                            selectedYear,
                            displayCurrency,
                            formatCurrency
                        }) => {
    return (
        <Paper elevation={2} sx={{ p: { xs: 1.5, sm: 2, md: 3 }, borderRadius: 2 }}>
            {/* Chart title with selected year */}
            <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                Monthly Expenses - {selectedYear}
            </Typography>

            {/* Display empty state if no data or all amounts are zero */}
            {!monthlyData || monthlyData.length === 0 || monthlyData.every(item => item.amount === 0) ? (
                <Alert severity="info">
                    No data available for {selectedYear}
                </Alert>
            ) : (
                /* Responsive container for bar chart visualization */
                <Box sx={{ width: '100%', height: { xs: 280, sm: 350, md: 400 } }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            // Transform data to include abbreviated month names for X-axis labels
                            data={monthlyData.map(item => ({
                                ...item,
                                // Convert month number (1-12) to abbreviated month name (Jan, Feb, etc.)
                                monthName: MONTHS[item.month - 1] ? MONTHS[item.month - 1].substring(0, 3) : `M${item.month}`
                            }))}
                            margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
                        >
                            {/* Grid lines for easier value reading */}
                            <CartesianGrid strokeDasharray="3 3" />
                            {/* X-axis with month abbreviations - show all months without skipping */}
                            <XAxis
                                dataKey="monthName"
                                tick={{ fontSize: 10 }}
                                interval={0}
                            />
                            {/* Y-axis for amount values with compact width */}
                            <YAxis tick={{ fontSize: 10 }} width={50} />
                            {/* Tooltip showing formatted currency values on hover */}
                            <Tooltip formatter={(value) => formatCurrency(value)} />
                            {/* Legend showing currency code */}
                            <Legend wrapperStyle={{ fontSize: '12px' }} />
                            {/* Bar chart with amount data and currency label */}
                            <Bar dataKey="amount" fill="#0088FE" name={`Amount (${displayCurrency})`} />
                        </BarChart>
                    </ResponsiveContainer>
                </Box>
            )}
        </Paper>
    );
};

export default YearlyBarChart;