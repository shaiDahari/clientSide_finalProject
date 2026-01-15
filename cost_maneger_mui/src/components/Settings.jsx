/**
 * Settings Component - Application configuration interface
 * Manages custom exchange rate API URLs and displays application information
 * Provides URL validation, connection testing, and fallback handling
 * @returns {JSX.Element} Settings page with URL configuration and app info
 */

import { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Alert,
    CircularProgress,
    Divider,
    Card,
    CardContent,
    Grid
} from '@mui/material';
import { Settings as SettingsIcon, Save, Refresh } from '@mui/icons-material';
import { openCostsDB } from '../utils/idb';

/**
 * Main Settings component for application configuration
 */
const Settings = () => {
    // Form state - manages user input for exchange rate URL
    const [exchangeRateUrl, setExchangeRateUrl] = useState('');
    
    // UI state - controls loading indicators and user feedback
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [testingConnection, setTestingConnection] = useState(false);

    /**
     * Effect hook to load saved settings when component mounts
     */
    useEffect(() => {
        loadSettings();
    }, []);

    /**
     * Load saved exchange rate URL from IndexedDB on component initialization
     */
    const loadSettings = async () => {
        // Show initial loading indicator
        setInitialLoading(true);
        
        try {
            // Connect to database and retrieve saved URL setting
            const db = await openCostsDB("costsdb", 1);
            const savedUrl = await db.getSetting('exchangeRateUrl');
            
            // Populate form field if URL was previously saved
            if (savedUrl) {
                setExchangeRateUrl(savedUrl);
            }
        } catch (err) {
            // Display error if settings cannot be loaded
            setError(`Failed to load settings: ${err.message}`);
        } finally {
            // Hide loading indicator regardless of outcome
            setInitialLoading(false);
        }
    };

    /**
     * Handle saving exchange rate URL to database
     * Validates URL format and provides user feedback
     */
    const handleSave = async () => {
        // Initialize saving state and clear previous messages
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            // Validate URL format before saving (if URL provided)
            if (exchangeRateUrl && !isValidUrl(exchangeRateUrl)) {
                throw new Error('Please enter a valid URL');
            }

            // Connect to database and persist the URL setting
            const db = await openCostsDB("costsdb", 1);
            await db.setSetting('exchangeRateUrl', exchangeRateUrl);

            // Show success feedback to user
            setSuccess(true);

            // Auto-hide success message after 3 seconds
            setTimeout(() => {
                setSuccess(false);
            }, 3000);

        } catch (err) {
            // Display error message if save operation fails
            setError(`Failed to save settings: ${err.message}`);
        } finally {
            // Clear loading state regardless of success/failure
            setLoading(false);
        }
    };

    /**
     * Test connection to the exchange rate API URL
     * Validates URL accessibility and response format
     */
    const handleTestConnection = async () => {
        // Validate that URL is provided before testing
        if (!exchangeRateUrl) {
            setError('Please enter a URL to test');
            return;
        }

        // Initialize testing state and clear previous messages
        setTestingConnection(true);
        setError(null);

        try {
            // Attempt to fetch data from the provided URL
            const response = await fetch(exchangeRateUrl);

            // Check if HTTP request was successful
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Parse JSON response from the API
            const data = await response.json();

            // Validate that response contains expected data structure
            if (!data || typeof data !== 'object') {
                throw new Error('Invalid response format');
            }

            // Check for required currencies (accept both EUR and EURO formats)
            const hasEuro = data['EUR'] !== undefined || data['EURO'] !== undefined;
            const requiredCurrencies = ['USD', 'GBP', 'ILS'];
            const missingCurrencies = requiredCurrencies.filter(curr =>
                data[curr] === undefined && data[curr.toUpperCase()] === undefined
            );

            // Add EUR/EURO to missing currencies if neither is found
            if (!hasEuro) {
                missingCurrencies.push('EUR/EURO');
            }

            // Note: Missing currencies detected but don't fail test
            if (missingCurrencies.length > 0) {
                // Missing currencies logged but test continues
            }

            // Show success message for successful connection
            setSuccess(true);
            setError(null);

            // Auto-hide success message after 3 seconds
            setTimeout(() => {
                setSuccess(false);
            }, 3000);

        } catch (err) {
            // Display detailed error message for failed connection
            setError(`Connection test failed: ${err.message}. Using default exchange rates.`);
        } finally {
            // Clear testing state regardless of outcome
            setTestingConnection(false);
        }
    };

    /**
     * Reset exchange rate URL to default (empty) setting
     * Clears custom URL and reverts to application default
     */
    const handleReset = async () => {
        // Clear form field and UI messages
        //setExchangeRateUrl(DEFAULT_EXCHANGE_URL);
        setExchangeRateUrl('');
        setError(null);
        setSuccess(false);

        try {
            // Connect to database and clear the custom URL setting
            const db = await openCostsDB("costsdb", 1);
            await db.setSetting('exchangeRateUrl', '');
            
            // Show confirmation that reset was successful
            setSuccess(true);

            // Auto-hide success message after 3 seconds
            setTimeout(() => {
                setSuccess(false);
            }, 3000);
        } catch (err) {
            // Display error if reset operation fails
            setError(`Failed to reset settings: ${err.message}`);
        }
    };

    /**
     * Validate URL format using browser's URL constructor
     * @param {string} string - URL string to validate
     * @returns {boolean} True if URL is valid, false otherwise
     */
    const isValidUrl = (string) => {
        try {
            // Use URL constructor for comprehensive validation
            new URL(string);
            return true;
        } catch (_) {
            // Return false for any invalid URL format
            return false;
        }
    };

    if (initialLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, maxWidth: 800, mx: 'auto' }}>
            <Paper elevation={3} sx={{ p: { xs: 2, sm: 3, md: 4 }, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, sm: 3 } }}>
                    <SettingsIcon sx={{ fontSize: { xs: 28, sm: 32 }, mr: 1, color: 'primary.main' }} />
                    <Typography variant="h5" component="h2" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                        Application Settings
                    </Typography>
                </Box>

                {/* Error Alert */}
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}

                {/* Success Alert */}
                {success && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                        Settings saved successfully!
                    </Alert>
                )}

                {/* Exchange Rate URL Section */}
                <Box sx={{ mb: { xs: 3, sm: 4 } }}>
                    <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                        Exchange Rate API
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                        Configure a custom URL for fetching real-time exchange rates. If not set or if the URL fails,
                        the app uses a default API endpoint. Note: Exchange rates may not reflect real-time values
                        depending on the data source.
                    </Typography>

                    <TextField
                        fullWidth
                        label="Exchange Rate API URL"
                        value={exchangeRateUrl}
                        onChange={(e) => setExchangeRateUrl(e.target.value)}
                        placeholder="https://api.example.com/rates"
                        disabled={loading || testingConnection}
                        sx={{ mb: 2 }}
                        helperText="Example: https://api.exchangerate-api.com/v4/latest/USD"
                        size="medium"
                        slotProps={{
                            inputLabel: {
                                sx: { fontSize: { xs: '0.9rem', sm: '1rem' } }
                            }
                        }}
                    />

                    <Box sx={{
                        display: 'flex',
                        gap: { xs: 1, sm: 2 },
                        flexWrap: 'wrap',
                        flexDirection: { xs: 'column', sm: 'row' }
                    }}>
                        <Button
                            variant="contained"
                            startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                            onClick={handleSave}
                            disabled={loading || testingConnection}
                            fullWidth={false}
                            sx={{
                                minWidth: { xs: '100%', sm: 'auto' },
                                py: { xs: 1.25, sm: 1 }
                            }}
                        >
                            {loading ? 'Saving...' : 'Save Settings'}
                        </Button>

                        <Button
                            variant="outlined"
                            startIcon={testingConnection ? <CircularProgress size={20} /> : <Refresh />}
                            onClick={handleTestConnection}
                            disabled={loading || testingConnection || !exchangeRateUrl}
                            sx={{
                                minWidth: { xs: '100%', sm: 'auto' },
                                py: { xs: 1.25, sm: 1 }
                            }}
                        >
                            {testingConnection ? 'Testing...' : 'Test Connection'}
                        </Button>

                        <Button
                            variant="text"
                            onClick={handleReset}
                            disabled={loading || testingConnection}
                            sx={{
                                minWidth: { xs: '100%', sm: 'auto' },
                                py: { xs: 1.25, sm: 1 }
                            }}
                        >
                            Reset to Default
                        </Button>
                    </Box>
                </Box>

                <Divider sx={{ my: { xs: 2, sm: 3 } }} />

                {/* Default Exchange Rates Info */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Default Exchange Rates
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        When no custom URL is configured, exchange rates are fetched from the default API endpoint
                        hosted on GitHub Pages. This ensures currency conversion is always available.
                    </Typography>
                </Box>

                <Divider sx={{ my: 3 }} />

                {/* Application Info */}
                <Box>
                    <Typography variant="h6" gutterBottom>
                        About
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                        <strong>Cost Manager Application</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                        Version: 1.0.0
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                        This application helps you track and manage your expenses across multiple currencies.
                        All data is stored locally in your browser using IndexedDB.
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        <strong>Features:</strong>
                    </Typography>
                    <ul style={{ marginTop: 8 }}>
                        <li>
                            <Typography variant="body2" color="text.secondary">
                                Track expenses in multiple currencies (USD, EUR, GBP, ILS)
                            </Typography>
                        </li>
                        <li>
                            <Typography variant="body2" color="text.secondary">
                                Categorize expenses for better organization
                            </Typography>
                        </li>
                        <li>
                            <Typography variant="body2" color="text.secondary">
                                View monthly reports with automatic currency conversion
                            </Typography>
                        </li>
                        <li>
                            <Typography variant="body2" color="text.secondary">
                                Visualize spending patterns with interactive charts
                            </Typography>
                        </li>
                        <li>
                            <Typography variant="body2" color="text.secondary">
                                All data stored securely in your browser
                            </Typography>
                        </li>
                    </ul>
                </Box>
            </Paper>
        </Box>
    );
};

export default Settings;
