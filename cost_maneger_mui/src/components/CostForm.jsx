/**
 * CostForm Component
 * Form for adding new cost entries with validation
 */

import { useState } from 'react';
import {
    Box,
    TextField,
    Button,
    MenuItem,
    Paper,
    Typography,
    Alert,
    CircularProgress,
    Grid
} from '@mui/material';
import { AddCircleOutline } from '@mui/icons-material';
import { openCostsDB } from '../utils/idb';

// Available currencies (EURO handles both EUR and EURO via normalizeRates)
const CURRENCIES = ['USD', 'EURO', 'GBP', 'ILS'];

// Common expense categories
const CATEGORIES = [
    'Food & Dining',
    'Transportation',
    'Housing',
    'Utilities',
    'Entertainment',
    'Healthcare',
    'Shopping',
    'Education',
    'Travel',
    'Other'
];

const CostForm = ({ onCostAdded }) => {
    // Form state management
    const [formData, setFormData] = useState({
        sum: '',
        currency: 'USD',
        category: '',
        description: ''
    });

    // UI state management
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});

    /**
     * Handle input field changes
     * Updates form data state as user types
     */
    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear validation error for this field when user starts typing
        if (validationErrors[name]) {
            setValidationErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };

    /**
     * Validate form data before submission
     * @returns {boolean} True if form is valid, false otherwise
     */
    const validateForm = () => {
        const errors = {};

        // Validate sum (must be positive number and within reasonable range)
        const sumValue = parseFloat(formData.sum);
        if (!formData.sum || isNaN(sumValue) || sumValue <= 0) {
            errors.sum = 'Please enter a valid positive amount';
        } else if (sumValue > 999999999) {
            errors.sum = 'Amount is too large (maximum: 999,999,999)';
        }

        // Validate category
        if (!formData.category) {
            errors.category = 'Please select a category';
        }

        // Validate description (required and length limit)
        const trimmedDescription = formData.description.trim();
        if (!trimmedDescription) {
            errors.description = 'Please enter a description';
        } else if (trimmedDescription.length > 500) {
            errors.description = 'Description is too long (maximum: 500 characters)';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    /**
     * Handle form submission
     * Validates data and saves to IndexedDB
     */
    const handleSubmit = async (event) => {
        event.preventDefault();
        setError(null);
        setSuccess(false);

        // Validate form
        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            // Prepare cost object
            const cost = {
                sum: parseFloat(formData.sum),
                currency: formData.currency,
                category: formData.category,
                description: formData.description.trim(),
                date: new Date().toISOString()
            };

            // Save to IndexedDB
            const db = await openCostsDB("costsdb", 1);
            await db.addCost(cost);

            // Show success message
            setSuccess(true);

            // Reset form
            setFormData({
                sum: '',
                currency: 'USD',
                category: '',
                description: ''
            });

            // Notify parent component
            if (onCostAdded) {
                onCostAdded();
            }

            // Clear success message after 3 seconds
            setTimeout(() => {
                setSuccess(false);
            }, 3000);

        } catch (err) {
            setError(`Failed to add cost: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Paper
            elevation={3}
            sx={{
                p: { xs: 2, sm: 3, md: 4 },
                maxWidth: 600,
                mx: 'auto',
                mt: { xs: 1, sm: 2, md: 3 },
                borderRadius: { xs: 2, sm: 3 }
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, sm: 3 } }}>
                <AddCircleOutline sx={{ fontSize: { xs: 28, sm: 32 }, mr: 1, color: 'primary.main' }} />
                <Typography variant="h5" component="h2" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                    Add New Expense
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
                    Cost added successfully!
                </Alert>
            )}

            <form onSubmit={handleSubmit}>
                <Grid container spacing={{ xs: 2, sm: 3 }}>
                    {/* Amount Field */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Amount"
                            name="sum"
                            type="number"
                            value={formData.sum}
                            onChange={handleChange}
                            inputProps={{
                                step: '0.01',
                                min: '0',
                                style: { fontSize: '1.1rem' }
                            }}
                            InputLabelProps={{
                                shrink: true,
                                sx: { fontSize: '1rem', fontWeight: 500 }
                            }}
                            error={!!validationErrors.sum}
                            helperText={validationErrors.sum || 'Enter the expense amount'}
                            disabled={loading}
                            required
                            placeholder="0.00"
                        />
                    </Grid>

                    {/* Currency Field */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            select
                            label="Currency"
                            name="currency"
                            value={formData.currency}
                            onChange={handleChange}
                            disabled={loading}
                            required
                            InputLabelProps={{
                                shrink: true,
                                sx: { fontSize: '1rem', fontWeight: 500 }
                            }}
                            SelectProps={{
                                sx: { fontSize: '1.1rem' }
                            }}
                            helperText="Select currency type"
                        >
                            {CURRENCIES.map((currency) => (
                                <MenuItem
                                    key={currency}
                                    value={currency}
                                    sx={{ fontSize: '1rem', py: 1.5 }}
                                >
                                    {currency === 'USD' && '$ USD - US Dollar'}
                                    {currency === 'EURO' && '€ EURO - Euro'}
                                    {currency === 'GBP' && '£ GBP - British Pound'}
                                    {currency === 'ILS' && '₪ ILS - Israeli Shekel'}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    {/* Category Field */}
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            select
                            label="Category"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            error={!!validationErrors.category}
                            helperText={validationErrors.category || 'Select expense category'}
                            disabled={loading}
                            required
                            InputLabelProps={{
                                shrink: true,
                                sx: { fontSize: '1rem', fontWeight: 500 }
                            }}
                            SelectProps={{
                                sx: { fontSize: '1rem' }
                            }}
                        >
                            {CATEGORIES.map((category) => (
                                <MenuItem
                                    key={category}
                                    value={category}
                                    sx={{
                                        py: 1.5,
                                        fontSize: '1rem',
                                        '&:hover': { bgcolor: 'action.hover' }
                                    }}
                                >
                                    {category}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    {/* Description Field */}
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            multiline
                            rows={3}
                            error={!!validationErrors.description}
                            helperText={validationErrors.description || 'Provide details about this expense'}
                            disabled={loading}
                            required
                            InputLabelProps={{
                                shrink: true,
                                sx: { fontSize: '1rem', fontWeight: 500 }
                            }}
                            inputProps={{
                                style: { fontSize: '1rem' }
                            }}
                            placeholder="What was this expense for?"
                        />
                    </Grid>

                    {/* Submit Button */}
                    <Grid item xs={12}>
                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            size="large"
                            disabled={loading}
                            startIcon={loading ? <CircularProgress size={20} /> : <AddCircleOutline />}
                            sx={{
                                py: { xs: 1.5, sm: 1.75 },
                                fontSize: { xs: '0.95rem', sm: '1rem' },
                                fontWeight: 600,
                                borderRadius: 2
                            }}
                        >
                            {loading ? 'Adding...' : 'Add Expense'}
                        </Button>
                    </Grid>
                </Grid>
            </form>
        </Paper>
    );
};

export default CostForm;
