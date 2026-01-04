/**
 * Currency Conversion Utility
 * Provides exchange rates and conversion between EUR and USD
 */

// Exchange rates (in production, these would come from an API)
const EXCHANGE_RATES: Record<string, number> = {
    'EUR_USD': 1.10,  // 1 EUR = 1.10 USD
    'USD_EUR': 0.91,  // 1 USD = 0.91 EUR
};

export type CurrencyCode = 'EUR' | 'USD';

export const currencyService = {
    /**
     * Convert amount from one currency to another
     */
    convert(amount: number, from: CurrencyCode, to: CurrencyCode): number {
        if (from === to) return amount;

        const rateKey = `${from}_${to}`;
        const rate = EXCHANGE_RATES[rateKey];

        if (!rate) {
            console.warn(`No exchange rate found for ${rateKey}`);
            return amount;
        }

        return amount * rate;
    },

    /**
     * Get the exchange rate between two currencies
     */
    getRate(from: CurrencyCode, to: CurrencyCode): number {
        if (from === to) return 1;
        return EXCHANGE_RATES[`${from}_${to}`] || 1;
    },

    /**
     * Format amount with currency symbol
     */
    format(amount: number, currency: CurrencyCode, locale: string = 'nl-NL'): string {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency,
            currencyDisplay: 'symbol',
        }).format(amount);
    },

    /**
     * Get currency symbol
     */
    getSymbol(currency: CurrencyCode): string {
        return currency === 'EUR' ? '€' : '$';
    },
};

export default currencyService;
