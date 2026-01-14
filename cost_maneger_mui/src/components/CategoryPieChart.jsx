/**
 * CategoryPieChart Component - Pie chart visualization of expenses by category
 * Displays category breakdown and legend for selected month
 * Used in Dashboard Tab 1 (Category Chart)
 */

import { Box, Paper, Typography, Alert, Grid } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { MONTHS, COLORS } from '../utils/constants';

/**
 * CategoryPieChart function for displaying expense breakdown by category
 * @param {Object} props - Component props
 * @param {Array} props.categoryData - Array of category objects with category name and amount
 * @param {number} props.selectedMonth - Selected month index (0-11)
 * @param {number} props.selectedYear - Selected year (e.g., 2025)
 * @param {Function} props.formatCurrency - Function to format amount as currency string
 * @returns {JSX.Element} Pie chart with category legend
 */
const CategoryPieChart = ({
                              categoryData,
                              selectedMonth,
                              selectedYear,
                              formatCurrency
                          }) => {
    return (
        <Paper elevation={2} sx={{ p: { xs: 1.5, sm: 2, md: 3 }, borderRadius: 2 }}>
            {/* Chart title with selected month and year */}
            <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                Expenses by Category - {MONTHS[selectedMonth]} {selectedYear}
            </Typography>

            {/* Display empty state message if no category data available */}
            {categoryData.length === 0 ? (
                <Alert severity="info">
                    No data available for the selected month
                </Alert>
            ) : (
                <>
                    {/* Responsive container for pie chart visualization */}
                    <Box sx={{ width: '100%', height: { xs: 280, sm: 350, md: 400 } }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    // Transform category data to Recharts format (requires 'name' and 'value' keys)
                                    data={categoryData.map(item => ({
                                        ...item,
                                        name: item.category || item.name || 'Unknown',
                                        value: item.amount || item.value || 0
                                    }))}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    // Custom label function to show category name and percentage
                                    label={({ name, percent }) => {
                                        // Truncate long category names for better readability
                                        const shortName = name.length > 10 ? name.substring(0, 10) + '...' : name;
                                        return `${shortName} (${(percent * 100).toFixed(0)}%)`;
                                    }}
                                    outerRadius="70%"
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {/* Assign colors to pie chart segments using color palette */}
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                {/* Format tooltip values as currency when hovering over segments */}
                                <Tooltip formatter={(value) => formatCurrency(value)} />
                            </PieChart>
                        </ResponsiveContainer>
                    </Box>

                    {/* Category Legend - displays color-coded category list with amounts */}
                    <Grid container spacing={{ xs: 1, sm: 2 }} sx={{ mt: { xs: 1, sm: 2 } }}>
                        {categoryData.map((item, index) => (
                            <Grid item xs={6} sm={4} md={3} key={item.category}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    {/* Color indicator box matching pie chart segment color */}
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
                                    {/* Category name and formatted amount display */}
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
    );
};

export default CategoryPieChart;