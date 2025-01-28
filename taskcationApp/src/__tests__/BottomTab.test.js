// Import dependencies and libraries used for testing Bottom Tab
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import BottomTab from '../components/BottomTab';

// Mock the screens used in the BottomTab navigation with corresponding test ID
jest.mock('../screens/HomeScreen', () => {
    return jest.fn(() => <div testID='home-screen'>Home</div>);
});

jest.mock('../screens/GroupsScreen', () => {
    return () => <div testID='groups-screen'>Groups</div>;
});

jest.mock('../screens/AddTaskScreen', () => {
    return () => <div testID='add-task-screen'>Add Task</div>;
});

jest.mock('../screens/CalendarScreen', () => {
    return () => <div testID='calendar-screen'>Calendar</div>;
});

jest.mock('../screens/TimerScreen', () => {
    return () => <div testID='timer-screen'>Timer</div>;
});

describe('BottomTab', () => {
    // Test if all  the bottom tab labels are rendered correctly
    it('renders all bottom tabs', async () => {
        // Renders the BottomTab component
        const { getByText } = render(
            <NavigationContainer>
                <BottomTab />
            </NavigationContainer>
        );

        // Verify that all bottom tab labels are rendered
        expect(getByText('Home')).toBeTruthy();
        expect(getByText('Groups')).toBeTruthy();
        expect(getByText('Add Task')).toBeTruthy();
        expect(getByText('Calendar')).toBeTruthy();
        expect(getByText('Timer')).toBeTruthy();
    });

    // Test navigation to the Home screen when Home tab is pressed
    it('navigates to the Home screen when the Home tab is pressed', async () => {
        // Renders the BottomTab component
        const { getByText, getByTestId } = render(
            <NavigationContainer>
                <BottomTab />
            </NavigationContainer>
        );

        // Simulate Home tab press
        fireEvent.press(getByText('Home'));

        // Verify that the Home screen is rendered
        expect(getByTestId('home-screen')).toBeTruthy();
    });

    // Test navigation to the Groups screen when Groups tab is pressed
    it('navigates to the Groups screen when the Groups tab is pressed', async () => {
        // Renders the BottomTab component
        const { getByText, getByTestId } = render(
            <NavigationContainer>
                <BottomTab />
            </NavigationContainer>
        );

        // Simulate Groups tab press
        fireEvent.press(getByText('Groups'));

        // Verify that the Groups screen is rendered
        expect(getByTestId('groups-screen')).toBeTruthy();
    });

    // Test navigation to the Add Task screen when Add Task tab is pressed
    it('navigates to the Add Task screen when the Add Task tab is pressed', async () => {
        // Renders the BottomTab component
        const { getByText, getByTestId } = render(
            <NavigationContainer>
                <BottomTab />
            </NavigationContainer>
        );

        // Simulate Add Task tab press
        fireEvent.press(getByText('Add Task'));

        // Verify that the Add Task screen is rendered
        expect(getByTestId('add-task-screen')).toBeTruthy();
    });

    // Test navigation to the Calendar screen when Calendar tab is pressed
    it('navigates to the Calendar screen when the Calendar tab is pressed', async () => {
        // Renders the BottomTab component
        const { getByText, getByTestId } = render(
            <NavigationContainer>
                <BottomTab />
            </NavigationContainer>
        );

        // Simulate Calendar tab press
        fireEvent.press(getByText('Calendar'));

        // Verify that the Calendar screen is rendered
        expect(getByTestId('calendar-screen')).toBeTruthy();
    });

    // Test navigation to the Timer screen when Timer tab is pressed
    it('navigates to the Timer screen when the Timer tab is pressed', async () => {
        // Renders the BottomTab component
        const { getByText, getByTestId } = render(
            <NavigationContainer>
                <BottomTab />
            </NavigationContainer>
        );

        // Simulate Timer tab press
        fireEvent.press(getByText('Timer'));

        // Verify that the Timer screen is rendered
        expect(getByTestId('timer-screen')).toBeTruthy();
    });

    // Snapshot test for BottomTab
    it('should match snapshot of Bottom Tab', () => {
        // Renders the BottomTab component
        const { toJSON } = render(
            <NavigationContainer>
                <BottomTab />
            </NavigationContainer>
        );
        // Verify snapshot matches
        expect(toJSON()).toMatchSnapshot();
    });

});