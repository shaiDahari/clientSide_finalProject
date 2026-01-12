/**
 * Vanilla JavaScript IndexedDB Wrapper for Cost Manager Application
 * Standalone version without ES6 imports/exports for direct browser usage
 * Provides Promise-based interface for cost tracking with currency conversion
 */

// Default exchange rate API endpoint
const DEFAULT_EXCHANGE_URL = 'https://shaidahari.github.io/exchaneRates_json/exchange-rates.json';

/**
 * Normalize rates object to handle EUR/EURO equivalence
 * The GitHub JSON uses "EURO" while the app uses "EUR"
 * @param {Object} rates - Exchange rates object from API
 * @returns {Object} Normalized rates with both EUR and EURO mappings
 */
const normalizeRates = function (rates) {
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
const convertCurrency = function (amount, fromCurrency, toCurrency, rates) {
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
const fetchAndConvertWithUrl = async function (db, costs, currency) {
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

/**
 * Global window.idb object - Main API for vanilla JavaScript applications
 * Provides IndexedDB database operations without module imports
 */
window.idb = {
    /**
     * Opens and initializes the costs database with object stores
     * @param {string} databaseName - Name of the IndexedDB database
     * @param {number} databaseVersion - Version number for database schema
     * @returns {Promise<Object>} Database wrapper object with CRUD operations
     */
    openCostsDB: async function (databaseName, databaseVersion) {
        return new Promise((resolve, reject) => {
            // Open IndexedDB connection with specified name and version
            const request = indexedDB.open(databaseName, databaseVersion);

            request.onsuccess = function (event) {
                const db = event.target.result;

                // Create database wrapper object with all operations
                const dbWrapper = {
                    /** Add a new cost entry to the database with current timestamp */
                    addCost: async function (cost) {
                        return new Promise((resolve, reject) => {
                            // Create transaction for writing to costs store
                            const transaction = db.transaction(['costs'], 'readwrite');
                            const store = transaction.objectStore('costs');

                            // Add current timestamp to cost object
                            const costWithDate = {
                                sum: cost.sum,
                                currency: cost.currency,
                                category: cost.category,
                                description: cost.description,
                                date: new Date()
                            };

                            // Add cost to IndexedDB store
                            const request = store.add(costWithDate);

                            request.onsuccess = function (event) {
                                resolve(costWithDate);
                            };

                            request.onerror = function (event) {
                                reject(event.target.error);
                            };
                        });
                    },

                    /** Retrieve all costs from database */
                    getAllCosts: async function () {
                        return new Promise((resolve, reject) => {
                            // Create read-only transaction
                            const transaction = db.transaction(['costs'], 'readonly');
                            const store = transaction.objectStore('costs');
                            const request = store.getAll();

                            request.onsuccess = function (event) {
                                // Return all costs or empty array if none found
                                resolve(event.target.result || []);
                            };

                            request.onerror = function (event) {
                                reject(new Error('Failed to get costs'));
                            };
                        });
                    },

                    /** Filter costs by specific month and year */
                    getCostsByMonth: async function (month, year) {
                        try {
                            // Get all costs from database
                            const allCosts = await this.getAllCosts();
                            
                            // Filter by matching month and year
                            return allCosts.filter(cost => {
                                const costDate = new Date(cost.date);
                                return costDate.getMonth() === month && costDate.getFullYear() === year;
                            });
                        } catch (error) {
                            throw new Error(`Error getting costs by month: ${error.message}`);
                        }
                    },

                    /** Generate monthly report with currency-converted costs and total */
                    getReport: async function (year, month, currency) {
                        return new Promise(async (resolve, reject) => {
                            try {
                                // Create read-only transaction
                                const transaction = db.transaction(['costs'], 'readonly');
                                const store = transaction.objectStore('costs');
                                const request = store.getAll();

                                request.onsuccess = async function (event) {
                                    try {
                                        const allCosts = event.target.result;

                                        // Filter costs by specified year and month
                                        const filteredCosts = allCosts.filter(cost => {
                                            const costDate = new Date(cost.date);
                                            return costDate.getFullYear() === year &&
                                                costDate.getMonth() + 1 === month;
                                        });

                                        // Format costs for report output
                                        const reportCosts = filteredCosts.map(cost => ({
                                            sum: cost.sum,
                                            currency: cost.currency,
                                            category: cost.category,
                                            description: cost.description,
                                            date: { day: new Date(cost.date).getDate() }
                                        }));

                                        // Convert costs to target currency
                                        const costsWithConverted = await fetchAndConvertWithUrl(dbWrapper, filteredCosts, currency);

                                        // Calculate total amount in target currency
                                        const total = costsWithConverted.reduce((sum, cost) => {
                                            return sum + cost.convertedAmount;
                                        }, 0);

                                        // Build final report object
                                        const report = {
                                            year,
                                            month,
                                            costs: reportCosts,
                                            total: { currency, total: Math.round(total * 100) / 100 }
                                        };

                                        resolve(report);
                                    } catch (error) {
                                        reject(error);
                                    }
                                };

                                request.onerror = function (event) {
                                    reject(event.target.error);
                                };
                            } catch (error) {
                                reject(error);
                            }
                        });
                    },

                    /** Get category-based data for pie chart visualization with currency conversion */
                    getPieChartData: async function (year, month, currency) {
                        return new Promise(async (resolve, reject) => {
                            try {
                                // Create read-only transaction
                                const transaction = db.transaction(['costs'], 'readonly');
                                const store = transaction.objectStore('costs');
                                const request = store.getAll();

                                request.onsuccess = async function (event) {
                                    try {
                                        const allCosts = event.target.result;

                                        // Filter costs by specified year and month
                                        const filteredCosts = allCosts.filter(cost => {
                                            const costDate = new Date(cost.date);
                                            return costDate.getFullYear() === year &&
                                                costDate.getMonth() + 1 === month;
                                        });

                                        // Convert costs to target currency
                                        const costsWithConverted = await fetchAndConvertWithUrl(dbWrapper, filteredCosts, currency);

                                        // Group costs by category and sum amounts
                                        const categoryTotals = {};

                                        costsWithConverted.forEach(cost => {
                                            if (!categoryTotals[cost.category]) {
                                                categoryTotals[cost.category] = 0;
                                            }
                                            categoryTotals[cost.category] += cost.convertedAmount;
                                        });

                                        // Format data for pie chart visualization
                                        const pieData = Object.keys(categoryTotals).map(category => ({
                                            category,
                                            amount: Math.round(categoryTotals[category] * 100) / 100,
                                            currency
                                        }));

                                        resolve(pieData);
                                    } catch (error) {
                                        reject(error);
                                    }
                                };

                                request.onerror = function (event) {
                                    reject(event.target.error);
                                };
                            } catch (error) {
                                reject(error);
                            }
                        });
                    },

                    /** Get monthly spending data for bar chart visualization with currency conversion */
                    getBarChartData: async function (year, currency) {
                        return new Promise(async (resolve, reject) => {
                            try {
                                // Create read-only transaction
                                const transaction = db.transaction(['costs'], 'readonly');
                                const store = transaction.objectStore('costs');
                                const request = store.getAll();

                                request.onsuccess = async function (event) {
                                    try {
                                        const allCosts = event.target.result;

                                        // Filter costs by specified year
                                        const filteredCosts = allCosts.filter(cost => {
                                            const costDate = new Date(cost.date);
                                            return costDate.getFullYear() === year;
                                        });

                                        // Convert costs to target currency
                                        const costsWithConverted = await fetchAndConvertWithUrl(dbWrapper, filteredCosts, currency);

                                        // Initialize monthly totals for all 12 months
                                        const monthlyTotals = {};

                                        for (let month = 1; month <= 12; month++) {
                                            monthlyTotals[month] = 0;
                                        }

                                        // Sum costs by month
                                        costsWithConverted.forEach(cost => {
                                            const costMonth = new Date(cost.date).getMonth() + 1;
                                            monthlyTotals[costMonth] += cost.convertedAmount;
                                        });

                                        // Format data for bar chart visualization
                                        const barData = Object.keys(monthlyTotals).map(month => ({
                                            month: parseInt(month),
                                            amount: Math.round(monthlyTotals[month] * 100) / 100,
                                            currency
                                        }));

                                        resolve(barData);
                                    } catch (error) {
                                        reject(error);
                                    }
                                };

                                request.onerror = function (event) {
                                    reject(event.target.error);
                                };
                            } catch (error) {
                                reject(error);
                            }
                        });
                    },

                    /** Store application settings in database */
                    setSetting: async function (key, value) {
                        return new Promise((resolve, reject) => {
                            // Create write transaction for settings store
                            const transaction = db.transaction(['settings'], 'readwrite');
                            const store = transaction.objectStore('settings');
                            const request = store.put({ key, value });

                            request.onsuccess = function (event) {
                                resolve();
                            };

                            request.onerror = function (event) {
                                reject(event.target.error);
                            };
                        });
                    },

                    /** Retrieve application setting value by key */
                    getSetting: async function (key) {
                        return new Promise((resolve, reject) => {
                            // Create read-only transaction for settings store
                            const transaction = db.transaction(['settings'], 'readonly');
                            const store = transaction.objectStore('settings');
                            const request = store.get(key);

                            request.onsuccess = function (event) {
                                const result = event.target.result;
                                resolve(result ? result.value : null);
                            };

                            request.onerror = function (event) {
                                reject(event.target.error);
                            };
                        });
                    },

                    /** Get exchange rate API URL from settings or return default */
                    getExchangeRatesUrl: async function () {
                        try {
                            // Try to get custom URL from settings
                            const customUrl = await this.getSetting('exchangeRateUrl');
                            return customUrl || DEFAULT_EXCHANGE_URL;
                        } catch (error) {
                            // Fall back to default URL if error occurs
                            return DEFAULT_EXCHANGE_URL;
                        }
                    }
                };

                resolve(dbWrapper);
            };

            request.onerror = function (event) {
                reject(event.target.error);
            };

            // Initialize database schema on first creation or version upgrade
            request.onupgradeneeded = function (event) {
                const db = event.target.result;

                // Create costs object store with auto-incrementing keys
                if (!db.objectStoreNames.contains('costs')) {
                    const costsStore = db.createObjectStore('costs', { autoIncrement: true });
                    costsStore.createIndex('date', 'date', { unique: false });
                    costsStore.createIndex('category', 'category', { unique: false });
                }

                // Create settings object store for app configuration
                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings', { keyPath: 'key' });
                }
            };
        });
    }
};