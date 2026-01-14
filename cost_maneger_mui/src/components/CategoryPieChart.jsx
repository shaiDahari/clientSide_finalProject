/**
 * CategoryPieChart Component - Pie chart visualization of expenses by category
 * Displays category breakdown and legend for selected month
 */

import {
    Box,
    Paper,
    Typography,
    Alert,
    Grid
} from '@mui/material';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip, BarChart, CartesianGrid, XAxis, YAxis, Legend, Bar
} from 'recharts';
import { MONTHS, COLORS } from '../utils/constants';

const CategoryPieChart = ({
                              categoryData,
                              selectedMonth,
                              selectedYear,
                              formatCurrency
                          }) => {
    return (
        <Paper elevation={2} sx={{ p: { xs: 1.5, sm: 2, md: 3 }, borderRadius: 2 }}>
            {/* Tab 1: Category Pie Chart */}
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
        </Paper>
    );
};

export default CategoryPieChart;