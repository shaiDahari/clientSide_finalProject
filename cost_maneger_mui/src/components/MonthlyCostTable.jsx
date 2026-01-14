/**
 * MonthlyCostTable Component - Monthly expense report with summary and table
 * Displays total expenses card and detailed cost table with currency conversion
 * Shows original currency amounts and converted amounts in display currency
 */

import {
    Box,
    Card,
    CardContent,
    Typography,
    Alert,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Paper
} from '@mui/material';
import { MONTHS } from '../utils/constants';

/**
 * MonthlyCostTable function for displaying monthly expense summary and details
 * @param {Object} props - Component props
 * @param {Array} props.monthlyCosts - Array of cost objects for selected month
 * @param {number} props.monthlyTotal - Total expenses for the month in display currency
 * @param {number} props.selectedMonth - Selected month index (0-11)
 * @param {number} props.selectedYear - Selected year
 * @param {string} props.displayCurrency - Currency code for converted amounts
 * @param {Function} props.formatCurrency - Function to format amount as currency string
 * @param {Function} props.formatDate - Function to format date string for display
 * @returns {JSX.Element} Monthly expense summary card and detailed cost table
 */
const MonthlyCostTable = ({
                              monthlyCosts,
                              monthlyTotal,
                              selectedMonth,
                              selectedYear,
                              displayCurrency,
                              formatCurrency,
                              formatDate
                          }) => {
    return (
        <Box>
            {/* Summary card displaying total expenses for selected month */}
            <Card sx={{ mb: { xs: 2, sm: 3 }, borderRadius: 2 }}>
                <CardContent sx={{ p: { xs: 2, sm: 3 }, '&:last-child': { pb: { xs: 2, sm: 3 } } }}>
                    {/* Month and year header */}
                    <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                        {MONTHS[selectedMonth]} {selectedYear} Summary
                    </Typography>
                    {/* Total amount in display currency - prominently displayed */}
                    <Typography variant="h4" color="primary" sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}>
                        {formatCurrency(monthlyTotal)}
                    </Typography>
                    {/* Transaction count summary */}
                    <Typography variant="body2" color="text.secondary">
                        Total expenses ({monthlyCosts.length} transactions)
                    </Typography>
                </CardContent>
            </Card>

            {/* Display empty state message if no expenses for selected month */}
            {monthlyCosts.length === 0 ? (
                <Alert severity="info">
                    No expenses recorded for {MONTHS[selectedMonth]} {selectedYear}
                </Alert>
            ) : (
                /* Detailed expense table with scrollable container for mobile */
                <TableContainer component={Paper} sx={{ borderRadius: 2, maxHeight: { xs: 400, sm: 'none' } }}>
                    <Table size="small" stickyHeader>
                        {/* Table header with column labels */}
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, py: { xs: 1, sm: 2 } }}>Date</TableCell>
                                {/* Category column hidden on mobile for space optimization */}
                                <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, py: { xs: 1, sm: 2 }, display: { xs: 'none', md: 'table-cell' } }}>Category</TableCell>
                                <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, py: { xs: 1, sm: 2 } }}>Description</TableCell>
                                {/* Original amount in original currency */}
                                <TableCell align="right" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, py: { xs: 1, sm: 2 } }}>Amount</TableCell>
                                {/* Converted amount in display currency */}
                                <TableCell align="right" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, py: { xs: 1, sm: 2 } }}>{displayCurrency}</TableCell>
                            </TableRow>
                        </TableHead>
                        {/* Table body with expense rows */}
                        <TableBody>
                            {monthlyCosts.map((cost) => {
                                // Extract converted amount for display
                                const convertedAmount = cost.convertedAmount;
                                return (
                                    <TableRow key={cost.id} hover>
                                        {/* Formatted date display */}
                                        <TableCell sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' }, py: { xs: 0.75, sm: 1.5 } }}>
                                            {formatDate(cost.date)}
                                        </TableCell>
                                        {/* Category chip - hidden on mobile screens */}
                                        <TableCell sx={{ display: { xs: 'none', md: 'table-cell' }, py: { xs: 0.75, sm: 1.5 } }}>
                                            <Chip label={cost.category} size="small" color="primary" variant="outlined" />
                                        </TableCell>
                                        {/* Description with text truncation for long entries */}
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
                                        {/* Original amount with currency code */}
                                        <TableCell align="right" sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' }, py: { xs: 0.75, sm: 1.5 } }}>
                                            {cost.sum.toFixed(2)} {cost.currency}
                                        </TableCell>
                                        {/* Converted amount in display currency - emphasized with bold font */}
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
    );
};

export default MonthlyCostTable;