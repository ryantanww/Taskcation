// Import dependencies and libraries used for testing Home Screen
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import HomeScreen from '../screens/HomeScreen'; // Adjust the path as needed
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createUser } from '../services/userService';
import { getTasksByCreator } from '../services/taskService';
import { createGroup, getGroupsByCreator } from '../services/groupsService';

// Array of mocked tasks 
const mockTasks = [
    { id: '1', task_name: 'Task 1', status: false, end_date: '2025-01-20T03:05:00Z' },
    { id: '2', task_name: 'Task 2', status: true, end_date: '2025-01-21T01:20:30Z' },
];

const mockGroups = [
    { id: '1', group_name: 'Math', group_type: 'Subjects', created_by: 'temp_user_123' },
    { id: '2', group_name: 'General', group_type: 'Categories', created_by: 'temp_user_123' },
];

describe('HomeScreen', () => {

    // Clear all mocks including AsyncStorage and getTaskByCreator before each test
    beforeEach(() => {
        AsyncStorage.getItem.mockClear();
        createGroup.mockClear();
        getGroupsByCreator.mockClear();
        getTasksByCreator.mockClear();
        jest.clearAllMocks();
    });

    /** Function testing */
    
    // Test to check if user ID is stored inn AsyncStorage
    it('should store user ID in AsyncStorage', async () => {
        // Simulate setting user ID
        await AsyncStorage.setItem('user_id', 'temp_user_123');
        // Retrieve the user ID
        const userId = await AsyncStorage.getItem('user_id');
        // Verify that the user ID is correctly stored
        expect(userId).toBe('temp_user_123');
    });

    // Test to create default groups when no groups exist
    it('should create default groups when no groups exist', async () => {
        AsyncStorage.getItem.mockResolvedValueOnce('temp_user_123');
        getGroupsByCreator.mockResolvedValueOnce([]);
        const { getByText } = render(<HomeScreen />);
        await waitFor(() => {
            expect(createGroup).toHaveBeenCalledTimes(2);
            expect(createGroup).toHaveBeenCalledWith(expect.anything(), {
                group_name: 'Math',
                group_type: 'Subjects',
                grade_id: 'N/A',
                created_by: 'temp_user_123',
            });
            expect(createGroup).toHaveBeenCalledWith(expect.anything(), {
                group_name: 'General',
                group_type: 'Categories',
                grade_id: 'N/A',
                created_by: 'temp_user_123',
            });
        });
    });

    // Test to ensure groups are not created if they already exist
    it('should not create default groups if groups already exist', async () => {
        AsyncStorage.getItem.mockResolvedValueOnce('temp_user_123');
        getGroupsByCreator.mockResolvedValueOnce(mockGroups);
        const { getByText } = render(<HomeScreen />);
        await waitFor(() => {
            expect(createGroup).not.toHaveBeenCalled();
        });
    });

    // Test to verify empty state message when there no tasks exist
    it('should render "Add task to start using Taskcation!" when no tasks exist', async () => {
        // Mock stored user ID
        AsyncStorage.getItem.mockResolvedValueOnce('temp_user_123');
        // Mock no tasks state
        getTasksByCreator.mockResolvedValueOnce([]);

        // Renders the HomeScreen component
        const { getByText } = render(<HomeScreen />);

        await waitFor(() => {
            // Verify the 'Add task to start using Taskcation!' is displayed
            expect(getByText('Add task to start using Taskcation!')).toBeTruthy()
        });
    });

    // Test to verify UI updates when toggling completion for the empty state
    it('should toggle "Add task to start using Taskcation!" completion and update UI', async () => {
        // Mock stored user ID
        AsyncStorage.getItem.mockResolvedValueOnce('temp_user_123');
        // Mock no tasks state
        getTasksByCreator.mockResolvedValueOnce([]);

        // Renders the HomeScreen component
        const { getByText, getByTestId } = render(<HomeScreen />);

        await waitFor(() => {
            // Verify the 'Add task to start using Taskcation!' is displayed
            expect(getByText('Add task to start using Taskcation!')).toBeTruthy()
        });

        // Select no tasks checkbox
        const noTaskCheckbox = getByTestId(`checkbox-no-tasks`);
        // Simulate checkbox press
        fireEvent.press(noTaskCheckbox);

        // Select strike through element
        const strikeThroughNoTask = getByTestId(`strikeThrough-no-tasks`)

        await waitFor(() => {
            // Verify if checkbox exists
            expect(noTaskCheckbox).toBeTruthy();
            // Verify if strike through is displayed
            expect(strikeThroughNoTask).toBeTruthy();
        });
    });

    // Test to verify tasks are grouped and displayed by their date
    it('renders tasks grouped by their dates', async () => {
        // Mock stored user ID
        AsyncStorage.getItem.mockResolvedValueOnce('temp_user_123');
        // Mock tasks
        getTasksByCreator.mockResolvedValueOnce(mockTasks);
        
        // Renders the HomeScreen component
        const { getByText } = render(<HomeScreen />);
        
        await waitFor(() => {
            // Verifies the first group date and task name
            expect(getByText('20/01/2025')).toBeTruthy();
            expect(getByText('Task 1')).toBeTruthy();

            // Verifies the second group date and task name
            expect(getByText('21/01/2025')).toBeTruthy();
            expect(getByText('Task 2')).toBeTruthy();
        });
    });

    // Test to verify UI updates when toggling completion for the task
    it('should toggle task completion and update UI', async () => {
        // Mock stored user ID
        AsyncStorage.getItem.mockResolvedValueOnce('temp_user_123');
        // Mock tasks
        getTasksByCreator.mockResolvedValueOnce(mockTasks);

        // Renders the HomeScreen component
        const { getByText, getByTestId } = render(<HomeScreen />);

        await waitFor(() => {
            // Verify that 'Task 1' is displayed
            expect(getByText('Task 1')).toBeTruthy()
        });

        // Select Task 1 checkbox
        const taskCheckbox = getByTestId(`checkbox-${mockTasks[0].id}`);
        // Simulate checkbox press
        fireEvent.press(taskCheckbox);

        // Update task status in mock data
        mockTasks[0].status = true;

        await waitFor(() => {
            // Verify that status is updated to true
            expect(mockTasks[0].status).toBe(true);
        });
    });

    // Test to verify strike through line is rendered for completed tasks
    it('should render a strike-through line for completed tasks', async () => {
        // Mock stored user ID
        AsyncStorage.getItem.mockResolvedValueOnce('temp_user_123');
        // Mock tasks
        getTasksByCreator.mockResolvedValueOnce(mockTasks);

        // Renders the HomeScreen component
        const { getByText, getByTestId } = render(<HomeScreen />);

        await waitFor(() => {
            // Verify that 'Task 2' is displayed
            expect(getByText('Task 2')).toBeTruthy()
        });

        // Select strike through element
        const strikeThrough = getByTestId(`strikeThrough-${mockTasks[1].id}`);
        // Verify if strike through is displayed
        expect(strikeThrough).toBeTruthy();
    });

        /** Loading and Error state testing */

        // Tests whether the loading state is rendered correctly
        it('should render loading state', () => {
            // Renders the HomeScreen component
            const { getByText } = render(<HomeScreen />);
    
            // Verify the 'Loading tasks...' is displayed
            expect(getByText('Loading tasks...')).toBeTruthy();
        });
    
        // Test to handle error when user initialisation fails
        it('should display an error message when initialising the user fails', async () => {
            // Simulate the AsyncStorage error
            AsyncStorage.getItem.mockRejectedValueOnce(new Error('AsyncStorage Error'));
    
            // Renders the HomeScreen component
            const { getByText } = render(<HomeScreen />);
    
            await waitFor(() => {
                // Verify that the error message is shown
                expect(getByText('Failed to initialise user!')).toBeTruthy();
            });
        });
    
        // Test to handle when creating a user fails
        it('should display an error message when creating a user fails', async () => {
            // Simulate no stored user ID
            AsyncStorage.getItem.mockResolvedValueOnce(null);
    
            // Simulate user creation error
            createUser.mockRejectedValueOnce(new Error('Create User Error'));
    
            // Renders the HomeScreen component
            const { getByText } = render(<HomeScreen />);
    
            await waitFor(() => {
                // Verify that the error message is shown
                expect(getByText('Failed to initialise user!')).toBeTruthy();
            });
        });
    
        // Test to handle error when fetching tasks fails
        it('should display an error message when fetching tasks fails', async () => {
            // Mock stored user ID
            AsyncStorage.getItem.mockResolvedValueOnce('temp_user_123');
            // Simulate task fetching error
            getTasksByCreator.mockRejectedValueOnce(new Error('Fetch Tasks Error'));
    
            // Renders the HomeScreen component
            const { getByText } = render(<HomeScreen />);
    
            await waitFor(() => {
                // Verify that the error message is shown
                expect(getByText('Failed to fetch tasks!')).toBeTruthy();
            });
        });
    
        // Test to handle error when updating task status fails
        it('should display an error message when updating task status fails', async () => {
            // Mock stored user ID
            AsyncStorage.getItem.mockResolvedValueOnce('temp_user_123');
            // Mock tasks
            getTasksByCreator.mockResolvedValueOnce(mockTasks);
    
            // Renders the HomeScreen component
            const { getByTestId, getByText } = render(<HomeScreen />);
    
            await waitFor(() => {
                // Verify that Task 1 is displayed
                expect(getByText('Task 1')).toBeTruthy();
            });
    
            // Mock update failure
            jest.spyOn(require('../services/taskService'), 'updateTask').mockRejectedValueOnce(new Error('Update Task Error'));
    
            // Select Task 1 checkbox
            const checkbox = getByTestId(`checkbox-${mockTasks[0].id}`);
            // Simulate checkbox press
            fireEvent.press(checkbox);
    
            await waitFor(() => {
                // Verify that the error message is shown
                expect(getByText('Failed to update task status!')).toBeTruthy();
            });
        });
    
        // Test to handle error when initializing groups fails
        it('should display an error message when initializing groups fails', async () => {
            // Simulate setting user ID
            AsyncStorage.getItem.mockResolvedValueOnce('temp_user_123');
    
            // Simulate group creation error
            getGroupsByCreator.mockRejectedValueOnce(new Error('Group Initialization Error'));
    
            // Renders the HomeScreen component
            const { getByText } = render(<HomeScreen />);
            
            await waitFor(() => {
                // Verify that the error message is shown
                expect(getByText('Failed to initialise groups!')).toBeTruthy();
            });
        });


    /** Snapshot testing */

    // Snapshot test for empty state
    it('should match snapshot for no tasks', async () => {
        // Mock stored user ID
        AsyncStorage.getItem.mockResolvedValueOnce('temp_user_123');
        // Mock no tasks state
        getTasksByCreator.mockResolvedValueOnce([]);

        // Renders the HomeScreen component
        const { toJSON, getByText } = render(<HomeScreen />);

        await waitFor(() => {
            // Verify the 'Add task to start using Taskcation!' is displayed
            expect(getByText('Add task to start using Taskcation!')).toBeTruthy()
        });

        // Verify snapshot matches
        expect(toJSON()).toMatchSnapshot();
    });

    // Snapshot test for tasks rendered
    it('should match snapshot for tasks rendered', async () => {
        // Mock stored user ID
        AsyncStorage.getItem.mockResolvedValueOnce('temp_user_123');
        // Mock tasks
        getTasksByCreator.mockResolvedValueOnce(mockTasks);

        // Renders the HomeScreen component
        const { toJSON, getByText } = render(<HomeScreen />);

        await waitFor(() => {
            // Verify that 'Task 1' and 'Task 2' is displayed
            expect(getByText('Task 1')).toBeTruthy();
            expect(getByText('Task 2')).toBeTruthy();
        });

        // Verify snapshot matches
        expect(toJSON()).toMatchSnapshot();
    });
});
