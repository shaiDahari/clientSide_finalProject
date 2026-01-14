/**
 * MonthlyCostTable Component - Monthly expense report with summary and table
 * Displays total expenses card and detailed cost table
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
    );
};

export default MonthlyCostTable;