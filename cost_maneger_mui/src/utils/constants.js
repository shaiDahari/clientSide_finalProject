/**
 * Application-wide constants
 * Centralized definitions for currencies, categories, months, colors, and API endpoints
 */

// Supported currencies for expense entry (EURO maps to EUR via normalizeRates)
export const CURRENCIES = ['USD', 'EURO', 'GBP', 'ILS'];

// Predefined expense categories for user selection
export const CATEGORIES = [
    'Food & Dining',
    'Transportation',
    'Housing',
    'Utilities',
    'Entertainment',
    'Healthcare',
    'Sport',
    'Shopping',
    'Education',
    'Travel',
    'Other'
];

// Month names for user-friendly date display
export const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

// Color palette for chart visualization - 10 distinct colors
export const COLORS = [
    '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8',
    '#82CA9D', '#FFC658', '#FF6B9D', '#C780E8', '#4ECDC4'
];

// Export default exchange rate API endpoint for use across application modules
export const DEFAULT_EXCHANGE_URL = 'https://shaidahari.github.io/exchaneRates_json/exchange-rates.json';