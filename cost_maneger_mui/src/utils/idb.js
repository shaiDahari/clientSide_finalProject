/**
 * IndexedDB Database Wrapper for Cost Manager Application
 * Provides Promise-based interface for storing costs and settings in browser's IndexedDB
 * Supports currency conversion with dynamic exchange rates
 */

import { fetchAndConvertWithUrl, DEFAULT_EXCHANGE_URL } from './helperFunctions';

/**
 * Opens and initializes the costs database with object stores
 * @param {string} databaseName - Name of the IndexedDB database
 * @param {number} databaseVersion - Version number for database schema
 * @returns {Promise<Object>} Database wrapper object with CRUD operations
 */
export const openCostsDB = async function (databaseName, databaseVersion) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(databaseName, databaseVersion);

        request.onsuccess = function (event) {
            const db = event.target.result;

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
                /** Retrieve all costs with auto-generated IndexedDB keys as id property */
                getAllCosts: async function () {
                    return new Promise((resolve, reject) => {
                        // Create read-only transaction
                        const transaction = db.transaction(['costs'], 'readonly');
                        const store = transaction.objectStore('costs');
                        const request = store.openCursor(); // Use cursor to get both data and keys
                        const costs = [];

                        request.onsuccess = function (event) {
                            const cursor = event.target.result;
                            if (cursor) {
                                // Extract cost data and add IndexedDB key as id
                                const cost = cursor.value; // Get the cost data
                                cost.id = cursor.key; // Add IndexedDB auto-generated key as id property
                                costs.push(cost);
                                cursor.continue(); // Move to next record
                            } else {
                                resolve(costs); // No more records, return all costs with IDs
                            }
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
                                }

                                catch (error) {
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
                        console.log('Retrieved custom URL:', customUrl);
                        console.log('Using URL:', customUrl || DEFAULT_EXCHANGE_URL);
                        return customUrl || DEFAULT_EXCHANGE_URL;
                    } catch (error) {
                        // Fall back to default URL if error occurs
                        console.log('Error getting custom URL, using default:', error);
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
};