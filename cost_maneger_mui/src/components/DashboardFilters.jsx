/**
 * DashboardFilters Component - Filter controls for dashboard
 * Manages month, year, and currency selection for expense data filtering
 * Provides responsive UI with mobile-optimized display options
 */

import {
    Box,
    Paper,
    TextField,
    MenuItem,
    Grid
} from '@mui/material';
import { MONTHS, CURRENCIES } from '../utils/constants';

/**
 * DashboardFilters function for selecting time period and currency filters
 * @param {Object} props - Component props
 * @param {number} props.selectedMonth - Currently selected month index (0-11)
 * @param {Function} props.setSelectedMonth - Callback to update selected month
 * @param {number} props.selectedYear - Currently selected year
 * @param {Function} props.setSelectedYear - Callback to update selected year
 * @param {string} props.displayCurrency - Currently selected currency code
 * @param {Function} props.setDisplayCurrency - Callback to update display currency
 * @param {Array} props.yearOptions - Array of available year options for dropdown
 * @returns {JSX.Element} Filter controls component with month, year, and currency selectors
 */
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
            {/* Grid layout for filter controls - responsive column sizing */}
            <Grid container spacing={{ xs: 1.5, sm: 2 }} alignItems="center">
                {/* Month selection dropdown - responsive display (full name on desktop, abbreviation on mobile) */}
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
                        {/* Render month options with responsive text display */}
                        {MONTHS.map((month, index) => (
                            <MenuItem key={month} value={index}>
                                {/* Full month name on larger screens */}
                                <Box sx={{ display: { xs: 'none', sm: 'block' } }}>{month}</Box>
                                {/* Abbreviated month name (first 3 letters) on mobile */}
                                <Box sx={{ display: { xs: 'block', sm: 'none' } }}>{month.substring(0, 3)}</Box>
                            </MenuItem>
                        ))}
                    </TextField>
                </Grid>

                {/* Year selection dropdown - displays available year options */}
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
                        {/* Render year options from provided yearOptions array */}
                        {yearOptions.map((year) => (
                            <MenuItem key={year} value={year}>
                                {year}
                            </MenuItem>
                        ))}
                    </TextField>
                </Grid>

                {/* Currency selection dropdown - displays supported currencies */}
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
                        {/* Render currency options from constants */}
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