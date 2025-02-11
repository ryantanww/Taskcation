// Import dependencies and libraries used for testing Task Detail Screen
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import TaskDetailScreen from '../screens/TaskDetailScreen';
import { getTaskByID, updateTask } from '../services/taskService';
import { getSubtasksByTaskID, updateSubtask, markAllSubtasksComplete } from '../services/subtaskService';
import { getGroupByID } from '../services/groupsService';
import { getGradeByID } from '../services/gradesService';
import { getPriorityByID } from '../services/priorityLevelsService';
import { getAttachmentsByTaskID } from '../services/attachmentService';
import { Alert } from 'react-native'; 

// Mock task for the test
const mockTask = {
    id: 'task1',
    task_name: 'Test Task',
    start_date: new Date('2025-01-01T10:00:00'),
    end_date: new Date('2025-01-06T12:00:00'),
    duration: 439200000,
    task_notes: 'This is a test note.',
    group_id: 'group1',
    priority_id: 'priority1',
    status: false,
};

// Mock group for the test
const mockGroup = {
    id: 'group1',
    group_name: 'Test Group',
    group_type: 'Subjects',
    grade_id: 'grade1',
};

// Mock grade for the test
const mockGrade = {
    id: 'grade1',
    grade: 'A',
};

// Mock priority for the test
const mockPriority = {
    id: 'priority1',
    priority_name: 'High',
};

// Mock attachment for the test
const mockAttachments = [
    { id: 'attach1', uri: 'https://test.com/test_attachment.pdf', file_name: 'test_attachment.pdf', file_type: 'application/pdf',},
];

// Mock subtasks for the test
const mockSubtasks = [
    { id: 'subtask1', subtask_name: 'Subtask 1', end_date: new Date('2025-01-02T18:00:00'), status: true },
    { id: 'subtask2', subtask_name: 'Subtask 2', end_date: new Date('2025-01-03T15:00:00'), status: false },
];

// Mock ViewAttachments Component
jest.mock('../components/ViewAttachments', () => {
    const React = require('react');
    const { Text, View } = require('react-native');
    return ({ attachments }) => (
        <View>
            {attachments.map((attachment) => (
                <View key={attachment.uri}>
                    <Text>{attachment.file_name}</Text>
                </View>
            ))}
        </View>
    );
});

// Mock useNavigation hook
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual('@react-navigation/native');
    return {
        ...actualNav,
        useNavigation: () => ({
            goBack: mockGoBack,
            navigate: mockNavigate,
        }),
        useRoute: () => ({ params: {taskID: 'task1'}}),
        useFocusEffect: () => {},
    };
});

describe('TaskDetailScreen', () => {
    // Clear all mocks and reset them before each test
    beforeEach(() => {
        getTaskByID.mockClear();
        getTaskByID.mockReset();
        updateTask.mockClear();
        updateTask.mockReset();
        getSubtasksByTaskID.mockClear();
        getSubtasksByTaskID.mockReset();
        getGroupByID.mockClear();
        getGroupByID.mockReset();
        getGradeByID.mockClear();
        getGradeByID.mockReset();
        getPriorityByID.mockClear();
        getPriorityByID.mockReset();
        getAttachmentsByTaskID.mockClear();
        getAttachmentsByTaskID.mockReset();
        jest.clearAllMocks();
        // Spy on Alert.alert to verify alerts
        jest.spyOn(Alert, 'alert').mockImplementation(() => {});
        // Mock the required services
        getTaskByID.mockResolvedValue(mockTask);
        getGroupByID.mockResolvedValue(mockGroup);
        getPriorityByID.mockResolvedValue(mockPriority);
        getAttachmentsByTaskID.mockResolvedValue(mockAttachments);
        getSubtasksByTaskID.mockResolvedValue(mockSubtasks);
        getGradeByID.mockResolvedValue(mockGrade);
    });
    
    // Test to display correct task details after fetching
    it('should display correct task details after fetching', async () => {
        // Renders the TaskDetailScreen component
        const { getByText } = render(
            <NavigationContainer>
                <TaskDetailScreen />
            </NavigationContainer>
        );

        await waitFor(() => {
            // Verify that all components are rendered with the correct task details after fetching
            expect(getByText('Test Task')).toBeTruthy();
            expect(getByText('Start Date')).toBeTruthy();
            expect(getByText('01/01/2025')).toBeTruthy();
            expect(getByText('10:00')).toBeTruthy();
            expect(getByText('End Date')).toBeTruthy();
            expect(getByText('06/01/2025')).toBeTruthy();
            expect(getByText('12:00')).toBeTruthy();
            expect(getByText('Duration')).toBeTruthy();
            expect(getByText('5 days 2 hours')).toBeTruthy();
            expect(getByText('This is a test note.')).toBeTruthy();
            expect(getByText('Group')).toBeTruthy();
            expect(getByText('Test Group')).toBeTruthy();
            expect(getByText('Grades')).toBeTruthy();
            expect(getByText('A')).toBeTruthy();
            expect(getByText('Priority')).toBeTruthy();
            expect(getByText('High')).toBeTruthy();
            expect(getByText('Attachments')).toBeTruthy();
            expect(getByText('test_attachment.pdf')).toBeTruthy();
            expect(getByText('View Logged Time')).toBeTruthy();
            expect(getByText('Subtasks')).toBeTruthy();
            expect(getByText('Subtask 1')).toBeTruthy();
            expect(getByText('02/01/2025')).toBeTruthy();
            expect(getByText('Subtask 2')).toBeTruthy();
            expect(getByText('03/01/2025')).toBeTruthy();
            expect(getByText('Mark As Completed')).toBeTruthy();
        });
    });

    // Test to display notes correctly when there are no notes
    it('should display notes correctly when there are no notes', async () => {
        // Create a task with missing notes
        const taskWithoutNotes = { ...mockTask, task_notes: '' };
        // Make getTaskByID return the task without notes
        getTaskByID.mockResolvedValueOnce(taskWithoutNotes);
    
        // Renders the TaskDetailScreen component
        const { getByText } = render(
            <NavigationContainer>
                <TaskDetailScreen />
            </NavigationContainer>
        );
    
        await waitFor(() => {
            // Verify that notes shows No additional notes provided.
            expect(getByText('No additional notes provided.')).toBeTruthy();
        });
    });

    // Test to open the timer modal when the View Logged Time button is pressed
    it('should open the timer modal when the View Logged Time button is pressed', async () => {
        // Renders the TaskDetailScreen component
        const { getByText, getByTestId } = render(
            <NavigationContainer>
                <TaskDetailScreen />
            </NavigationContainer>
        );

        await waitFor(() => {
            // Verify that View Logged Time is displayed
            expect(getByText('View Logged Time')).toBeTruthy();
        });
    
        // Press View Logged Time
        fireEvent.press(getByText('View Logged Time'));

        await waitFor(() => {
            // Verify that the timer modal is displayed
            expect(getByTestId('timer-modal')).toBeTruthy()
            // Verify that Time title is displayed
            expect(getByText('Time')).toBeTruthy();
        });
    });

    // Test to close the timer modal when the close button is pressed
    it('should close the timer modal when the close button is pressed', async () => {
        // Renders the TaskDetailScreen component
        const { getByText, getByTestId, queryByTestId } = render(
            <NavigationContainer>
                <TaskDetailScreen />
            </NavigationContainer>
        );

        await waitFor(() => {
            // Verify that View Logged Time is displayed
            expect(getByText('View Logged Time')).toBeTruthy();
        });
    
        // Press View Logged Time
        fireEvent.press(getByText('View Logged Time'));

        await waitFor(() => {
            // Verify that the timer modal is displayed
            expect(getByTestId('timer-modal')).toBeTruthy()
            // Verify that the timer closer button is displayed
            expect(getByTestId('timer-close')).toBeTruthy()
            
        });
    
        // Press the close button
        fireEvent.press(getByTestId('timer-close'));

        await waitFor(() => {
            // Verify that the modal is closed
            expect(queryByTestId('timer-modal')).toBeNull()
        });
    });

    // Test to close the timer modal when the overlay is pressed
    it('should close the timer modal when the overlay is pressed', async () => {
        // Renders the TaskDetailScreen component
        const { getByText, getByTestId, queryByTestId } = render(
            <NavigationContainer>
                <TaskDetailScreen />
            </NavigationContainer>
        );

        await waitFor(() => {
            // Verify that View Logged Time is displayed
            expect(getByText('View Logged Time')).toBeTruthy();
        });
    
        // Press View Logged Time
        fireEvent.press(getByText('View Logged Time'));

        await waitFor(() => {
            // Verify that the timer modal is displayed
            expect(getByTestId('timer-modal')).toBeTruthy()
        });
    
        // Press the timer modal overlay
        fireEvent.press(getByTestId('timer-TouchableWithoutFeedback'));

        await waitFor(() => {
            // Verify that the modal is closed
            expect(queryByTestId('timer-modal')).toBeNull()
        });
    });

    // Test to navigate to AddSubtaskScreen when subtask button is pressed
    it('should navigate to AddSubtaskScreen when subtask button is pressed', async () => {
        // Renders the TaskDetailScreen component
        const { getByText } = render(
            <NavigationContainer>
                <TaskDetailScreen />
            </NavigationContainer>
        );
        await waitFor(() => {
            // Verify that Test Task is displayed
            expect(getByText('Test Task')).toBeTruthy();
            // Verify that Subtasks is displayed
            expect(getByText('Subtasks')).toBeTruthy();
        });
        
        // Press on Subtasks
        fireEvent.press(getByText('Subtasks'));
    
        // Verify that navigation to AddSubtaskScreen screen has been called with taskID and task_name as its parameter 
        expect(mockNavigate).toHaveBeenCalledWith('AddSubtaskScreen', { taskID: mockTask.id, task_name: 'Test Task' });
    });
    
    // Test to mark task as completed
    it('should mark task as completed', async () => {
        // Mock the updateTask service
        updateTask.mockResolvedValueOnce(true);
        markAllSubtasksComplete.mockResolvedValue(true);
    
        // Renders the TaskDetailScreen component
        const { getByText } = render(
            <NavigationContainer>
                <TaskDetailScreen />
            </NavigationContainer>
        );
    
        await waitFor(() => {
            // Verify that Mark As Completed is displayed
            expect(getByText('Mark As Completed')).toBeTruthy();
        });

        // Press on Mark As Completed
        fireEvent.press(getByText('Mark As Completed'));

        await waitFor(() => {
            // Verify that the button changed to Mark As Uncompleted
            expect(getByText('Mark As Uncompleted')).toBeTruthy();
            // Verify that updateTask has been called with the updated status
            expect(updateTask).toHaveBeenCalledWith(expect.anything(), 'task1', { status: true });
            // Verify that markAllSubtasksComplete has been called with the updated statuses
            expect(markAllSubtasksComplete).toHaveBeenCalledWith(expect.anything(), 'task1', true);
            // Verify the success alert for updating task
            expect(Alert.alert).toHaveBeenCalledWith('Success', 'Task and all subtasks marked as completed.');
        });
    
    });

    // Test to mark task as uncompleted
    it('should mark task as uncompleted', async () => {
        // Mock the required services
        const completedTask = { ...mockTask, status: true };
        getTaskByID.mockResolvedValueOnce(completedTask);
        updateTask.mockResolvedValueOnce(true);
    
        // Renders the TaskDetailScreen component
        const { getByText } = render(
            <NavigationContainer>
                <TaskDetailScreen />
            </NavigationContainer>
        );
        
        await waitFor(() => {
            // Verify that Mark As Uncompleted is displayed
            expect(getByText('Mark As Uncompleted')).toBeTruthy();
        });
        
        // Press on Mark As Uncompleted
        fireEvent.press(getByText('Mark As Uncompleted'));
        
        await waitFor(() => {
            // Verify that the button changed to Mark As Completed
            expect(getByText('Mark As Completed')).toBeTruthy();
            // Verify that updateTask has been called with the updated status
            expect(updateTask).toHaveBeenCalledWith(expect.anything(), 'task1', { status: false });
            // Verify the success alert for updating task
            expect(Alert.alert).toHaveBeenCalledWith('Success', 'Task marked as uncompleted.');
            // Verify that markAllSubtasksComplete was not called
            expect(markAllSubtasksComplete).not.toHaveBeenCalled();
        });
    });

    // Test to navigate to SubtaskDetailScreen when subtask 1 is pressed
    it('should navigate to SubtaskDetailScreen when subtask 1 is pressed', async () => {
        // Renders the TaskDetailScreen component
        const { getByText } = render(
            <NavigationContainer>
                <TaskDetailScreen />
            </NavigationContainer>
        );

        await waitFor(() => {
            // Verify that Test Task is displayed
            expect(getByText('Test Task')).toBeTruthy();
            // Verify that Subtask 1 is displayed
            expect(getByText('Subtask 1')).toBeTruthy();
        });

        // Press Subtask 1
        fireEvent.press(getByText('Subtask 1'));

        // Verify that navigation to SubtaskDetailScreen screen has been called with subtaskID as its parameter 
        expect(mockNavigate).toHaveBeenCalledWith('SubtaskDetailScreen', {subtaskID: 'subtask1'});
    });

    // Test to show nothing when there are no subtasks available
    it('should show nothing when there are no subtasks available', async () => {
        // Mock empty subtasks 
        getSubtasksByTaskID.mockResolvedValueOnce([]);
    
        // Renders the TaskDetailScreen component
        const { queryByText } = render(
            <NavigationContainer>
                <TaskDetailScreen />
            </NavigationContainer>
        );
    
        await waitFor(() => {
            // Verify that Subtask 1 is not displayed
            expect(queryByText('Subtask 1')).toBeNull();
            // Verify that Subtask 2 is not displayed
            expect(queryByText('Subtask 2')).toBeNull();
        });
    });

    // Test to toggle subtask completion
    it('should toggle subtask completion', async () => {
        // Mock the initial subtask load
        getSubtasksByTaskID.mockResolvedValueOnce([
            { id: 'subtask1', subtask_name: 'Subtask 1', end_date: new Date('2025-01-02T18:00:00'), status: true },
            { id: 'subtask2', subtask_name: 'Subtask 2', end_date: new Date('2025-01-03T15:00:00'), status: false },
        ]);
    
        // Mock the expected behaviour
        getSubtasksByTaskID.mockResolvedValueOnce([
            { id: 'subtask1', subtask_name: 'Subtask 1', end_date: new Date('2025-01-02T18:00:00'), status: true },
            { id: 'subtask2', subtask_name: 'Subtask 2', end_date: new Date('2025-01-03T15:00:00'), status: true },
        ]);
        
        // Renders the TaskDetailScreen component
        const { getByText, getByTestId } = render(
            <NavigationContainer>
                <TaskDetailScreen />
            </NavigationContainer>
        );

        await waitFor(() => {
            // Verify that Test Task is displayed
            expect(getByText('Test Task')).toBeTruthy();
            // Verify that Subtask 2 is displayed
            expect(getByText('Subtask 2')).toBeTruthy();
        });

        // Select Subtask 2 checkbox
        let subtaskCheckbox = getByTestId('checkbox-subtask2');
        // Press on checkbox
        fireEvent.press(subtaskCheckbox);

        await waitFor(() => {
            // Verify that the updateSubtask has been called with the correct details
            expect(updateSubtask).toHaveBeenCalledWith( expect.anything(), 'subtask2', { status: true });
        });

        // Mock the initial subtask load
        getSubtasksByTaskID.mockResolvedValueOnce([
            { id: 'subtask1', subtask_name: 'Subtask 1', end_date: new Date('2025-01-02T18:00:00'), status: true },
            { id: 'subtask2', subtask_name: 'Subtask 2', end_date: new Date('2025-01-03T15:00:00'), status: true },
        ]);

        // Mock the expected behaviour
        getSubtasksByTaskID.mockResolvedValueOnce([
            { id: 'subtask1', subtask_name: 'Subtask 1', end_date: new Date('2025-01-02T18:00:00'), status: true },
            { id: 'subtask2', subtask_name: 'Subtask 2', end_date: new Date('2025-01-03T15:00:00'), status: false },
        ]);

        // Select Subtask 2 checkbox
        subtaskCheckbox = getByTestId('checkbox-subtask2');
        // Press on checkbox
        fireEvent.press(subtaskCheckbox);

        await waitFor(() => {
            // Verify that the updateSubtask has been called with the correct details
            expect(updateSubtask).toHaveBeenCalledWith(expect.anything(), 'subtask2', { status: false });
        });
    });

    // Test to update UI on successful refresh
    it('should update UI on successful refresh', async () => {
        // Mock useFocusEffect
        const { useFocusEffect } = jest.requireActual('@react-navigation/native');
        jest.spyOn(require('@react-navigation/native'), 'useFocusEffect')
            .mockImplementation(useFocusEffect);
        
        // Get the updated task name when refreshed
        const refreshedTask = { ...mockTask, task_name: 'Updated Test Task' };
        // Mock the task details with the refreshed task
        getTaskByID
            .mockResolvedValueOnce(mockTask)  
            .mockResolvedValueOnce(refreshedTask);
        
        // Renders the TaskDetailScreen component
        const { getByText } = render(
            <NavigationContainer>
                <TaskDetailScreen />
            </NavigationContainer>
        );
        await waitFor(() => {
            // Verify the Updated Test Task is displayed
            expect(getByText('Updated Test Task')).toBeTruthy();
        });
    });

    // Test to render loading indicator initially
    it('should render loading indicator initially', async () => {
        // Renders the TaskDetailScreen component
        const { getByText } = render(
            <NavigationContainer>
                <TaskDetailScreen />
            </NavigationContainer>
        );

        // Verify the Loading task detail... is displayed
        expect(getByText('Loading task detail...')).toBeTruthy();
    });

    // Test to show an alert for failing to fetch task if getTaskByID fails
    it('should show an alert for failing to fetch task if getTaskByID fails', async () => {
        // Mock the task service with an error
        getTaskByID.mockRejectedValueOnce(new Error('Error fetching task'));

        // Renders the TaskDetailScreen component
        render(
            <NavigationContainer>
                <TaskDetailScreen />
            </NavigationContainer>
        );

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Fetching Task Error', 'Failed to fetch task.');
        });
    });

    // Test to show an alert for failing to fetch group if getGroupByID fails
    it('should show an alert for failing to fetch group if getGroupByID fails', async () => {
        // Mock groups service with an error
        getGroupByID.mockRejectedValueOnce(new Error('Error fetching group'));

        // Renders the TaskDetailScreen component
        render(
            <NavigationContainer>
                <TaskDetailScreen />
            </NavigationContainer>
        );

        await waitFor(() => {
            // Verify that an error alert is shown to the user when failed to fetch group
            expect(Alert.alert).toHaveBeenCalledWith('Fetching Group Error', 'Failed to fetch group.');
        });
    });

    // Test to show an alert for failing to fetch priority if getPriorityByID fails
    it('should show an alert for failing to fetch priority if getPriorityByID fails', async () => {
        // Mock priority service with an error
        getPriorityByID.mockRejectedValueOnce(new Error('Error fetching priority'));

        // Renders the TaskDetailScreen component
        render(
            <NavigationContainer>
                <TaskDetailScreen />
            </NavigationContainer>
        );

        await waitFor(() => {
            // Verify that an error alert is shown to the user when failed to fetch priority
            expect(Alert.alert).toHaveBeenCalledWith('Fetching Priority Error', 'Failed to fetch priority.');
        });
    });

    // Test to show an alert for failing to fetch attachments if getAttachmentsByTaskID fails
    it('should show an alert for failing to fetch attachments if getAttachmentsByTaskID fails', async () => {
        // Mock attachments service with an error
        getAttachmentsByTaskID.mockRejectedValueOnce(new Error('Error fetching attachments'));

        // Renders the TaskDetailScreen component
        render(
            <NavigationContainer>
                <TaskDetailScreen />
            </NavigationContainer>
        );

        await waitFor(() => {
            // Verify that an error alert is shown to the user when failed to fetch attachments
            expect(Alert.alert).toHaveBeenCalledWith('Fetching Attachments Error', 'Failed to fetch attachments.');
        });
    });

    // Test to show an alert for failing to fetch subtasks if getSubtasksByTaskID fails
    it('should show an alert for failing to fetch subtasks if getSubtasksByTaskID fails', async () => {
        // Mock subtasks service with an error
        getSubtasksByTaskID.mockRejectedValueOnce(new Error('Error fetching subtasks'));

        // Renders the TaskDetailScreen component
        render(
            <NavigationContainer>
                <TaskDetailScreen />
            </NavigationContainer>
        );

        await waitFor(() => {
            // Verify that an error alert is shown to the user when failed to fetch subtasks
            expect(Alert.alert).toHaveBeenCalledWith('Fetching Subtasks Error', 'Failed to fetch subtasks.');
        });
    });

    // Test to show an alert for failing to fetch grade if getGradeByID fails
    it('should show an alert for failing to fetch grade if getGradeByID fails', async () => {
        // Mock grade service with an error
        getGradeByID.mockRejectedValueOnce(new Error('Error fetching grade'));
        
        // Renders the TaskDetailScreen component
        render(
            <NavigationContainer>
                <TaskDetailScreen />
            </NavigationContainer>
        );

        await waitFor(() => {
            // Verify that an error alert is shown to the user when failed to fetch grade
            expect(Alert.alert).toHaveBeenCalledWith('Fetching Grade Error', 'Failed to fetch grade.');
        });
    });

    // Test to show an alert for failing to update task if updateTask fails
    it('should show an alert for failing to update task if updateTask fails', async () => {
        // Mock update task service with an error
        updateTask.mockRejectedValueOnce(new Error('Error updating task'));

        // Renders the TaskDetailScreen component
        const { getByText } = render(
            <NavigationContainer>
                <TaskDetailScreen />
            </NavigationContainer>
        );

        await waitFor(() => {
            // Press on Mark As Completed
            expect(getByText('Mark As Completed')).toBeTruthy();
        });

        // Press on Mark As Completed
        fireEvent.press(getByText('Mark As Completed'));

        await waitFor(() => {
            // Verify that an error alert is shown to the user when failed to update task
            expect(Alert.alert).toHaveBeenCalledWith('Update Task Error', 'Failed to update task.');
        });
    });

    // Test to show an alert for invalid duration formatting when task.duration is negative
    it('should show an alert for invalid duration formatting when task.duration is negative', async () => {
        // Mock the required services but mock groups service with negative duration
        const invalidTask = { ...mockTask, duration: -1000};
        getTaskByID.mockResolvedValueOnce(invalidTask);
    
        // Renders the TaskDetailScreen component
        render(
            <NavigationContainer>
                <TaskDetailScreen />
            </NavigationContainer>
        );
    
        await waitFor(() => {
            // Verify that an error alert is shown to the user when failed to format duration
            expect(Alert.alert).toHaveBeenCalledWith('Formatting Duration Error', 'Failed to format duration.');
        });
    });

    // Test to show an alert for invalid duration formatting when task.duration is a string
    it('should show an alert for invalid duration formatting when task.duration is a string', async () => {
        // Mock the required services but mock task with string duration
        const invalidTask = { ...mockTask, duration:'one thousand'};
        getTaskByID.mockResolvedValueOnce(invalidTask);
    
        // Renders the TaskDetailScreen component
        render(
            <NavigationContainer>
                <TaskDetailScreen />
            </NavigationContainer>
        );
    
        await waitFor(() => {
            // Verify that an error alert is shown to the user when failed to format duration
            expect(Alert.alert).toHaveBeenCalledWith('Formatting Duration Error', 'Failed to format duration.');
        });
    });

    // Test to show show an alert for failing to update subtask when toggleSubtaskCompletion errors
    it('should show an alert for failing to update subtask when toggleSubtaskCompletion errors', async () => {
        // Mock updateSubtask to throw an error
        updateSubtask.mockRejectedValueOnce(new Error('Error updating subtask'));
    
        // Renders the TaskDetailScreen component
        const { getByText, getByTestId } = render(
            <NavigationContainer>
                <TaskDetailScreen />
            </NavigationContainer>
        );
    
        await waitFor(() => {
            // Verify that Subtask 2 is displayed
            expect(getByText('Subtask 2')).toBeTruthy();
        });
    
        // Select Subtask 2 checkbox
        const subtaskCheckbox = getByTestId('checkbox-subtask2');
        // Press on checkbox
        fireEvent.press(subtaskCheckbox);
    
        await waitFor(() => {
            // Verify that an error alert is shown to the user when updating subtask fails
            expect(Alert.alert).toHaveBeenCalledWith('Update Subtask Error', 'Failed to update subtask.');
        });
    });

    // Test to show an alert for failing to refresh task
    it('should show an alert for failing to refresh task', async () => {
        // Mock useFocusEffect
        const { useFocusEffect } = jest.requireActual('@react-navigation/native');
        jest.spyOn(require('@react-navigation/native'), 'useFocusEffect')
            .mockImplementation(useFocusEffect);
        
        // Mock the task details with the error
        getTaskByID
            .mockResolvedValueOnce(mockTask) 
            .mockRejectedValueOnce(new Error('Error refreshing task'));
        
        // Renders the TaskDetailScreen component
        render(
            <NavigationContainer>
                <TaskDetailScreen />
            </NavigationContainer>
        );
        
        await waitFor(() => {
            // Verify that an error alert is shown to the user when failed to refresh task
            expect(Alert.alert).toHaveBeenCalledWith('Refreshing Task Error', 'Failed to refresh task.');
        });
    });
    
    // Snapshot test for TaskDetailScreen when task is not completed
    it('should match the snapshot when task is not completed', async () => {

        // Renders the TaskDetailScreen component
        const { getByText, toJSON } = render(
            <NavigationContainer>
                <TaskDetailScreen />
            </NavigationContainer>
        );
    
        await waitFor(() => {
            // Verify that Test Task is displayed
            expect(getByText('Test Task')).toBeTruthy();
        });
        // Verify snapshot matches
        expect(toJSON()).toMatchSnapshot();
    });

    // Snapshot test for TaskDetailScreen when task is completed
    it('should match the snapshot when task is completed', async () => {
        // Mock the updateTask service
        updateTask.mockResolvedValueOnce(true);
        markAllSubtasksComplete.mockResolvedValue(true);

        // Renders the TaskDetailScreen component
        const { getByText, toJSON } = render(
            <NavigationContainer>
                <TaskDetailScreen />
            </NavigationContainer>
        );

        await waitFor(() => {
            // Verify that Mark As Completed is displayed
            expect(getByText('Mark As Completed')).toBeTruthy();
        });

        // Press the Mark As Completed button.
        fireEvent.press(getByText('Mark As Completed'));

        await waitFor(() => {
            // Verify that the button changed to Mark As Uncompleted
            expect(getByText('Mark As Uncompleted')).toBeTruthy();
            // Verify that updateTask has been called with the updated status
            expect(updateTask).toHaveBeenCalledWith(expect.anything(), 'task1', { status: true });
            // Verify that markAllSubtasksComplete has been called with the updated statuses
            expect(markAllSubtasksComplete).toHaveBeenCalledWith(expect.anything(), 'task1', true);
            // Verify the success alert for updating task
            expect(Alert.alert).toHaveBeenCalledWith('Success', 'Task and all subtasks marked as completed.');
        });
    
        // Verify snapshot matches
        expect(toJSON()).toMatchSnapshot();
    });

    // Snapshot test for TaskDetailScreen when updating UI on successful refresh
    it('should match the snapshot when updating UI on successful refresh', async () => {
        // Mock useFocusEffect
        const { useFocusEffect } = jest.requireActual('@react-navigation/native');
        jest.spyOn(require('@react-navigation/native'), 'useFocusEffect')
            .mockImplementation(useFocusEffect);
        
        // Get the updated task name when refreshed
        const refreshedTask = { ...mockTask, task_name: 'Updated Test Task' };
        // Mock the task details with the refreshed task
        getTaskByID
            .mockResolvedValueOnce(mockTask)
            .mockResolvedValueOnce(refreshedTask); 
        
        // Renders the TaskDetailScreen component
        const { getByText, toJSON } = render(
            <NavigationContainer>
                <TaskDetailScreen />
            </NavigationContainer>
        );

        await waitFor(() => {
            // Verify the Updated Test Task is displayed
            expect(getByText('Updated Test Task')).toBeTruthy();
        });

        // Verify snapshot matches
        expect(toJSON()).toMatchSnapshot();
    });
});