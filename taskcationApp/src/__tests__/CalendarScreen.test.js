// Import dependencies and libraries used for testing Calendar Screen
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import CalendarScreen from '../screens/CalendarScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTasksByCreator, updateTask } from '../services/taskService';
import { markAllSubtasksComplete } from '../services/subtaskService';
import { NavigationContainer, useIsFocused } from '@react-navigation/native';
import { Alert } from 'react-native'; 

// Mock Tasks
const mockTasks = [
    { id: 'task1', task_name: 'Test Task 1', status: false, end_date: new Date('2025-01-02T18:00:00') },
    { id: 'task2', task_name: 'Test Task 2', status: true, end_date: new Date('2025-01-02T18:00:00') },
    { id: 'task3', task_name: 'Test Task 3', status: false, end_date: new Date('2025-01-01T15:00:00') },
    { id: 'task4', task_name: 'Test Task 4', status: false, end_date: new Date('2025-01-03T15:00:00') },
    { id: 'task5', task_name: 'Test Task 5', status: false, end_date: new Date('2024-12-27T18:00:00') },
    { id: 'task6', task_name: 'Test Task 6', status: true, end_date: new Date('2024-12-28T18:00:00') },
];

// Mock useNavigation hook
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual('@react-navigation/native');
    return {
        ...actualNav,
        useNavigation: () => ({
            navigate: mockNavigate,
        }),
        useIsFocused: jest.fn(() => true),
    };
});

describe('CalendarScreen', () => {
    // Clear all mocks and reset them before each test
    beforeEach(() => {
        getTasksByCreator.mockClear();
        getTasksByCreator.mockReset();
        jest.clearAllMocks();
        // Spy on Alert.alert to verify alerts
        jest.spyOn(Alert, 'alert').mockImplementation(() => {});
        // Mock timers
        jest.useFakeTimers('modern');
        // Set test system date
        jest.setSystemTime(new Date('2025-01-02T18:00:00'));
        // Intialise the AsyncStorage with user_id and joined_date
        AsyncStorage.getItem.mockImplementation(async (key) => {
            if (key === 'user_id') {
                return 'temp_user_123';
            }
            return null;
        });
        // Mock getTasksByCreator
        getTasksByCreator.mockResolvedValue(mockTasks);
    });

    afterEach(() => {
        // Restore real timers after each test
        jest.useRealTimers();
    });

    // Test to check if user ID is stored in AsyncStorage
    it('should store user ID in AsyncStorage', async () => {
        // Retrieve the user ID
        const userId = await AsyncStorage.getItem('user_id');
        // Verify that the user ID is correctly stored
        expect(userId).toBe('temp_user_123');
    });

    // Test to render MonthlyView as default view
    it('should render MonthlyView as default view', async () => {
        // Renders the CalendarScreen component
        const { getByTestId, getByText, getAllByText, queryByText } = render(
            <NavigationContainer>
                <CalendarScreen />
            </NavigationContainer>
        );

        await waitFor(() => {
            // Verify that all components are rendered with the correct text
            expect(getByText('Monthly')).toBeTruthy();
            expect(getByText('January 2025')).toBeTruthy();
            expect(getByTestId('prev-month')).toBeTruthy();
            expect(getByTestId('next-month')).toBeTruthy();
            ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach((dayAbbrev) => {
                expect(getByText(dayAbbrev)).toBeTruthy();
            });
            expect(getByText('Tasks for 02/01/2025')).toBeTruthy();
            expect(getAllByText('Test Task 1')).toBeTruthy();
            expect(getAllByText('Test Task 2')).toBeTruthy();
            expect(getByTestId('checkbox-task1')).toBeTruthy();
            expect(getByTestId('checkbox-task2')).toBeTruthy();
            expect(getByTestId('strikeThrough-task2')).toBeTruthy();
            expect(getByTestId('strikeThrough-list-task2')).toBeTruthy();
            expect(getByText('Test Task 3')).toBeTruthy();
            expect(getByText('Test Task 4')).toBeTruthy();
        });

        await waitFor(() => {
            // Verify that the tasks in the month before is not seen
            expect(queryByText('Test Task 5')).toBeNull();
            expect(queryByText('Test Task 6')).toBeNull();
        });
    });
    
    // Test to render WeeklyView when Weekly tab is pressed
    it('should render WeeklyView when Weekly tab is pressed', async () => {
        // Renders the CalendarScreen component
        const { getByText, getByTestId, queryByText } = render(
            <NavigationContainer>
                <CalendarScreen />
            </NavigationContainer>
        );
        await waitFor(() => {
            // Verify Weekly is displayed correctly 
            expect(getByText('Weekly')).toBeTruthy();
        });
    
        // Press on Weekly
        fireEvent.press(getByText('Weekly'));
    
        await waitFor(() => {
            // Verify that all components are rendered with the correct text
            expect(getByText('December 2024')).toBeTruthy();
            expect(getByTestId('prev-week')).toBeTruthy();
            expect(getByTestId('next-week')).toBeTruthy();
            expect(getByText('Wk 1')).toBeTruthy();
            ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach((dayAbbrev) => {
                expect(getByText(dayAbbrev)).toBeTruthy();
            });
            for (let i = 1; i <= 12; i++) {
                expect(getByText(i +' AM')).toBeTruthy();
            }
            for (let i = 1; i <= 12; i++) {
                expect(getByText(i +' PM')).toBeTruthy();
            }
            expect(getByText('Test Task 1')).toBeTruthy();
            expect(getByText('Test Task 2')).toBeTruthy();
            expect(getByTestId('strikeThrough-task2')).toBeTruthy();
            expect(getByText('Test Task 3')).toBeTruthy();
            expect(getByText('Test Task 4')).toBeTruthy();
        });

        await waitFor(() => {
            // Verify that the tasks in the week before is not seen
            expect(queryByText('Test Task 5')).toBeNull();
            expect(queryByText('Test Task 6')).toBeNull();
        });
    });

    // Test to render WeeklyView when Daily tab is pressed
    it('should render DailyView when the Daily tab is pressed', async () => {
        // Renders the CalendarScreen component
        const { getByText, getByTestId, queryByText } = render(
            <NavigationContainer>
                <CalendarScreen />
            </NavigationContainer>
        );
        await waitFor(() => {
            // Verify Daily is displayed correctly 
            expect(getByText('Daily')).toBeTruthy();
        });
    
        // Press on Daily
        fireEvent.press(getByText('Daily'));
    
        await waitFor(() => {
            // Verify that all components are rendered with the correct text
            expect(getByText('02 January 2025')).toBeTruthy();
            expect(getByTestId('prev-day')).toBeTruthy();
            expect(getByTestId('next-day')).toBeTruthy();
            for (let i = 1; i <= 12; i++) {
                expect(getByText(i +' AM')).toBeTruthy();
            }
            for (let i = 1; i <= 12; i++) {
                expect(getByText(i +' PM')).toBeTruthy();
            }
            expect(getByText('Test Task 1')).toBeTruthy();
            expect(getByText('Test Task 2')).toBeTruthy();
            expect(getByTestId('strikeThrough-task2')).toBeTruthy();
        });

        await waitFor(() => {
            // Verify that the tasks not on that day is not seen
            expect(queryByText('Test Task 3')).toBeNull();
            expect(queryByText('Test Task 4')).toBeNull();
            expect(queryByText('Test Task 5')).toBeNull();
            expect(queryByText('Test Task 6')).toBeNull();
        });
    });

    // Test to call getTasksByCreator when fetching tasks
    it('should call getTasksByCreator when fetching tasks', async () => {
        // Renders the CalendarScreen component
        const { getByTestId, getByText } = render(
            <NavigationContainer>
                <CalendarScreen />
            </NavigationContainer>
        );
        await waitFor(() => {
            // Verify that all components are rendered with the correct text
            expect(getByText('Monthly')).toBeTruthy();
            expect(getByText('January 2025')).toBeTruthy();
            expect(getByTestId('prev-month')).toBeTruthy();
            expect(getByTestId('next-month')).toBeTruthy();
            ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach((dayAbbrev) => {
                expect(getByText(dayAbbrev)).toBeTruthy();
            });
        });
    
        // Verify that getTasksByCreator has been called with the correct userID
        expect(getTasksByCreator).toHaveBeenCalledWith(expect.anything(), 'temp_user_123');
    });

    // Test to handle previous and next month actions
    it('should handle previous and next month actions', async () => {
        // Renders the CalendarScreen component
        const { getByTestId, getByText, getAllByText, queryByText } = render(
            <NavigationContainer>
                <CalendarScreen />
            </NavigationContainer>
        );

        await waitFor(() => {
            // Verify that all components are rendered with the correct text
            expect(getByText('Monthly')).toBeTruthy();
            expect(getByText('January 2025')).toBeTruthy();
            expect(getByTestId('prev-month')).toBeTruthy();
            expect(getByTestId('next-month')).toBeTruthy();
        });

        // Press on previous month
        fireEvent.press(getByTestId('prev-month'));

        await waitFor(() => {
            // Verify that all components are rendered with the correct text
            expect(getByText('Monthly')).toBeTruthy();
            expect(getByText('December 2024')).toBeTruthy();
            expect(getByTestId('prev-month')).toBeTruthy();
            expect(getByTestId('next-month')).toBeTruthy();
            expect(getByText('Tasks for 02/12/2024')).toBeTruthy();
            expect(getByText('Test Task 5')).toBeTruthy();
            expect(getByText('Test Task 6')).toBeTruthy();
            expect(getByTestId('strikeThrough-task6')).toBeTruthy();
        });

        // Press on next month
        fireEvent.press(getByTestId('next-month'));

        await waitFor(() => {
            // Verify that all components are rendered with the correct text
            expect(getByText('Monthly')).toBeTruthy();
            expect(getByText('January 2025')).toBeTruthy();
            expect(getByTestId('prev-month')).toBeTruthy();
            expect(getByTestId('next-month')).toBeTruthy();
            ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach((dayAbbrev) => {
                expect(getByText(dayAbbrev)).toBeTruthy();
            });
            expect(getByText('Tasks for 02/01/2025')).toBeTruthy();
            expect(getAllByText('Test Task 1')).toBeTruthy();
            expect(getAllByText('Test Task 2')).toBeTruthy();
            expect(getByTestId('checkbox-task1')).toBeTruthy();
            expect(getByTestId('checkbox-task2')).toBeTruthy();
            expect(getByTestId('strikeThrough-task2')).toBeTruthy();
            expect(getByTestId('strikeThrough-list-task2')).toBeTruthy();
            expect(getByText('Test Task 3')).toBeTruthy();
            expect(getByText('Test Task 4')).toBeTruthy();
        });

        await waitFor(() => {
            // Verify that the tasks in the month before is not seen
            expect(queryByText('Test Task 5')).toBeNull();
            expect(queryByText('Test Task 6')).toBeNull();
        });

    });

    // Test to handle previous and next week actions
    it('should handle previous and next week actions', async () => {
        // Renders the CalendarScreen component
        const { getByTestId, getByText, queryByText } = render(
            <NavigationContainer>
                <CalendarScreen />
            </NavigationContainer>
        );

        await waitFor(() => {
            // Verify Weekly is displayed correctly 
            expect(getByText('Weekly')).toBeTruthy();
        });

        // Press on Weekly
        fireEvent.press(getByText('Weekly'));

        await waitFor(() => {
            // Verify that all components are rendered with the correct text
            expect(getByText('Weekly')).toBeTruthy();
            expect(getByText('December 2024')).toBeTruthy();
            expect(getByTestId('prev-week')).toBeTruthy();
            expect(getByTestId('next-week')).toBeTruthy();
        });

        // Press on previous week
        fireEvent.press(getByTestId('prev-week'));

        await waitFor(() => {
            // Verify that all components are rendered with the correct text
            expect(getByText('Weekly')).toBeTruthy();
            expect(getByText('December 2024')).toBeTruthy();
            expect(getByText('Wk 52')).toBeTruthy();
            ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach((dayAbbrev) => {
                expect(getByText(dayAbbrev)).toBeTruthy();
            });
            expect(getByText('Test Task 5')).toBeTruthy();
            expect(getByText('Test Task 6')).toBeTruthy();
            expect(getByTestId('strikeThrough-task6')).toBeTruthy();
            
        });

        await waitFor(() => {
            // Verify that the tasks in the week after is not seen
            expect(queryByText('Test Task 1')).toBeNull();
            expect(queryByText('Test Task 2')).toBeNull();
            expect(queryByText('Test Task 3')).toBeNull();
            expect(queryByText('Test Task 4')).toBeNull();
        });

        // Press on next week
        fireEvent.press(getByTestId('next-week'));

        await waitFor(() => {
            // Verify that all components are rendered with the correct text
            expect(getByText('Weekly')).toBeTruthy();
            expect(getByText('December 2024')).toBeTruthy();
            expect(getByTestId('prev-week')).toBeTruthy();
            expect(getByTestId('next-week')).toBeTruthy();
            expect(getByText('Wk 1')).toBeTruthy();
            ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach((dayAbbrev) => {
                expect(getByText(dayAbbrev)).toBeTruthy();
            });
            for (let i = 1; i <= 12; i++) {
                expect(getByText(i +' AM')).toBeTruthy();
            }
            for (let i = 1; i <= 12; i++) {
                expect(getByText(i +' PM')).toBeTruthy();
            }
            expect(getByText('Test Task 1')).toBeTruthy();
            expect(getByText('Test Task 2')).toBeTruthy();
            expect(getByTestId('strikeThrough-task2')).toBeTruthy();
            expect(getByText('Test Task 3')).toBeTruthy();
            expect(getByText('Test Task 4')).toBeTruthy();
        });

        await waitFor(() => {
            // Verify that the tasks in the week before is not seen
            expect(queryByText('Test Task 5')).toBeNull();
            expect(queryByText('Test Task 6')).toBeNull();
        });
    });

    // Test to handle previous and next day actions
    it('should handle previous and next day actions', async () => {
        // Renders the CalendarScreen component
        const { getByTestId, getByText, queryByText } = render(
            <NavigationContainer>
                <CalendarScreen />
            </NavigationContainer>
        );

        await waitFor(() => {
            // Verify Daily is displayed correctly 
            expect(getByText('Daily')).toBeTruthy();
        });

        // Press on Daily
        fireEvent.press(getByText('Daily'));

        await waitFor(() => {
            // Verify that all components are rendered with the correct text
            expect(getByText('Daily')).toBeTruthy();
            expect(getByText('02 January 2025')).toBeTruthy();
            expect(getByTestId('prev-day')).toBeTruthy();
            expect(getByTestId('next-day')).toBeTruthy();
        });

        // Press on previous day
        fireEvent.press(getByTestId('prev-day'));

        await waitFor(() => {
            // Verify that all components are rendered with the correct text
            expect(getByText('Daily')).toBeTruthy();
            expect(getByText('01 January 2025')).toBeTruthy();
            expect(getByTestId('prev-day')).toBeTruthy();
            expect(getByTestId('next-day')).toBeTruthy();
            for (let i = 1; i <= 12; i++) {
                expect(getByText(i +' AM')).toBeTruthy();
            }
            for (let i = 1; i <= 12; i++) {
                expect(getByText(i +' PM')).toBeTruthy();
            }
            expect(getByText('Test Task 3')).toBeTruthy();
        });

        await waitFor(() => {
            // Verify that the tasks not on that day is not seen
            expect(queryByText('Test Task 1')).toBeNull();
            expect(queryByText('Test Task 2')).toBeNull();
            expect(queryByText('Test Task 4')).toBeNull();
            expect(queryByText('Test Task 5')).toBeNull();
            expect(queryByText('Test Task 6')).toBeNull();
        });

        // Press on next day
        fireEvent.press(getByTestId('next-day'));

        await waitFor(() => {
            // Verify that all components are rendered with the correct text
            expect(getByText('Daily')).toBeTruthy();
            expect(getByText('02 January 2025')).toBeTruthy();
            expect(getByTestId('prev-day')).toBeTruthy();
            expect(getByTestId('next-day')).toBeTruthy();
            for (let i = 1; i <= 12; i++) {
                expect(getByText(i +' AM')).toBeTruthy();
            }
            for (let i = 1; i <= 12; i++) {
                expect(getByText(i +' PM')).toBeTruthy();
            }
            expect(getByText('Test Task 1')).toBeTruthy();
            expect(getByText('Test Task 2')).toBeTruthy();
            expect(getByTestId('strikeThrough-task2')).toBeTruthy();
        });

        await waitFor(() => {
            // Verify that the tasks not on that day is not seen
            expect(queryByText('Test Task 3')).toBeNull();
            expect(queryByText('Test Task 4')).toBeNull();
            expect(queryByText('Test Task 5')).toBeNull();
            expect(queryByText('Test Task 6')).toBeNull();
        });
    });

    // Test to toggle task completion successfully
    it('should toggle task completion successfully', async () => {
        // Mock the updateTask service
        updateTask.mockResolvedValueOnce(true);
        // Mock the markAllSubtasksComplete service
        markAllSubtasksComplete.mockResolvedValue(true);
        
        // Renders the CalendarScreen component
        const { getByTestId, getByText } = render(
            <NavigationContainer>
                <CalendarScreen />
            </NavigationContainer>
        );
        await waitFor(() => {
            // Verify that all components are rendered with the correct text
            expect(getByText('Monthly')).toBeTruthy();
            expect(getByText('January 2025')).toBeTruthy();
            expect(getByTestId('prev-month')).toBeTruthy();
            expect(getByTestId('next-month')).toBeTruthy();
        });

        // Press on task1 checkbox
        fireEvent.press(getByTestId('checkbox-task1'));
        
        await waitFor(() => {
            // Verify that updateTask has been called with the updated status
            expect(updateTask).toHaveBeenCalledWith(expect.anything(), 'task1', { status: true });
            // Verify that markAllSubtasksComplete has been called with the updated statuses
            expect(markAllSubtasksComplete).toHaveBeenCalledWith(expect.anything(), 'task1', true);
        });
    });

    // Test to initialise if the screen is focused
    it('should initialise if the screen is focused', async () => {
        // Mock useIsFocused to be true
        useIsFocused.mockReturnValueOnce(true);
    
        // Renders the CalendarScreen component
        render(
            <NavigationContainer>
                <CalendarScreen />
            </NavigationContainer>
        );
    
        await waitFor(() => {
            // Verify the getTasksByCreator has been called twice
            expect(getTasksByCreator).toHaveBeenCalledTimes(2);
        });
    });
    
    // Test to not initialise when the screen is not focused
    it('should not initialise when the screen is not focused', async () => {
        // Mock useIsFocused to be false
        useIsFocused.mockReturnValueOnce(false);
    
        // Renders the CalendarScreen component
        render(
            <NavigationContainer>
                <CalendarScreen />
            </NavigationContainer>
        );
    
        await waitFor(() => {
            // Verify the getTasksByCreator has not been called
            expect(getTasksByCreator).not.toHaveBeenCalled();
        });
    });

    // Test to handle navigation when task is pressed in cell
    it('should handle navigation when task is pressed in cell', async () => {
        // Renders the CalendarScreen component
        const { getByTestId, getByText } = render(
            <NavigationContainer>
                <CalendarScreen />
            </NavigationContainer>
        );
        await waitFor(() => {
            // Verify that all components are rendered with the correct text
            expect(getByText('Monthly')).toBeTruthy();
            expect(getByText('January 2025')).toBeTruthy();
            expect(getByTestId('prev-month')).toBeTruthy();
            expect(getByTestId('next-month')).toBeTruthy();
        });

        // Press on calendar cell task1
        fireEvent.press(getByTestId('cell-task1'));

        // Verify that navigation to TaskDetailScreen screen has been called with taskID as its parameter 
        expect(mockNavigate).toHaveBeenCalledWith('TaskDetailScreen', { taskID: 'task1' });
    });

    // Test to handle navigation when task is pressed in task list
    it('should handle navigation when task is pressed in task list', async () => {
        // Renders the CalendarScreen component
        const { getByTestId, getByText } = render(
            <NavigationContainer>
                <CalendarScreen />
            </NavigationContainer>
        );
        await waitFor(() => {
            // Verify that all components are rendered with the correct text
            expect(getByText('Monthly')).toBeTruthy();
            expect(getByText('January 2025')).toBeTruthy();
            expect(getByTestId('prev-month')).toBeTruthy();
            expect(getByTestId('next-month')).toBeTruthy();
        });

        // Press on task list task1
        fireEvent.press(getByTestId('list-task1'));

        // Verify that navigation to TaskDetailScreen screen has been called with taskID as its parameter 
        expect(mockNavigate).toHaveBeenCalledWith('TaskDetailScreen', { taskID: 'task1' });
    });

    // Tests whether the loading state is rendered correctly
    it('should render loading state', () => {
        // Renders the CalendarScreen component
        const { getByText } = render(
            <NavigationContainer>
                <CalendarScreen />
            </NavigationContainer>
        );

        // Verify the Loading tasks... is displayed
        expect(getByText('Loading tasks...')).toBeTruthy();
    });

    // Tests to show an alert for failing to fetch tasks
    it('should show an alert for failing to fetch tasks', async () => {
        // Mock the task service with an error
        getTasksByCreator.mockRejectedValueOnce(new Error('Error fetching tasks'));

        // Renders the CalendarScreen component
        render(
            <NavigationContainer>
                <CalendarScreen />
            </NavigationContainer>
        );
        await waitFor(() => {
            // Verify that an error alert is shown to the user when failed to fetch tasks
            expect(Alert.alert).toHaveBeenCalledWith('Fetching Tasks Error', 'Failed to fetch tasks.');
        });
    });

    // Tests to show an alert for failing to update task if updateTask fails
    it('should show an alert for failing to update task if updateTask fails', async () => {
        // Mock update task service with an error
        updateTask.mockRejectedValueOnce(new Error('Error updating task'));

        // Renders the CalendarScreen component
        const { getByTestId, getByText } = render(
            <NavigationContainer>
                <CalendarScreen />
            </NavigationContainer>
        );
        await waitFor(() => {
            // Verify that all components are rendered with the correct text
            expect(getByText('Monthly')).toBeTruthy();
            expect(getByText('January 2025')).toBeTruthy();
            expect(getByTestId('prev-month')).toBeTruthy();
            expect(getByTestId('next-month')).toBeTruthy();
        });

        // Press on task1 checkbox
        fireEvent.press(getByTestId('checkbox-task1'));

        await waitFor(() => {
            // Verify that an error alert is shown to the user when failed to update task
            expect(Alert.alert).toHaveBeenCalledWith('Update Task Error', 'Failed to update task.');
        });
    });

    // Snapshot test for CalendarScreen
    it('should match snapshot', async () => {
        // Renders the CalendarScreen component
        const { toJSON } = render(
            <NavigationContainer>
                <CalendarScreen />
            </NavigationContainer>
        );
        
        // Verify snapshot matches
        expect(toJSON()).toMatchSnapshot();
    });
});
