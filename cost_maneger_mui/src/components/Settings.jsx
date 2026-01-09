/**
 * Settings Component
 * Allows users to configure custom exchange rate URL and view app information
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
//import { saveSetting, getSetting, DEFAULT_EXCHANGE_RATES } from '../utils/db';
import { openCostsDB } from '../utils/idb';

const Settings = () => {
    // State management
    const [exchangeRateUrl, setExchangeRateUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [testingConnection, setTestingConnection] = useState(false);

    /**
     * Load saved settings on component mount
     */
    useEffect(() => {
        loadSettings();
    }, []);

    /**
     * Load settings from IndexedDB
     */
    const loadSettings = async () => {
        setInitialLoading(true);
        try {
            const db = await openCostsDB("costsdb", 1);
            const savedUrl = await db.getSetting('exchangeRateUrl');
            if (savedUrl) {
                setExchangeRateUrl(savedUrl);
            }
        } catch (err) {
            setError(`Failed to load settings: ${err.message}`);
        } finally {
            setInitialLoading(false);
        }
    };

    /**
     * Handle saving exchange rate URL
     */
    const handleSave = async () => {
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            // Validate URL format if provided
            if (exchangeRateUrl && !isValidUrl(exchangeRateUrl)) {
                throw new Error('Please enter a valid URL');
            }

            // Save to IndexedDB
            const db = await openCostsDB("costsdb", 1);
            await db.setSetting('exchangeRateUrl', exchangeRateUrl);
            console.log('Saved custom URL:', exchangeRateUrl); // Add this

            setSuccess(true);

            // Clear success message after 3 seconds
            setTimeout(() => {
                setSuccess(false);
            }, 3000);

        } catch (err) {
            setError(`Failed to save settings: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Test the exchange rate URL connection
     */
    const handleTestConnection = async () => {
        if (!exchangeRateUrl) {
            setError('Please enter a URL to test');
            return;
        }

        setTestingConnection(true);
        setError(null);

        try {
            // Attempt to fetch from the URL
            const response = await fetch(exchangeRateUrl);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // Basic validation of response structure
            if (!data || typeof data !== 'object') {
                throw new Error('Invalid response format');
            }

            setSuccess(true);
            setError(null);

            setTimeout(() => {
                setSuccess(false);
            }, 3000);

        } catch (err) {
            setError(`Connection test failed: ${err.message}. Using default exchange rates.`);
        } finally {
            setTestingConnection(false);
        }
    };

    /**
     * Reset to default settings
     */
    const handleReset = async () => {
        setExchangeRateUrl('');
        setError(null);
        setSuccess(false);

        try {
            const db = await openCostsDB("costsdb", 1);
            await db.setSetting('exchangeRateUrl', '');
            setSuccess(true);

            setTimeout(() => {
                setSuccess(false);
            }, 3000);
        } catch (err) {
            setError(`Failed to reset settings: ${err.message}`);
        }
    };

    /**
     * Validate URL format
     */
    const isValidUrl = (string) => {
        try {
            new URL(string);
            return true;
        } catch (_) {
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
        <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <SettingsIcon sx={{ fontSize: 32, mr: 1, color: 'primary.main' }} />
                    <Typography variant="h5" component="h2">
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
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" gutterBottom>
                        Exchange Rate API
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Configure a custom URL for fetching real-time exchange rates. If not set or if the URL fails,
                        the application will use default exchange rates.
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
                    />

                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <Button
                            variant="contained"
                            startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                            onClick={handleSave}
                            disabled={loading || testingConnection}
                        >
                            {loading ? 'Saving...' : 'Save Settings'}
                        </Button>

                        <Button
                            variant="outlined"
                            startIcon={testingConnection ? <CircularProgress size={20} /> : <Refresh />}
                            onClick={handleTestConnection}
                            disabled={loading || testingConnection || !exchangeRateUrl}
                        >
                            {testingConnection ? 'Testing...' : 'Test Connection'}
                        </Button>

                        <Button
                            variant="text"
                            onClick={handleReset}
                            disabled={loading || testingConnection}
                        >
                            Reset to Default
                        </Button>
                    </Box>
                </Box>

                <Divider sx={{ my: 3 }} />

                {/* Default Exchange Rates Info */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Default Exchange Rates
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        These rates are used when no custom API is configured or when the API is unavailable.
                    </Typography>

                    {/*<Grid container spacing={2}>*/}
                    {/*    {Object.entries(DEFAULT_EXCHANGE_RATES).map(([currency, rate]) => (*/}
                    {/*        <Grid item xs={6} sm={3} key={currency}>*/}
                    {/*            <Card variant="outlined">*/}
                    {/*                <CardContent>*/}
                    {/*                    <Typography variant="h6" color="primary">*/}
                    {/*                        {currency}*/}
                    {/*                    </Typography>*/}
                    {/*                    <Typography variant="body2" color="text.secondary">*/}
                    {/*                        {rate.toFixed(4)}*/}
                    {/*                    </Typography>*/}
                    {/*                </CardContent>*/}
                    {/*            </Card>*/}
                    {/*        </Grid>*/}
                    {/*    ))}*/}
                    {/*</Grid>*/}
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
