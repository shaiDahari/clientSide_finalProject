/**
 * YearlyBarChart Component - Bar chart visualization of monthly expenses
 * Displays spending trends across all months of selected year
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

const YearlyBarChart = ({
                            monthlyData,
                            selectedYear,
                            displayCurrency,
                            formatCurrency
                        }) => {
    return (
        <Paper elevation={2} sx={{ p: { xs: 1.5, sm: 2, md: 3 }, borderRadius: 2 }}>
            {/* Tab 2: Yearly Bar Chart */}
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
        </Paper>
    );
};

export default YearlyBarChart;