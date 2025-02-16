// Import dependencies and libraries used for testing Weekly View
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { useIsFocused } from '@react-navigation/native';
import { ScrollView } from 'react-native';
import WeeklyView from '../components/WeeklyView';

// Mock props
const mockOnTaskPress = jest.fn();
const mockOnPrevWeek = jest.fn();
const mockOnNextWeek = jest.fn();

// Mock selected date
const selectedDate = new Date('2025-01-02T18:00:00');

// Mock Tasks
const mockTasks = [
    { id: 'task1', task_name: 'Test Task 1', status: false, end_date: new Date('2025-01-02T18:00:00') },
    { id: 'task2', task_name: 'Test Task 2', status: true, end_date: new Date('2025-01-02T18:00:00') },
    { id: 'task3', task_name: 'Test Task 3', status: false, end_date: new Date('2025-01-01T15:00:00') },
    { id: 'task4', task_name: 'Test Task 4', status: false, end_date: new Date('2025-01-03T15:00:00') },
];

// Mock useIsFocused
jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual('@react-navigation/native');
    return {
        ...actualNav,
        useIsFocused: jest.fn(() => true),
    };
});

// Function to render Weekly View with default or overridden props
function renderWeeklyView(overrides = {}) {
    const props = {
        selectedDate,
        tasks: mockTasks,
        onTaskPress: mockOnTaskPress,
        onPrevWeek: mockOnPrevWeek,
        onNextWeek: mockOnNextWeek,
        ...overrides,
    };
    return render(<WeeklyView {...props} />);
}

describe('WeeklyView', () => {
    // Clear all mocks before each test
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Test to render the correct header with month and year
    it('should render the correct header with month and year', () => {
        // Renders the WeeklyView component
        const { getByText, getByTestId } = renderWeeklyView();

        // Verify that all components are rendered with the correct text
        expect(getByText('December 2024')).toBeTruthy();
        expect(getByTestId('prev-week')).toBeTruthy();
        expect(getByTestId('next-week')).toBeTruthy();
    });

    // Test to render the week header with week number, day abbreviations, and day numbers
    it('should render the week header with week number, day abbreviations, and day numbers', () => {
        // Renders the WeeklyView component
        const { getByText } = renderWeeklyView();

        // Verify that all components are rendered with the correct text
        expect(getByText('Wk 1')).toBeTruthy();
        ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach((dayAbbrev) => {
            expect(getByText(dayAbbrev)).toBeTruthy();
        });
    });

    // Test to render the hour labels on the left
    it('should render the hour labels on the left', () => {
        // Renders the WeeklyView component
        const { getByText } = renderWeeklyView();

        // Verify that all components are rendered with the correct text
        for (let i = 1; i <= 12; i++) {
            expect(getByText(i +' AM')).toBeTruthy();
        }
        for (let i = 1; i <= 12; i++) {
            expect(getByText(i +' PM')).toBeTruthy();
        }
    });

    // Test to display the selected date information
    it('should display the selected date information', () => {
        // Renders the WeeklyView component
        const { getByText, getByTestId } = renderWeeklyView();

        // Verify that all components are rendered with the correct text
        expect(getByText('Test Task 1')).toBeTruthy();
        expect(getByText('Test Task 2')).toBeTruthy();
        expect(getByTestId('strikeThrough-task2')).toBeTruthy();
        expect(getByText('Test Task 3')).toBeTruthy();
        expect(getByText('Test Task 4')).toBeTruthy();
    });

    // Test to call onPrevWeek when the left arrow is pressed
    it('should call onPrevWeek when the left arrow is pressed', () => {
        // Renders the WeeklyView component
        const { getByTestId } = renderWeeklyView();

        // Verify that the previous week button is displayed correctly
        expect(getByTestId('prev-week')).toBeTruthy();
        // Press on previous week
        fireEvent.press(getByTestId('prev-week'));

        // Verify that mockOnPrevWeek has been called to change to previous week
        expect(mockOnPrevWeek).toHaveBeenCalledTimes(1);
    });

    // Test to call onNextWeek when the right arrow is pressed
    it('should call onNextWeek when the right arrow is pressed', () => {
        // Renders the WeeklyView component
        const { getByTestId } = renderWeeklyView();

        // Verify that the next week button is displayed correctly
        expect(getByTestId('next-week')).toBeTruthy();
        // Press on next week
        fireEvent.press(getByTestId('next-week'));

        // Verify that mockOnNextWeek has been called to change to next week
        expect(mockOnNextWeek).toHaveBeenCalledTimes(1);
    });

    // Test to call onTaskPress when a task is pressed
    it('should call onTaskPress when a task is pressed', () => {
        // Renders the WeeklyView component
        const { getByText } = renderWeeklyView();

        // Verify that Test Task 1 is displayed correctly
        expect(getByText('Test Task 1')).toBeTruthy();
        // Press on Task Test 1
        fireEvent.press(getByText('Test Task 1'));

        // Verify that mockOnTaskPress has been called to navigate to TaskDetailScreen
        expect(mockOnTaskPress).toHaveBeenCalledWith('task1');
    });

    // Test to scroll to the current hour when focused
    it('should scroll to the current hour when focused', async () => {
        // Mock useIsFocused to be true
        useIsFocused.mockReturnValueOnce(true);

        // Mock timers
        jest.useFakeTimers();
        // Set test system date
        jest.setSystemTime(new Date('2025-01-02T08:00:00'));
    
        // Spy on the scrollTo function of ScrollView to track if it gets called
        const scrollToSpy = jest
            .spyOn(ScrollView.prototype, 'scrollTo')
            .mockImplementation(() => {});

        // Renders the WeeklyView component
        renderWeeklyView();
        
        // Run all pending timers
        jest.runAllTimers();

        await waitFor(() => {
            // Verify that scrollToSpy has been called with correct parameters
            expect(scrollToSpy).toHaveBeenCalledWith({ y: 490, animated: false });
        });

        // Restore the scrollTo implementation
        scrollToSpy.mockRestore();

        // Restore real timers after each test
        jest.useRealTimers();
    });

    // Test to not scroll to the current hour when not focused
    it('should not scroll to the current hour when not focused', async () => {
        // Mock useIsFocused to be true
        useIsFocused.mockReturnValueOnce(false);

        // Mock timers
        jest.useFakeTimers();
        // Set test system date
        jest.setSystemTime(new Date('2025-01-02T08:00:00'));
    
        // Spy on the scrollTo function of ScrollView to track if it gets called
        const scrollToSpy = jest
            .spyOn(ScrollView.prototype, 'scrollTo')
            .mockImplementation(() => {});

        // Renders the WeeklyView component
        renderWeeklyView();
        
        // Run all pending timers
        jest.runAllTimers();

        await waitFor(() => {
            // Verify that scrollToSpy has not been called with correct parameters
            expect(scrollToSpy).not.toHaveBeenCalled();
        });

        // Restore the scrollTo implementation
        scrollToSpy.mockRestore();
        
        // Restore real timers after each test
        jest.useRealTimers();
    });
    
    // Snapshot test for WeeklyView
    it('should match snapshot', async () => {
        // Renders the WeeklyView component
        const { toJSON } = renderWeeklyView();
        
        // Verify snapshot matches
        expect(toJSON()).toMatchSnapshot();
    });
});