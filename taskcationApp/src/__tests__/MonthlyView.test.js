// Import dependencies and libraries used for testing Monthly View
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import MonthlyView from '../components/MonthlyView';

// Mock props
const mockSetSelectedDate = jest.fn();
const mockOnTaskPress = jest.fn();
const mockOnPrevMonth = jest.fn();
const mockOnNextMonth = jest.fn();
const mockToggleTaskCompletion = jest.fn();

// Mock selected date
const selectedDate = new Date('2025-01-02T18:00:00');

// Mock Tasks
const mockTasks = [
    { id: 'task1', task_name: 'Test Task 1', status: false, end_date: new Date('2025-01-02T18:00:00') },
    { id: 'task2', task_name: 'Test Task 2', status: true, end_date: new Date('2025-01-02T18:00:00') },
    { id: 'task3', task_name: 'Test Task 3', status: false, end_date: new Date('2025-01-01T15:00:00') },
    { id: 'task4', task_name: 'Test Task 4', status: false, end_date: new Date('2025-01-03T15:00:00') },
];

// Function to render Monthly View with default or overridden props
function renderMonthlyView(overrides = {}) {
    const props = {
        selectedDate,
        setSelectedDate: mockSetSelectedDate,
        tasks: mockTasks,
        onTaskPress: mockOnTaskPress,
        onPrevMonth: mockOnPrevMonth,
        onNextMonth: mockOnNextMonth,
        toggleTaskCompletion: mockToggleTaskCompletion,
        ...overrides,
    };
    return render(<MonthlyView {...props} />);
}

describe('MonthlyView', () => {
    // Clear all mocks before each test
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Test to display correct header and weekdays details after fetching
    it('should display correct header and weekdays details after fetching', () => {
        // Renders the MonthlyView component
        const { getByText, getByTestId } = renderMonthlyView();
        
        // Verify that all components are rendered with the correct text
        expect(getByText('January 2025')).toBeTruthy();
        expect(getByTestId('prev-month')).toBeTruthy();
        expect(getByTestId('next-month')).toBeTruthy();
        ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach((dayAbbrev) => {
            expect(getByText(dayAbbrev)).toBeTruthy();
        });
    });

    // Test to display correct grid details after fetching
    it('should display correct grid details after fetching', () => {
        // Renders the MonthlyView component
        const { queryAllByText, getByText, getAllByText, getByTestId } = renderMonthlyView();

        // Verify that all components are rendered with the correct text
        for (let i = 1; i <= 31; i++) {
            expect(queryAllByText(i.toString()).length).toBeGreaterThan(0);
        }
        expect(getAllByText('Test Task 1')).toBeTruthy();
        expect(getAllByText('Test Task 2')).toBeTruthy();
        expect(getByTestId('strikeThrough-task2')).toBeTruthy();
        expect(getByText('Test Task 3')).toBeTruthy();
        expect(getByText('Test Task 4')).toBeTruthy();
        
    });

    // Test to display the selected date information
    it('should display the selected date information', () => {
        // Renders the MonthlyView component
        const { getByText, getAllByText, getByTestId } = renderMonthlyView();

        // Verify that all components are rendered with the correct text
        expect(getByText('Tasks for 02/01/2025')).toBeTruthy();
        expect(getAllByText('Test Task 1')).toBeTruthy();
        expect(getAllByText('Test Task 2')).toBeTruthy();
        expect(getByTestId('checkbox-task1')).toBeTruthy();
        expect(getByTestId('checkbox-task2')).toBeTruthy();
        expect(getByTestId('strikeThrough-list-task2')).toBeTruthy();
    });

    // Test to call setSelectedDate when a day number is pressed
    it('should call setSelectedDate when a day number is pressed', () => {
        // Renders the MonthlyView component
        const { getByText } = renderMonthlyView();

        // Press on 3
        fireEvent.press(getByText('3'));
        // Verify that mockSetSelectedDate has been called to change number
        expect(mockSetSelectedDate).toHaveBeenCalledTimes(1);
    });

    // Test to call onPrevMonth when left arrow is pressed
    it('should call onPrevMonth when left arrow is pressed', () => {
        // Renders the MonthlyView component
        const { getByTestId } = renderMonthlyView();

        // Verify that the previous month button is displayed correctly
        expect(getByTestId('prev-month')).toBeTruthy();
        // Press on previous month
        fireEvent.press(getByTestId('prev-month'));

        // Verify that mockOnPrevMonth has been called to change to previous month
        expect(mockOnPrevMonth).toHaveBeenCalledTimes(1);
    });

    // Test to call onNextMonth when right arrow is pressed
    it('should call onNextMonth when right arrow is pressed', () => {
        // Renders the MonthlyView component
        const { getByTestId } = renderMonthlyView();

        // Verify that the next month button is displayed correctly
        expect(getByTestId('next-month')).toBeTruthy();
        // Press on next month
        fireEvent.press(getByTestId('next-month'));

        // Verify that mockOnNextMonth has been called to change to next month
        expect(mockOnNextMonth).toHaveBeenCalledTimes(1);
    });

    // Test to call onTaskPress when a task is pressed in the cell
    it('should call onTaskPress when a task is pressed in the cell', () => {
        // Renders the MonthlyView component
        const { getByTestId, getAllByText } = renderMonthlyView();

        // Verify that Test Task 1 is displayed correctly
        expect(getAllByText('Test Task 1')).toBeTruthy();
        // Press on the cell for task1 
        fireEvent.press(getByTestId('cell-task1'));

        // Verify that mockOnTaskPress has been called to navigate to TaskDetailScreen
        expect(mockOnTaskPress).toHaveBeenCalledWith('task1');
    });

    // Test to call onTaskPress when a task is pressed in the list
    it('should call onTaskPress when a task is pressed in the list', () => {
        // Renders the MonthlyView component
        const { getByTestId, getAllByText } = renderMonthlyView();

        // Verify that Test Task 1 is displayed correctly
        expect(getAllByText('Test Task 1')).toBeTruthy();
        // Press on the list for task1 
        fireEvent.press(getByTestId('list-task1'));

        // Verify that mockOnTaskPress has been called to navigate to TaskDetailScreen
        expect(mockOnTaskPress).toHaveBeenCalledWith('task1');
    });

    // Test to call toggleTaskCompletion when the checkbox is pressed in the list
    it('should call toggleTaskCompletion when the checkbox is pressed in the list', async () => {
        // Renders the MonthlyView component
        const { getByText, getByTestId, getAllByText } = renderMonthlyView();

        // Verify that all components are rendered with the correct text
        expect(getByText('Tasks for 02/01/2025')).toBeTruthy();
        expect(getAllByText('Test Task 1')).toBeTruthy();
        expect(getAllByText('Test Task 2')).toBeTruthy();
        expect(getByTestId('checkbox-task1')).toBeTruthy();
        expect(getByTestId('checkbox-task2')).toBeTruthy();
        expect(getByTestId('strikeThrough-list-task2')).toBeTruthy();
        fireEvent.press(getByTestId('checkbox-task1'));

        await waitFor(() => {
            // Verify that mockToggleTaskCompletion has been called to toggle task completion
            expect(mockToggleTaskCompletion).toHaveBeenCalledTimes(1);
        });
    });
    

    // Snapshot test for MonthlyView
    it('should match snapshot', async () => {
        // Renders the MonthlyView component
        const { toJSON } = renderMonthlyView();
        
        // Verify snapshot matches
        expect(toJSON()).toMatchSnapshot();
    });
});