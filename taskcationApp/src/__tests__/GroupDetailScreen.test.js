import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import GroupDetailScreen from '../screens/GroupDetailScreen';
import { getTasksByGroup, updateTask } from '../services/taskService';
import { getGroupByID } from '../services/groupsService';
import { getGradeByID } from '../services/gradesService';
import { markAllSubtasksComplete } from '../services/subtaskService';
import { Alert } from 'react-native'; 

const mockSubject = {
    id: 'group1',
    group_name: 'Test Subject',
    group_type: 'Subjects',
    grade_id: 'grade1',
};

const mockCategory = {
    id: 'group2',
    group_name: 'Test Category',
    group_type: 'Categories',
};

const mockGrade = {
    id: 'grade1',
    grade: 'A',
};

const mockTasks = [
    {
        id: 'task1',
        task_name: 'Task 1',
        end_date: new Date('2025-01-01T10:00:00'),
        status: false,
    },
    {
        id: 'task2',
        task_name: 'Task 2',
        end_date: new Date('2025-02-15T10:00:00'),
        status: true,
    },
];

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

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
    beforeEach(() => {
        getTasksByGroup.mockClear();
        getTasksByGroup.mockReset();
        getGroupByID.mockClear();
        getGroupByID.mockReset();
        getGradeByID.mockClear();
        getGradeByID.mockReset();
        jest.clearAllMocks();
        jest.spyOn(Alert, 'alert');
        getGroupByID.mockResolvedValue(mockSubject);
        getGradeByID.mockResolvedValue(mockGrade);
        getTasksByGroup.mockResolvedValue(mockTasks);
        mockRoute = { params: { groupID: 'group1' } };
    });

    

    it('should display correct tasks details and subject details after fetching ', async () => {
        const { getByText } = render(
            <NavigationContainer>
                <GroupDetailScreen />
            </NavigationContainer>
        );

        await waitFor(() => {
            expect(getByText('Test Subject')).toBeTruthy();
            expect(getByText('Grades')).toBeTruthy();
            expect(getByText('A')).toBeTruthy();
            expect(getByText('Task 1')).toBeTruthy();
            expect(getByText('01/01/2025')).toBeTruthy();
            expect(getByText('Task 2')).toBeTruthy();
            expect(getByText('15/02/2025')).toBeTruthy();
        });

        
    });

    it('should display correct tasks details and category details after fetching ', async () => {
        mockRoute = { params: { groupID: 'group2' } };
        getGroupByID.mockResolvedValue(mockCategory);
        const { getByText } = render(
            <NavigationContainer>
                <GroupDetailScreen />
            </NavigationContainer>
        );

        await waitFor(() => {
            expect(getByText('Test Category')).toBeTruthy();
            expect(getByText('Task 1')).toBeTruthy();
            expect(getByText('01/01/2025')).toBeTruthy();
            expect(getByText('Task 2')).toBeTruthy();
            expect(getByText('15/02/2025')).toBeTruthy();
        });

        
    });

    it('should show No Tasks added... text when there are no tasks for subject', async () => {
        getTasksByGroup.mockResolvedValueOnce([]);

        const { getByText } = render(
            <NavigationContainer>
                <GroupDetailScreen />
            </NavigationContainer>
        );

        await waitFor(() => {
            expect(getByText('No Tasks added for Test Subject!')).toBeTruthy();
        });

    });

    it('should show No Tasks added... text when there are no tasks for category', async () => {
        mockRoute = { params: { groupID: 'group2' } };
        getGroupByID.mockResolvedValue(mockCategory);
        getTasksByGroup.mockResolvedValueOnce([]);

        const { getByText } = render(
            <NavigationContainer>
                <GroupDetailScreen />
            </NavigationContainer>
        );

        await waitFor(() => {
            expect(getByText('No Tasks added for Test Category!')).toBeTruthy();
        });

    });


    it('should toggle task completion when checkbox is pressed', async () => {
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

        const { getByTestId, getByText } = render(
            <NavigationContainer>
                <GroupDetailScreen />
            </NavigationContainer>
        );

        await waitFor(() => {
            expect(getByText('Task 1')).toBeTruthy();
            expect(getByText('01/01/2025')).toBeTruthy();
            expect(getByText('Task 2')).toBeTruthy();
            expect(getByText('15/02/2025')).toBeTruthy();
        });

        const checkbox = getByTestId('checkbox-task1');
        fireEvent.press(checkbox);

        await waitFor(() => {
            expect(updateTask).toHaveBeenCalledWith(expect.anything(), 'task1', { status: true });
            expect(markAllSubtasksComplete).toHaveBeenCalledWith(expect.anything(), 'task1', true);
        });

        // Mock the expected behaviour
        getTasksByGroup.mockResolvedValueOnce([
            { id: 'task1', task_name: 'Task 1', end_date: new Date('2025-01-01T10:00:00'), status: false },
        ]);

        fireEvent.press(checkbox);

        await waitFor(() => {
            expect(updateTask).toHaveBeenCalledWith(expect.anything(), 'task1', { status: true });
        });

    });

    it('should navigate to TaskDetail when a task row is pressed', async () => {
        const { getByText } = render(
            <NavigationContainer>
                <GroupDetailScreen />
            </NavigationContainer>
        );

        await waitFor(() => {
            expect(getByText('Task 1')).toBeTruthy();
        });

        fireEvent.press(getByText('Task 1'));

        expect(mockNavigate).toHaveBeenCalledWith('TaskDetail', { taskID: 'task1' });
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
        
        const refreshedGroup = { ...mockSubject, group_name: 'Updated Test Subject', grade_id: 'grade2' };

        getGroupByID
            .mockResolvedValueOnce(mockSubject)  
            .mockResolvedValueOnce(refreshedGroup);

        const refreshedGrade = { id: 'grade2', grade: 'B' };

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
            expect(getByText('Updated Test Subject')).toBeTruthy();
            expect(getByText('B')).toBeTruthy();
            expect(getByText('Updated Task 1')).toBeTruthy();
        });
    });

    it('should render loading indicator initially', async () => {
        getGroupByID.mockReturnValue(new Promise(() => {}));

        const { getByText } = render(
            <NavigationContainer>
                <GroupDetailScreen />
            </NavigationContainer>
        );

        expect(getByText('Loading group and tasks...')).toBeTruthy();
    });

    it('should show alert if failing to fetch group', async () => {
        getGroupByID.mockRejectedValueOnce(new Error('Error fetching group'));
        render(
            <NavigationContainer>
                <GroupDetailScreen />
            </NavigationContainer>
        );

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Error fetching group or grade or tasks', 'Failed to fetch group or grade or tasks.');
        });
    });

    it('should show alert if failing to fetch tasks', async () => {
        getTasksByGroup.mockRejectedValueOnce(new Error('Error fetching tasks'));

        render(
            <NavigationContainer>
                <GroupDetailScreen />
            </NavigationContainer>
        );

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Error fetching group or grade or tasks', 'Failed to fetch group or grade or tasks.');
        });
    });

    it('should show alert if failing to fetch grade', async () => {
        getGradeByID.mockRejectedValueOnce(new Error('Error fetching grade'));

        render(
            <NavigationContainer>
                <GroupDetailScreen />
            </NavigationContainer>
        );

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Error fetching group or grade or tasks', 'Failed to fetch group or grade or tasks.');
        });
    });

    it('should show alert if failing to update task status', async () => {
        // Mock updateTask to throw an error
        updateTask.mockRejectedValueOnce(new Error('Error updating task status'));
    
        // Render
        const { getByText, getByTestId } = render(
            <NavigationContainer>
                <GroupDetailScreen />
            </NavigationContainer>
        );
    
        // Wait for the tasks to load
        await waitFor(() => {
            expect(getByText('Task 1')).toBeTruthy();
        });
    
        // Press the checkbox
        fireEvent.press(getByTestId('checkbox-task1'));
    
        // We should see the alert for failing to update task status
        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Error updating task status', 'Failed to update tasks status.');
        });
    });

    it('should show alert if failing to fetch tasks in fetchTasks() (e.g. after toggling)', async () => {
         // Mock the initial  load
        getTasksByGroup.mockResolvedValueOnce([
            { id: 'task1', task_name: 'Task 1', end_date: new Date('2025-01-01T10:00:00'), status: false },
            { id: 'task2', task_name: 'Task 2', end_date: new Date('2025-02-15T10:00:00'), status: true },
        ]);

        // 2) After toggling (fetchTasks again) -> fail
        getTasksByGroup.mockRejectedValueOnce(new Error('Error fetching tasks'));
        
        // Render the screen
        const { getByText, getByTestId } = render(
            <NavigationContainer>
                <GroupDetailScreen />
            </NavigationContainer>
        );
        
        // Wait for the first (successful) render
        await waitFor(() => {
            expect(getByText('Task 1')).toBeTruthy();
            expect(getByText('01/01/2025')).toBeTruthy();
            expect(getByText('Task 2')).toBeTruthy();
            expect(getByText('15/02/2025')).toBeTruthy();
        });
        
        // Press the checkbox to toggle completion, which calls fetchTasks() again
        fireEvent.press(getByTestId('checkbox-task1'));
        
        // Now we expect the second getTasksByGroup call to fail → triggers the second alert
        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Error fetching group or grade or tasks', 'Failed to fetch group or grade or tasks.');
        });
    });

    it('should show alert if failing to refresh group or grade or tasks', async () => {
        // Mock useFocusEffect
        const { useFocusEffect } = jest.requireActual('@react-navigation/native');
        jest.spyOn(require('@react-navigation/native'), 'useFocusEffect')
            .mockImplementation(useFocusEffect);
    
        getGroupByID
            .mockResolvedValueOnce(mockSubject)  
            .mockRejectedValueOnce(new Error('Error fetching group'));
        // Render
        render(
            <NavigationContainer>
                <GroupDetailScreen />
            </NavigationContainer>
        );
    
        // Wait for the second run to fail
        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Error fetching group or grade or tasks', 'Failed to fetch group or grade or tasks.');
        });
    });

    it('should match snapshot when tasks details and subject details are loaded', async () => {
        const { toJSON, getByText } = render(
            <NavigationContainer>
                <GroupDetailScreen />
            </NavigationContainer>
        );

        await waitFor(() => {
            expect(getByText('Test Subject')).toBeTruthy();
            expect(getByText('Grades')).toBeTruthy();
            expect(getByText('A')).toBeTruthy();
            expect(getByText('Task 1')).toBeTruthy();
            expect(getByText('01/01/2025')).toBeTruthy();
            expect(getByText('Task 2')).toBeTruthy();
            expect(getByText('15/02/2025')).toBeTruthy();
        });

        expect(toJSON()).toMatchSnapshot();
    });

    it('should match snapshot when task details and category details are loaded', async () => {
        mockRoute = { params: { groupID: 'group2' } };
        getGroupByID.mockResolvedValue(mockCategory);
        const { toJSON, getByText } = render(
            <NavigationContainer>
                <GroupDetailScreen />
            </NavigationContainer>
        );

        await waitFor(() => {
            expect(getByText('Test Category')).toBeTruthy();
            expect(getByText('Task 1')).toBeTruthy();
            expect(getByText('01/01/2025')).toBeTruthy();
            expect(getByText('Task 2')).toBeTruthy();
            expect(getByText('15/02/2025')).toBeTruthy();
        });

        expect(toJSON()).toMatchSnapshot();
    });
});