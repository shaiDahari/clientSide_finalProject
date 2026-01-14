/**
 * DashboardFilters Component - Filter controls for dashboard
 * Manages month, year, and currency selection
 */

import {
    Box,
    Paper,
    TextField,
    MenuItem,
    Grid
} from '@mui/material';
import { MONTHS, CURRENCIES } from '../utils/constants';

const DashboardFilters = ({
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    displayCurrency,
    setDisplayCurrency,
    yearOptions
}) => {
    return (
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
                        slotProps={{ inputLabel: { sx: { fontSize: { xs: '0.8rem', sm: '1rem' } } } }}
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
                        slotProps={{ inputLabel: { sx: { fontSize: { xs: '0.8rem', sm: '1rem' } } } }}
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
                        slotProps={{ inputLabel: { sx: { fontSize: { xs: '0.8rem', sm: '1rem' } } } }}
                    >
                        {CURRENCIES.map((currency) => (
                            <MenuItem key={currency} value={currency}>
                                {currency}
                            </MenuItem>
                        ))}
                    </TextField>
                </Grid>
            </Grid>
        </Paper>
    );
};

export default DashboardFilters;