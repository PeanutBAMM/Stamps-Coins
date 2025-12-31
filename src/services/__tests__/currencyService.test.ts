import { currencyService, CurrencyCode } from '../currencyService';

describe('currencyService', () => {
    describe('convert', () => {
        it('should convert EUR to USD correctly', () => {
            const result = currencyService.convert(100, 'EUR', 'USD');
            expect(result).toBeCloseTo(110, 2); // 100 * 1.10
        });

        it('should convert USD to EUR correctly', () => {
            const result = currencyService.convert(100, 'USD', 'EUR');
            expect(result).toBe(91); // 100 * 0.91
        });

        it('should return same amount when currencies are equal', () => {
            const result = currencyService.convert(100, 'EUR', 'EUR');
            expect(result).toBe(100);
        });

        it('should handle decimal amounts', () => {
            const result = currencyService.convert(50.50, 'EUR', 'USD');
            expect(result).toBeCloseTo(55.55, 2);
        });

        it('should handle zero amount', () => {
            const result = currencyService.convert(0, 'EUR', 'USD');
            expect(result).toBe(0);
        });
    });

    describe('getRate', () => {
        it('should return correct EUR to USD rate', () => {
            expect(currencyService.getRate('EUR', 'USD')).toBe(1.10);
        });

        it('should return correct USD to EUR rate', () => {
            expect(currencyService.getRate('USD', 'EUR')).toBe(0.91);
        });

        it('should return 1 for same currency', () => {
            expect(currencyService.getRate('EUR', 'EUR')).toBe(1);
            expect(currencyService.getRate('USD', 'USD')).toBe(1);
        });
    });

    describe('format', () => {
        it('should format EUR correctly', () => {
            const result = currencyService.format(1234.56, 'EUR');
            expect(result).toContain('1.234,56'); // nl-NL format
            expect(result).toContain('€');
        });

        it('should format USD correctly', () => {
            const result = currencyService.format(1234.56, 'USD');
            expect(result).toContain('1.234,56');
            expect(result).toContain('$');
        });
    });

    describe('getSymbol', () => {
        it('should return € for EUR', () => {
            expect(currencyService.getSymbol('EUR')).toBe('€');
        });

        it('should return $ for USD', () => {
            expect(currencyService.getSymbol('USD')).toBe('$');
        });
    });
});
