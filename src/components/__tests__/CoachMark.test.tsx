import React from 'react';
import { render } from '@testing-library/react-native';
import { CoachMark } from '../CoachMark';

jest.mock('expo-blur', () => ({
    BlurView: ({ children }: any) => children,
}));

describe('CoachMark', () => {
    it('renders correctly with text', () => {
        const { getByText } = render(<CoachMark text="Test Mark" />);
        expect(getByText('Test Mark')).toBeTruthy();
    });

    it('applies custom style', () => {
        const { getByText } = render(<CoachMark text="Test" style={{ top: 10 }} />);
        // Simple verification that it renders without error with style prop
        expect(getByText('Test')).toBeTruthy();
    });
});
