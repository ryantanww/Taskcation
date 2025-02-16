// Import dependencies and libraries used for testing Daily View
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { useIsFocused } from '@react-navigation/native';
import { ScrollView } from 'react-native';
import DailyView from '../components/DailyView';

// Mock props
const mockOnTaskPress = jest.fn();
const mockOnPrevDay = jest.fn();
const mockOnNextDay = jest.fn();

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
function renderDailyView(overrides = {}) {
    const props = {
        selectedDate,
        tasks: mockTasks,
        onTaskPress: mockOnTaskPress,
        onPrevDay: mockOnPrevDay,
        onNextDay: mockOnNextDay,
        ...overrides,
    };
    return render(<DailyView {...props} />);
}

describe('DailyView', () => {
    // Clear all mocks before each test
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Test to render the correct header with day, month and year
    it('should render the correct header with day, month and year', () => {
        // Renders the DailyView component
        const { getByText, getByTestId } = renderDailyView();

        // Verify that all components are rendered with the correct text
        expect(getByText('02 January 2025')).toBeTruthy();
        expect(getByTestId('prev-day')).toBeTruthy();
        expect(getByTestId('next-day')).toBeTruthy();
    });

    // Test to render the hour labels on the left
    it('should render the hour labels on the left', () => {
        // Renders the DailyView component
        const { getByText } = renderDailyView();
        
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
        // Renders the DailyView component
        const { getByText, getByTestId, queryByText } = renderDailyView();

        // Verify that all components are rendered with the correct text
        expect(getByText('Test Task 1')).toBeTruthy();
        expect(getByText('Test Task 2')).toBeTruthy();
        expect(getByTestId('strikeThrough-task2')).toBeTruthy();
        expect(queryByText('Test Task 3')).toBeNull();
        expect(queryByText('Test Task 4')).toBeNull();
    });

    // Test to call onPrevDay when the left arrow is pressed
    it('should call onPrevDay when the left arrow is pressed', () => {
        // Renders the DailyView component
        const { getByTestId } = renderDailyView();

        // Verify that the previous day button is displayed correctly
        expect(getByTestId('prev-day')).toBeTruthy();
        // Press on previous day
        fireEvent.press(getByTestId('prev-day'));

        // Verify that mockOnPrevDay has been called to change to previous day
        expect(mockOnPrevDay).toHaveBeenCalledTimes(1);
    });

    // Test to call onNextDay when the right arrow is pressed
    it('should call onNextDay when the right arrow is pressed', () => {
        // Renders the DailyView component
        const { getByTestId } = renderDailyView();

        // Verify that the next day button is displayed correctly
        expect(getByTestId('next-day')).toBeTruthy();
        // Press on next day
        fireEvent.press(getByTestId('next-day'));

        // Verify that mockOnNextWeek has been called to change to next day
        expect(mockOnNextDay).toHaveBeenCalledTimes(1);
    });

    // Test to call onTaskPress when a task is pressed
    it('should call onTaskPress when a task is pressed', () => {
        // Renders the DailyView component
        const { getByText } = renderDailyView();

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

        // Renders the DailyView component
        renderDailyView();
        
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

        // Renders the DailyView component
        renderDailyView();
        
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

    
    // Snapshot test for DailyView
    it('should match snapshot', async () => {
        // Renders the DailyView component
        const { toJSON } = renderDailyView();
        
        // Verify snapshot matches
        expect(toJSON()).toMatchSnapshot();
    });
});