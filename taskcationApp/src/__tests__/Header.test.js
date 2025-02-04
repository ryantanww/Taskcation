// Import dependencies and libraries used for testing Home Screen
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Header from '../components/Header';

// Mock useNavigation hook
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual('@react-navigation/native');
    return {
        ...actualNav,
        useNavigation: () => ({
            navigate: mockNavigate,
        }),
    };
});

describe('<Header />', () => {
    // Test to navigate to Home Screen when Taskcation header is pressed
    it('should navigate to Home Screen when Taskcation header is pressed', async () => {
        // Renders the Header component
        const { getByText } = render(<Header />);

        await waitFor(() => {
            // Verifies Taskcation is displayed correctly
            expect(getByText('Taskcation')).toBeTruthy();
        });

        // Press Taskcation
        fireEvent.press(getByText('Taskcation'));

        // Verify that navigation to Home screen has been called
        expect(mockNavigate).toHaveBeenCalledWith('Home');
    });

    // Snapshot test for Header
    it('should match snapshot', async () => {
        // Renders the Header component
        const { toJSON } = render(<Header />);
        
        // Verify snapshot matches
        expect(toJSON()).toMatchSnapshot();
    });
});
