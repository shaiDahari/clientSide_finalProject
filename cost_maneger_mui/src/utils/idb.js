const DEFAULT_EXCHANGE_URL = 'https://shaidahari.github.io/exchaneRates_json/exchange-rates.json';

export const convertCurrency = function(amount, fromCurrency, toCurrency, rates) {
    if (fromCurrency === toCurrency) {
        return amount;
    }
    const usdAmount = amount / rates[fromCurrency];
    return usdAmount * rates[toCurrency];
};

export const fetchAndConvert = async function(costs, currency, getExchangeRatesUrl) {
    const exchangeUrl = await getExchangeRatesUrl();
    const response = await fetch(exchangeUrl);
    const rates = await response.json();

    return costs.map(cost => ({
        ...cost,
        convertedAmount: convertCurrency(cost.sum, cost.currency, currency, rates)
    }));
};

export const openCostsDB = async function(databaseName, databaseVersion) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(databaseName, databaseVersion);
        
        request.onsuccess = function(event) {
            const db = event.target.result;
            
            const dbWrapper = {
                addCost: async function(cost) {
                    return new Promise((resolve, reject) => {
                        const transaction = db.transaction(['costs'], 'readwrite');
                        const store = transaction.objectStore('costs');
                        
                        const costWithDate = {
                            sum: cost.sum,
                            currency: cost.currency,
                            category: cost.category,
                            description: cost.description,
                            date: new Date()
                        };
                        
                        const request = store.add(costWithDate);
                        
                        request.onsuccess = function(event) {
                            resolve(costWithDate);
                        };
                        
                        request.onerror = function(event) {
                            reject(event.target.error);
                        };
                    });
                },

                getAllCosts: async function() {
                    return new Promise((resolve, reject) => {
                        const transaction = db.transaction(['costs'], 'readonly');
                        const store = transaction.objectStore('costs');
                        const request = store.getAll();

                        request.onsuccess = function(event) {
                            resolve(event.target.result || []);
                        };

                        request.onerror = function(event) {
                            reject(new Error('Failed to get costs'));
                        };
                    });
                },

                getCostsByMonth: async function(month, year) {
                    try {
                        const allCosts = await this.getAllCosts();
                        return allCosts.filter(cost => {
                            const costDate = new Date(cost.date);
                            return costDate.getMonth() === month && costDate.getFullYear() === year;
                        });
                    } catch (error) {
                        throw new Error(`Error getting costs by month: ${error.message}`);
                    }
                },

                getReport: async function(year, month, currency) {
                    return new Promise(async (resolve, reject) => {
                        try {
                            const transaction = db.transaction(['costs'], 'readonly');
                            const store = transaction.objectStore('costs');
                            const request = store.getAll();
                            
                            request.onsuccess = async function(event) {
                                try {
                                    const allCosts = event.target.result;

                                    const filteredCosts = allCosts.filter(cost => {
                                        const costDate = new Date(cost.date);
                                        return costDate.getFullYear() === year &&
                                            costDate.getMonth() + 1 === month;
                                    });

                                    const reportCosts = filteredCosts.map(cost => ({
                                        sum: cost.sum,
                                        currency: cost.currency,
                                        category: cost.category,
                                        description: cost.description,
                                        Date: {day: new Date(cost.date).getDate()}
                                    }));

                                    const costsWithConverted = await fetchAndConvert(
                                        filteredCosts,
                                        currency,
                                        dbWrapper.getExchangeRatesUrl
                                    );

                                    const total = costsWithConverted.reduce((sum, cost) => {
                                        return sum + cost.convertedAmount;
                                    }, 0);

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
                            
                            request.onerror = function(event) {
                                reject(event.target.error);
                            };
                        } catch (error) {
                            reject(error);
                        }
                    });
                },
                
                getPieChartData: async function(year, month, currency) {
                    return new Promise(async (resolve, reject) => {
                        try {
                            const transaction = db.transaction(['costs'], 'readonly');
                            const store = transaction.objectStore('costs');
                            const request = store.getAll();
                            
                            request.onsuccess = async function(event) {
                                try {
                                    const allCosts = event.target.result;
                                    
                                    const filteredCosts = allCosts.filter(cost => {
                                        const costDate = new Date(cost.date);
                                        return costDate.getFullYear() === year && 
                                               costDate.getMonth() + 1 === month;
                                    });

                                    const costsWithConverted = await fetchAndConvert(
                                        filteredCosts,
                                        currency,
                                        dbWrapper.getExchangeRatesUrl
                                    );

                                    const categoryTotals = {};

                                    costsWithConverted.forEach(cost => {
                                        if (!categoryTotals[cost.category]) {
                                            categoryTotals[cost.category] = 0;
                                        }
                                        categoryTotals[cost.category] += cost.convertedAmount;
                                    });

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
                            
                            request.onerror = function(event) {
                                reject(event.target.error);
                            };
                        } catch (error) {
                            reject(error);
                        }
                    });
                },
                
                getBarChartData: async function(year, currency) {
                    return new Promise(async (resolve, reject) => {
                        try {
                            const transaction = db.transaction(['costs'], 'readonly');
                            const store = transaction.objectStore('costs');
                            const request = store.getAll();
                            
                            request.onsuccess = async function(event) {
                                try {
                                    const allCosts = event.target.result;
                                    
                                    const filteredCosts = allCosts.filter(cost => {
                                        const costDate = new Date(cost.date);
                                        return costDate.getFullYear() === year;
                                    });

                                    const costsWithConverted = await fetchAndConvert(
                                        filteredCosts,
                                        currency,
                                        dbWrapper.getExchangeRatesUrl
                                    );

                                    const monthlyTotals = {};

                                    for (let month = 1; month <= 12; month++) {
                                        monthlyTotals[month] = 0;
                                    }

                                    costsWithConverted.forEach(cost => {
                                        const costMonth = new Date(cost.date).getMonth() + 1;
                                        monthlyTotals[costMonth] += cost.convertedAmount;
                                    });

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
                            
                            request.onerror = function(event) {
                                reject(event.target.error);
                            };
                        } catch (error) {
                            reject(error);
                        }
                    });
                },
                
                setSetting: async function(key, value) {
                    return new Promise((resolve, reject) => {
                        const transaction = db.transaction(['settings'], 'readwrite');
                        const store = transaction.objectStore('settings');
                        const request = store.put({ key, value });
                        
                        request.onsuccess = function(event) {
                            resolve();
                        };
                        
                        request.onerror = function(event) {
                            reject(event.target.error);
                        };
                    });
                },
                
                getSetting: async function(key) {
                    return new Promise((resolve, reject) => {
                        const transaction = db.transaction(['settings'], 'readonly');
                        const store = transaction.objectStore('settings');
                        const request = store.get(key);
                        
                        request.onsuccess = function(event) {
                            const result = event.target.result;
                            resolve(result ? result.value : null);
                        };
                        
                        request.onerror = function(event) {
                            reject(event.target.error);
                        };
                    });
                },
                
                getExchangeRatesUrl: async function() {
                    try {
                        const customUrl = await this.getSetting('exchangeRatesUrl');
                        console.log('Retrieved custom URL:', customUrl); // Add this
                        return customUrl || DEFAULT_EXCHANGE_URL;
                    } catch (error) {
                        return DEFAULT_EXCHANGE_URL;
                    }
                }
            };
            
            resolve(dbWrapper);
        };
        
        request.onerror = function(event) {
            reject(event.target.error);
        };
        
        request.onupgradeneeded = function(event) {
            const db = event.target.result;
            
            if (!db.objectStoreNames.contains('costs')) {
                const costsStore = db.createObjectStore('costs', { autoIncrement: true });
                costsStore.createIndex('date', 'date', { unique: false });
                costsStore.createIndex('category', 'category', { unique: false });
            }
            
            if (!db.objectStoreNames.contains('settings')) {
                db.createObjectStore('settings', { keyPath: 'key' });
            }
        };
    });
};