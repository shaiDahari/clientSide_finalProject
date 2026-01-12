/**
 * Helper Functions - Centralized utilities for the Cost Manager application
 * Contains currency conversion, exchange rate fetching, and other shared utilities
 */
// Export default exchange rate API endpoint for use across application modules
//
export const DEFAULT_EXCHANGE_URL = 'https://shaidahari.github.io/exchaneRates_json/exchange-rates.json';

/**
 * Normalize rates object to handle EUR/EURO equivalence
 * The GitHub JSON uses "EURO" while the app uses "EUR"
 * @param {Object} rates - Exchange rates object from API
 * @returns {Object} Normalized rates with both EUR and EURO mappings
 */
export const normalizeRates = function (rates) {
    // Create copy to avoid mutating original rates object
    const normalized = { ...rates };
    
    // Ensure EUR/EURO equivalence for API compatibility
    if (normalized.EURO !== undefined && normalized.EUR === undefined) {
        normalized.EUR = normalized.EURO;
    }
    if (normalized.EUR !== undefined && normalized.EURO === undefined) {
        normalized.EURO = normalized.EUR;
    }
    return normalized;
};

/**
 * Convert amount from one currency to another using provided exchange rates
 * @param {number} amount - Amount to convert
 * @param {string} fromCurrency - Source currency code
 * @param {string} toCurrency - Target currency code
 * @param {Object} rates - Exchange rates object from API
 * @returns {number} Converted amount in target currency
 */
export const convertCurrency = function (amount, fromCurrency, toCurrency, rates) {
    // Skip conversion if currencies are the same
    if (fromCurrency === toCurrency) {
        return amount;
    }

    // Validate amount is a valid number
    if (typeof amount !== 'number' || isNaN(amount)) {
        console.warn('Invalid amount for currency conversion:', amount);
        return 0;
    }

    // Apply EUR/EURO normalization for API compatibility
    const normalizedRates = normalizeRates(rates);

    // Extract exchange rates for source and target currencies
    const fromRate = normalizedRates[fromCurrency];
    const toRate = normalizedRates[toCurrency];

    // Handle missing exchange rates gracefully
    if (fromRate === undefined || toRate === undefined) {
        console.warn(`Missing exchange rate for ${fromCurrency} or ${toCurrency}`);
        return amount; // Return original amount as fallback
    }

    // Convert via USD (base currency) then to target currency
    const usdAmount = amount / fromRate;
    return usdAmount * toRate;
};

/**
 * Fetch exchange rates from database settings and convert cost amounts to target currency
 * Handles the complete flow: get custom URL from settings -> fetch rates -> convert costs
 * @param {Object} db - Database wrapper instance with getExchangeRatesUrl method
 * @param {Array} costs - Array of cost objects to convert
 * @param {string} currency - Target currency code (USD, EUR, GBP, ILS, EURO)
 * @returns {Array} Costs array with added convertedAmount property for each cost
 */
export const fetchAndConvertWithUrl = async function (db, costs, currency) {
    // Early return for empty or invalid cost arrays
    if (!costs || costs.length === 0) {
        return [];
    }

    // Retrieve exchange rate API URL from database settings
    const exchangeUrl = await db.getExchangeRatesUrl();
    
    // Fetch current exchange rates from configured API endpoint
    const response = await fetch(exchangeUrl);

    // Handle HTTP errors from exchange rate API
    if (!response.ok) {
        throw new Error(`Failed to fetch exchange rates: HTTP ${response.status}`);
    }

    // Parse JSON response from exchange rate API
    const rates = await response.json();

    // Validate response format before processing
    if (!rates || typeof rates !== 'object') {
        throw new Error('Invalid exchange rates format received from server');
    }

    // Apply currency conversion to each cost and add convertedAmount
    return costs.map(cost => ({
        ...cost,
        convertedAmount: convertCurrency(cost.sum, cost.currency, currency, rates)
    }));
};


