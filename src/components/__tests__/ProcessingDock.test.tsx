import React from 'react';
import { render } from '@testing-library/react-native';
import { ProcessingDock } from '../ProcessingDock';

jest.mock('expo-blur', () => ({
    BlurView: ({ children }: any) => children,
}));

jest.mock('lucide-react-native', () => ({
    Loader2: () => 'Loader2',
    CheckCircle2: () => 'CheckCircle2',
    AlertCircle: () => 'AlertCircle',
}));

describe('ProcessingDock', () => {
    it('returns null when idle', () => {
        const { toJSON } = render(<ProcessingDock status="idle" />);
        expect(toJSON()).toBeNull();
    });

    it('renders processing state correctly', () => {
        const { getByText } = render(<ProcessingDock status="processing" message="Analyzing" progress={0.5} />);
        expect(getByText('Analyzing')).toBeTruthy();
        // Check if mocks render (RNTL renders strings as Text sometimes or View with props)
        // Actually, because we return string in mock, it might render as Text.
        // Let's verify presence
    });

    it('renders success state correctly', () => {
        const { getByText } = render(<ProcessingDock status="success" message="Done" />);
        expect(getByText('Done')).toBeTruthy();
    });
});
