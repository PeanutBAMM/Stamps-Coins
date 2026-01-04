import React from 'react';
import { render } from '@testing-library/react-native';
import { AROverlay } from '../AROverlay';

jest.mock('lucide-react-native', () => ({
    Scan: () => 'Scan',
}));

describe('AROverlay', () => {
    it('renders feedback text', () => {
        const { getByText } = render(<AROverlay feedback="Hold still" />);
        expect(getByText('Hold still')).toBeTruthy();
    });

    it('shows item count badge when count > 1', () => {
        const { getByText } = render(<AROverlay itemCount={3} />);
        expect(getByText('3 items gevonden')).toBeTruthy();
    });

    it('does not show item count badge when count is 1', () => {
        const { queryByText } = render(<AROverlay itemCount={1} />);
        expect(queryByText('1 items gevonden')).toBeNull();
    });
});
