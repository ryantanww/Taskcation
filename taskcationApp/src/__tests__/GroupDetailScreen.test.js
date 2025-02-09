// Import dependencies and libraries used for testing Group Detail Screen
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import GroupDetailScreen from '../screens/GroupDetailScreen';
import { getTasksByGroup, updateTask } from '../services/taskService';
import { getGroupByID } from '../services/groupsService';
import { getGradeByID } from '../services/gradesService';
import { markAllSubtasksComplete } from '../services/subtaskService';
import { Alert } from 'react-native'; 

// Mock Subject
const mockSubject = {
    id: 'group1',
    group_name: 'Test Subject',
    group_type: 'Subjects',
    grade_id: 'grade1',
};

// Mock Category
const mockCategory = {
    id: 'group2',
    group_name: 'Test Category',
    group_type: 'Categories',
};

// Mock Grade
const mockGrade = {
    id: 'grade1',
    grade: 'A',
};

// Array of mocked tasks
const mockTasks = [
    { id: 'task1', task_name: 'Task 1', end_date: new Date('2025-01-01T10:00:00'), status: false },
    { id: 'task2', task_name: 'Task 2', end_date: new Date('2025-02-15T10:00:00'), status: true },
];

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

// Mock route parameter to be group1
let mockRoute = { params: { groupID: 'group1' } };

jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual('@react-navigation/native');
    return {
        ...actualNav,
        useNavigation: () => ({
            goBack: mockGoBack,
            navigate: mockNavigate,
        }),
        useRoute: () => mockRoute,
        useFocusEffect: () => {},
    };
});

describe('GroupDetailScreen', () => {
    // Clear all mocks and reset them before each test
    beforeEach(() => {
        getTasksByGroup.mockClear();
        getTasksByGroup.mockReset();
        getGroupByID.mockClear();
        getGroupByID.mockReset();
        getGradeByID.mockClear();
        getGradeByID.mockReset();
        updateTask.mockClear();
        updateTask.mockReset();
        jest.clearAllMocks();
        // Spy on Alert.alert to verify alerts
        jest.spyOn(Alert, 'alert');
        // Mock required services
        getGroupByID.mockResolvedValue(mockSubject);
        getGradeByID.mockResolvedValue(mockGrade);
        getTasksByGroup.mockResolvedValue(mockTasks);
        mockRoute = { params: { groupID: 'group1' } };
    });

    

    // Test to display correct tasks details and subject details after fetching
    it('should display correct tasks details and subject details after fetching', async () => {
        // Renders the GroupDetailScreen component
        const { getByText } = render(
            <NavigationContainer>
                <GroupDetailScreen />
            </NavigationContainer>
        );

        await waitFor(() => {
            // Verify that all components are rendered with the correct text
            expect(getByText('Test Subject')).toBeTruthy();
            expect(getByText('Grades')).toBeTruthy();
            expect(getByText('A')).toBeTruthy();
            expect(getByText('Task 1')).toBeTruthy();
            expect(getByText('01/01/2025')).toBeTruthy();
            expect(getByText('Task 2')).toBeTruthy();
            expect(getByText('15/02/2025')).toBeTruthy();
        });

        
    });

    // Test to display correct tasks details and category details after fetching
    it('should display correct tasks details and category details after fetching ', async () => {
        // Mock the correct route parameter 
        mockRoute = { params: { groupID: 'group2' } };
        // Mock the correct group as category
        getGroupByID.mockResolvedValue(mockCategory);

        // Renders the GroupDetailScreen component
        const { getByText } = render(
            <NavigationContainer>
                <GroupDetailScreen />
            </NavigationContainer>
        );

        await waitFor(() => {
            // Verify that all components are rendered with the correct text
            expect(getByText('Test Category')).toBeTruthy();
            expect(getByText('Task 1')).toBeTruthy();
            expect(getByText('01/01/2025')).toBeTruthy();
            expect(getByText('Task 2')).toBeTruthy();
            expect(getByText('15/02/2025')).toBeTruthy();
        });

        
    });

    // Test to show No Tasks added... text when there are no tasks for subject
    it('should show No Tasks added... text when there are no tasks for subject', async () => {
        // Mock empty tasks
        getTasksByGroup.mockResolvedValueOnce([]);

        // Renders the GroupDetailScreen component
        const { getByText } = render(
            <NavigationContainer>
                <GroupDetailScreen />
            </NavigationContainer>
        );

        await waitFor(() => {
            // Verify that No Tasks added for Test Subject! was displayed correctly
            expect(getByText('No Tasks added for Test Subject!')).toBeTruthy();
        });

    });

    // Test to show No Tasks added... text when there are no tasks for category
    it('should show No Tasks added... text when there are no tasks for category', async () => {
        // Mock the correct route parameter 
        mockRoute = { params: { groupID: 'group2' } };
        // Mock the correct group as category
        getGroupByID.mockResolvedValue(mockCategory);
        
        // Mock empty tasks
        getTasksByGroup.mockResolvedValueOnce([]);

        // Renders the GroupDetailScreen component
        const { getByText } = render(
            <NavigationContainer>
                <GroupDetailScreen />
            </NavigationContainer>
        );

        await waitFor(() => {
            // Verify that No Tasks added for Test Category! was displayed correctly
            expect(getByText('No Tasks added for Test Category!')).toBeTruthy();
        });

    });


    // Test to toggle task completion
    it('should toggle task completion', async () => {
        // Mock the initial  load
        getTasksByGroup.mockResolvedValueOnce([
            { id: 'task1', task_name: 'Task 1', end_date: new Date('2025-01-01T10:00:00'), status: false },
            { id: 'task2', task_name: 'Task 2', end_date: new Date('2025-02-15T10:00:00'), status: true },
        ]);
    
        // Mock the expected behaviour
        getTasksByGroup.mockResolvedValueOnce([
            { id: 'task1', task_name: 'Task 1', end_date: new Date('2025-01-01T10:00:00'), status: true },
            { id: 'task2', task_name: 'Task 2', end_date: new Date('2025-02-15T10:00:00'), status: true },
        ]);

        // Renders the GroupDetailScreen component
        const { getByTestId, getByText } = render(
            <NavigationContainer>
                <GroupDetailScreen />
            </NavigationContainer>
        );

        await waitFor(() => {
            // Verify that all components are rendered with the correct text
            expect(getByText('Task 1')).toBeTruthy();
            expect(getByText('01/01/2025')).toBeTruthy();
            expect(getByText('Task 2')).toBeTruthy();
            expect(getByText('15/02/2025')).toBeTruthy();
        });

        // Select Task 1 checkbox
        let taskCheckbox = getByTestId('checkbox-task1');
        // Press on checkbox
        fireEvent.press(taskCheckbox);

        await waitFor(() => {
            // Verify that updateTask has been called with the updated status
            expect(updateTask).toHaveBeenCalledWith(expect.anything(), 'task1', { status: true });
            // Verify that markAllSubtasksComplete has been called with the updated statuses
            expect(markAllSubtasksComplete).toHaveBeenCalledWith(expect.anything(), 'task1', true);
        });

        // Mock the initial  load
        getTasksByGroup.mockResolvedValueOnce([
            { id: 'task1', task_name: 'Task 1', end_date: new Date('2025-01-01T10:00:00'), status: true },
            { id: 'task2', task_name: 'Task 2', end_date: new Date('2025-02-15T10:00:00'), status: true },
        ]);

        // Mock the expected behaviour
        getTasksByGroup.mockResolvedValueOnce([
            { id: 'task1', task_name: 'Task 1', end_date: new Date('2025-01-01T10:00:00'), status: false },
            { id: 'task2', task_name: 'Task 2', end_date: new Date('2025-02-15T10:00:00'), status: true },
        ]);

        // Select Task 1 checkbox
        taskCheckbox = getByTestId('checkbox-task1');
        // Press on checkbox
        fireEvent.press(taskCheckbox);

        await waitFor(() => {
            // Verify that updateTask has been called with the updated status
            expect(updateTask).toHaveBeenCalledWith(expect.anything(), 'task1', { status: false });
        });

    });

    // Test to navigate to TaskDetailScreen when a task row is pressed
    it('should navigate to TaskDetailScreen when a task row is pressed', async () => {
        // Renders the GroupDetailScreen component
        const { getByText } = render(
            <NavigationContainer>
                <GroupDetailScreen />
            </NavigationContainer>
        );

        await waitFor(() => {
            // Verify that Task 1 is displayed
            expect(getByText('Task 1')).toBeTruthy();
        });

        // Press on Task 1
        fireEvent.press(getByText('Task 1'));

        // Verify that navigation to TaskDetailScreen screen has been called with taskID as its parameter 
        expect(mockNavigate).toHaveBeenCalledWith('TaskDetailScreen', { taskID: 'task1' });
    });

    // Test to update UI on successful refresh
    it('should update UI on successful refresh', async () => {
        // Mock useFocusEffect
        const { useFocusEffect } = jest.requireActual('@react-navigation/native');
        jest.spyOn(require('@react-navigation/native'), 'useFocusEffect')
            .mockImplementation(useFocusEffect);
        
        // Get the updated task name when refreshed
        const refreshedTask = [
            { id: 'task1', task_name: 'Updated Task 1', end_date: new Date('2025-01-01T10:00:00'), status: true },
            { id: 'task2', task_name: 'Task 2', end_date: new Date('2025-02-15T10:00:00'), status: true }
        ];
        // Mock the task details with the refreshed task
        getTasksByGroup
            .mockResolvedValueOnce(mockTasks)  
            .mockResolvedValueOnce(refreshedTask);
        
        // Get the updated group name when refreshed
        const refreshedGroup = { ...mockSubject, group_name: 'Updated Test Subject', grade_id: 'grade2' };

        // Mock the group details with the refreshed task
        getGroupByID
            .mockResolvedValueOnce(mockSubject)  
            .mockResolvedValueOnce(refreshedGroup);

        // Get the updated grade when refreshed
        const refreshedGrade = { id: 'grade2', grade: 'B' };

        // Mock the grade details with the refreshed grade
        getGradeByID
            .mockResolvedValueOnce(mockGrade)  
            .mockResolvedValueOnce(refreshedGrade);

        // Renders the GroupDetailScreen component
        const { getByText } = render(
            <NavigationContainer>
                <GroupDetailScreen />
            </NavigationContainer>
        );
        await waitFor(() => {
            // Verify that all components are rendered with the correct updated text
            expect(getByText('Updated Test Subject')).toBeTruthy();
            expect(getByText('B')).toBeTruthy();
            expect(getByText('Updated Task 1')).toBeTruthy();
        });
    });

    // Test to render loading indicator initially
    it('should render loading indicator initially', async () => {
        // Renders the GroupDetailScreen component
        const { getByText } = render(
            <NavigationContainer>
                <GroupDetailScreen />
            </NavigationContainer>
        );

        // Verify the Loading group and tasks... is displayed
        expect(getByText('Loading group and tasks...')).toBeTruthy();
    });

    // Test to show an alert for failing to fetch group
    it('should show an alert if failing to fetch group', async () => {
        // Mock groups service with an error
        getGroupByID.mockRejectedValueOnce(new Error('Error fetching group'));
        // Renders the GroupDetailScreen component
        render(
            <NavigationContainer>
                <GroupDetailScreen />
            </NavigationContainer>
        );

        await waitFor(() => {
            // Verify that an error alert is shown to the user when failed to fetch group
            expect(Alert.alert).toHaveBeenCalledWith('Error fetching group or grade or tasks', 'Failed to fetch group or grade or tasks.');
        });
    });

    // Test to show an alert for failing to fetch tasks
    it('should show an alert if failing to fetch tasks', async () => {
        // Mock tasks service with an error
        getTasksByGroup.mockRejectedValueOnce(new Error('Error fetching tasks'));

        // Renders the GroupDetailScreen component
        render(
            <NavigationContainer>
                <GroupDetailScreen />
            </NavigationContainer>
        );

        await waitFor(() => {
            // Verify that an error alert is shown to the user when failed to fetch tasks
            expect(Alert.alert).toHaveBeenCalledWith('Error fetching group or grade or tasks', 'Failed to fetch group or grade or tasks.');
        });
    });

    // Test to show an alert for failing to fetch grade
    it('should show an alert if failing to fetch grade', async () => {
        // Mock grade service with an error
        getGradeByID.mockRejectedValueOnce(new Error('Error fetching grade'));

        // Renders the GroupDetailScreen component
        render(
            <NavigationContainer>
                <GroupDetailScreen />
            </NavigationContainer>
        );

        await waitFor(() => {
            // Verify that an error alert is shown to the user when failed to fetch grade
            expect(Alert.alert).toHaveBeenCalledWith('Error fetching group or grade or tasks', 'Failed to fetch group or grade or tasks.');
        });
    });

    // Test to show an alert if failing to update task status
    it('should show an alert if failing to update task status', async () => {
        // Mock updateTask to throw an error
        updateTask.mockRejectedValueOnce(new Error('Error updating task status'));
    
        // Renders the GroupDetailScreen component
        const { getByText, getByTestId } = render(
            <NavigationContainer>
                <GroupDetailScreen />
            </NavigationContainer>
        );
    
        await waitFor(() => {
            // Verify that Task 1 is displayed correctly
            expect(getByText('Task 1')).toBeTruthy();
        });
    
        // Press the checkbox
        fireEvent.press(getByTestId('checkbox-task1'));
    
        await waitFor(() => {
            // Verify that an error alert is shown to the user when failed to update task status
            expect(Alert.alert).toHaveBeenCalledWith('Error updating task status', 'Failed to update tasks status.');
        });
    });

    // Test to show show an alert if failing to refresh group
    it('should show an alert if failing to refresh group', async () => {
        // Mock useFocusEffect
        const { useFocusEffect } = jest.requireActual('@react-navigation/native');
        jest.spyOn(require('@react-navigation/native'), 'useFocusEffect')
            .mockImplementation(useFocusEffect);
    
        // Mock the group details with the error
        getGroupByID
            .mockResolvedValueOnce(mockSubject)  
            .mockRejectedValueOnce(new Error('Error fetching group'));

        // Renders the GroupDetailScreen component
        render(
            <NavigationContainer>
                <GroupDetailScreen />
            </NavigationContainer>
        );
    
        await waitFor(() => {
            // Verify that an error alert is shown to the user when failed to refresh group
            expect(Alert.alert).toHaveBeenCalledWith('Error fetching group or grade or tasks', 'Failed to fetch group or grade or tasks.');
        });
    });

    // Test to show show an alert if failing to refresh grade
    it('should show an alert if failing to refresh grade', async () => {
        // Mock useFocusEffect
        const { useFocusEffect } = jest.requireActual('@react-navigation/native');
        jest.spyOn(require('@react-navigation/native'), 'useFocusEffect')
            .mockImplementation(useFocusEffect);
    
        // Mock the grade details with the error
        getGradeByID
            .mockResolvedValueOnce(mockGrade)  
            .mockRejectedValueOnce(new Error('Error fetching grade'));

        // Renders the GroupDetailScreen component
        render(
            <NavigationContainer>
                <GroupDetailScreen />
            </NavigationContainer>
        );
    
        await waitFor(() => {
            // Verify that an error alert is shown to the user when failed to refresh grade
            expect(Alert.alert).toHaveBeenCalledWith('Error fetching group or grade or tasks', 'Failed to fetch group or grade or tasks.');
        });
    });

    // Test to show show an alert if failing to refresh task
    it('should show an alert if failing to refresh task', async () => {
        // Mock useFocusEffect
        const { useFocusEffect } = jest.requireActual('@react-navigation/native');
        jest.spyOn(require('@react-navigation/native'), 'useFocusEffect')
            .mockImplementation(useFocusEffect);
    
        // Mock the task details with the error
        getTasksByGroup
            .mockResolvedValueOnce(mockTasks)  
            .mockRejectedValueOnce(new Error('Error fetching grade'));

        // Renders the GroupDetailScreen component
        render(
            <NavigationContainer>
                <GroupDetailScreen />
            </NavigationContainer>
        );
    
        await waitFor(() => {
            // Verify that an error alert is shown to the user when failed to refresh task
            expect(Alert.alert).toHaveBeenCalledWith('Error fetching group or grade or tasks', 'Failed to fetch group or grade or tasks.');
        });
    });

    // Snapshot test for GroupDetailScreen when subject was selected
    it('should match snapshot when tasks details and subject details are loaded', async () => {
        // Renders the GroupDetailScreen component
        const { toJSON, getByText } = render(
            <NavigationContainer>
                <GroupDetailScreen />
            </NavigationContainer>
        );

        await waitFor(() => {
            // Verify that all components are rendered with the correct text
            expect(getByText('Test Subject')).toBeTruthy();
            expect(getByText('Grades')).toBeTruthy();
            expect(getByText('A')).toBeTruthy();
            expect(getByText('Task 1')).toBeTruthy();
            expect(getByText('01/01/2025')).toBeTruthy();
            expect(getByText('Task 2')).toBeTruthy();
            expect(getByText('15/02/2025')).toBeTruthy();
        });

        // Verify snapshot matches
        expect(toJSON()).toMatchSnapshot();
    });

    // Snapshot test for GroupDetailScreen when category was selected
    it('should match snapshot when task details and category details are loaded', async () => {
        // Mock the correct route parameter 
        mockRoute = { params: { groupID: 'group2' } };
        // Mock the correct group as category
        getGroupByID.mockResolvedValue(mockCategory);

        // Renders the GroupDetailScreen component
        const { toJSON, getByText } = render(
            <NavigationContainer>
                <GroupDetailScreen />
            </NavigationContainer>
        );

        await waitFor(() => {
            // Verify that all components are rendered with the correct text
            expect(getByText('Test Category')).toBeTruthy();
            expect(getByText('Task 1')).toBeTruthy();
            expect(getByText('01/01/2025')).toBeTruthy();
            expect(getByText('Task 2')).toBeTruthy();
            expect(getByText('15/02/2025')).toBeTruthy();
        });

        // Verify snapshot matches
        expect(toJSON()).toMatchSnapshot();
    });
});