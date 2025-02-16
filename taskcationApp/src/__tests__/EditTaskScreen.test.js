// Import dependencies and libraries used for testing Edit Task Screen
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EditTaskScreen from '../screens/EditTaskScreen';
import { updateTask, getTaskByID } from '../services/taskService';
import { createAttachment, deleteAttachment, getAttachmentsByTaskID } from '../services/attachmentService';
import { getGroupsByCreator } from '../services/groupsService';
import { getAllPriorities } from '../services/priorityLevelsService';
import { Alert } from 'react-native';

// Mock task for the test
const mockTask = {
    task_id: 'task1',
    task_name: 'Test Edit Task',
    start_date: new Date('2025-01-20T10:00:00'),
    end_date: new Date('2025-01-21T12:00:00'),
    task_notes: 'Test notes.',
    group_id: '1',
    priority_id: '2',
};

// Mock attachment for the test
const mockAttachments = [
    { id: '1', uri: 'https://test.com/test_attachment.pdf', file_name: 'test_attachment.pdf', file_type: 'application/pdf' },
];

// Array of mocked groups to do dropdown testing
const mockGroups = [
    { id: '1', group_name: 'Math', group_type: 'Subjects', created_by: 'temp_user_123' },
    { id: '2', group_name: 'General', group_type: 'Categories', created_by: 'temp_user_123' },
];

// Array of mocked priorities to do dropdown testing
const mockPriorities = [
    { id: '1', priority_name: 'Urgent' },
    { id: '2', priority_name: 'High' },
    { id: '3', priority_name: 'Medium' },
    { id: '4', priority_name: 'Low' },
    { id: '5', priority_name: 'N/A' },
];

// Mock AddAttachments Component
jest.mock('../components/AddAttachments', () => {
    const React = require('react');
    const { TouchableOpacity, Text } = require('react-native');
    return ({ onAttachmentsChange }) => (
        <TouchableOpacity
            testID='insert-attachment-button'
            onPress={() => {
                const newAttachment = {
                    file_name: 'new_attachment.pdf',
                    file_type: 'application/pdf',
                    uri: 'https://test.com/new_attachment.pdf',
                    size: 1024,
                };
                onAttachmentsChange([newAttachment]);
            }}
        >
            <Text>Insert Attachment</Text>
        </TouchableOpacity>
    );
});

// Mock ViewAttachments Component
jest.mock('../components/ViewAttachments', () => {
    const React = require('react');
    const { TouchableOpacity, Text, View } = require('react-native');
    return ({ attachments, onDeleteAttachment }) => (
        <View>
            {attachments.map((attachment) => (
                <View key={attachment.uri}>
                    <Text>{attachment.file_name}</Text>
                    <TouchableOpacity
                        testID={`delete-${attachment.id}`}
                        onPress={() => onDeleteAttachment(attachment)}
                    >
                        <Text>Delete</Text>
                    </TouchableOpacity>
                </View>
            ))}
        </View>
    );
});

// Mock useNavigation hook
const mockNavigation = {
    goBack: jest.fn(),
    addListener: jest.fn(() => {
        // Return a cleanup function that does nothing
        return () => {};
    }),
};

jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual('@react-navigation/native');
    return {
        ...actualNav,
        useNavigation: () => mockNavigation,
        useRoute: () => ({ params: { taskID: 'task1' } }),
    };
});

// Mock Dropdown picker to display the dropdown value
jest.mock('react-native-dropdown-picker', () => {
    const React = require('react');
    const { TouchableOpacity, Text, View } = require('react-native');
    return function MockDropDownPicker({ placeholder, open, setOpen, value, setValue, items }) {
        const displayText = value !== '' ? (items.find(item => item.value === value)?.label || value) : placeholder;
        return (
            <View>
                {open &&
                    items.map((item) => (
                    <TouchableOpacity
                        key={item.value}
                        onPress={() => {
                            setValue(item.value);
                            setOpen(false);
                        }}
                    >   
                    <Text>{item.label}</Text>
                </TouchableOpacity>
                ))}
            <TouchableOpacity
                testID={`${placeholder}-button`}
                onPress={() => setOpen(!open)}
            >
                <Text>{displayText}</Text>
            </TouchableOpacity>
            </View>
        );
        };
});

describe('EditTaskScreen', () => {
    // Clear all mocks and reset them before each test
    beforeEach(() => {
        getTaskByID.mockClear();
        getTaskByID.mockReset();
        updateTask.mockClear();
        updateTask.mockReset();
        createAttachment.mockClear();
        createAttachment.mockReset();
        getAttachmentsByTaskID.mockClear();
        getAttachmentsByTaskID.mockReset();
        getGroupsByCreator.mockClear();
        getGroupsByCreator.mockReset();
        getAllPriorities.mockClear();
        getAllPriorities.mockReset();
        jest.clearAllMocks();
        // Spy on Alert.alert to verify alerts
        jest.spyOn(Alert, 'alert').mockImplementation(() => {});
        // Intialise the AsyncStorage with user_id and joined_date
        AsyncStorage.getItem.mockImplementation(async (key) => {
            if (key === 'user_id') {
                return 'temp_user_123';
            }
            return null;
        });
        // Mock the required services
        getTaskByID.mockResolvedValue(mockTask);
        getAttachmentsByTaskID.mockResolvedValue(mockAttachments);
        getGroupsByCreator.mockResolvedValue(mockGroups);
        getAllPriorities.mockResolvedValue(mockPriorities);
    });

    // Test to check if user ID is stored in AsyncStorage
    it('should store user ID in AsyncStorage', async () => {
        // Retrieve the user ID
        const userId = await AsyncStorage.getItem('user_id');
        // Verify that the user ID is correctly stored
        expect(userId).toBe('temp_user_123');
    });
    
    // Test to render the Edit Task screen with all components
    it('should render the Edit Task screen with all components', async () => {
        // Renders the EditTaskScreen component
        const { getByText, getByDisplayValue } = render(
            <NavigationContainer>
                <EditTaskScreen route={{ params: { taskID: 'task1' } }} />
            </NavigationContainer>
        );

        await waitFor(() => {
            // Verify that all component are rendered with the correct text
            expect(getByText('Edit Task')).toBeTruthy();
            expect(getByDisplayValue('Test Edit Task')).toBeTruthy();
            expect(getByText('20/01/2025')).toBeTruthy();
            expect(getByText('10:00')).toBeTruthy();
            expect(getByText('21/01/2025')).toBeTruthy();
            expect(getByText('12:00')).toBeTruthy();
            expect(getByDisplayValue('Test notes.')).toBeTruthy();
            expect(getByText('Math')).toBeTruthy();
            expect(getByText('High')).toBeTruthy();
            expect(getByText('Insert Attachment')).toBeTruthy();
            expect(getByText('test_attachment.pdf')).toBeTruthy();
            expect(getByText('Update')).toBeTruthy();
        });
    });

    // Test to successfully update the task, delete and insert new attachments
    it('should update the task successfully, delete and insert new attachments', async () => {
        // Mock successful service for updateTask, createAttachment, and deleteAttachment
        updateTask.mockResolvedValueOnce(undefined);
        createAttachment.mockResolvedValueOnce(undefined);
        deleteAttachment.mockResolvedValueOnce(undefined);

        // Renders the EditTaskScreen component
        const { getByText, queryByText, getByTestId, getByDisplayValue, getAllByText  } = render(
            <NavigationContainer>
                <EditTaskScreen route={{ params: { taskID: 'task1' } }} />
            </NavigationContainer>
        );

        await waitFor(() => {
            // Verify that the task name is displayed correctly
            expect(getByDisplayValue('Test Edit Task')).toBeTruthy();
        });

        // Change the task name
        fireEvent.changeText(getByDisplayValue('Test Edit Task'), 'Updated Task Name');

        // Start date set to one day ago
        const earlierDate = new Date(mockTask.start_date - 86400000);
        const startDateString = earlierDate.toLocaleDateString('en-GB', {day: '2-digit', month:'2-digit', year:'numeric'});
        const startTimeString = earlierDate.toLocaleTimeString('en-GB',{hour:'2-digit', minute:'2-digit'});

        // End date set to one day later and a few minutes later
        const laterDate = new Date(mockTask.end_date + 86400000 + 300000);
        const endDateString = laterDate.toLocaleDateString('en-GB', {day: '2-digit', month:'2-digit', year:'numeric'});
        const endTimeString = laterDate.toLocaleTimeString('en-GB',{hour:'2-digit', minute:'2-digit'});

        // Press on start date which is 20/01/2025
        fireEvent.press(getByText('20/01/2025'));
        // Retrieve the start date picker component
        const startDatePicker = getByTestId('startDatePicker');
        // Simulate changing the start date to an earlier date
        fireEvent(startDatePicker, 'onChange', {type: 'set'}, earlierDate);

        // Press on start time which is 10:00
        fireEvent.press(getByText('10:00'));
        // Retrieve the start time picker component
        const startTimePicker = getByTestId('startTimePicker');
        // Simulate changing the start time to an earlier time
        fireEvent(startTimePicker, 'onChange', {type: 'set'}, earlierDate);

        // Press on end date which is 21/01/2025
        fireEvent.press(getByText('21/01/2025'));
        // Retrieve the end date picker component
        const endDatePicker = getByTestId('endDatePicker');
        // Simulate changing the end date to an later date
        fireEvent(endDatePicker, 'onChange', {type: 'set'}, laterDate);

        // Press on end time which is 12:00
        fireEvent.press(getByText('12:00'));
        // Retrieve the end time picker component
        const endTimePicker = getByTestId('endTimePicker');
        // Simulate changing the end time 
        fireEvent(endTimePicker, 'onChange', {type: 'set'}, laterDate);

        await waitFor(() => {
            // Verify that all the date is displayed correctly
            expect(getByText(startDateString)).toBeTruthy();
            expect(getByText(startTimeString)).toBeTruthy();
            expect(getByText(endDateString)).toBeTruthy();
            expect(getByText(endTimeString)).toBeTruthy();
        });

        // Change the task notes
        fireEvent.changeText(getByDisplayValue('Test notes.'), 'Updating test notes.');
        
        // Press on Groups dropdown
        fireEvent.press(getByTestId('Groups-button'));
        await waitFor(() => {
            // Verify the groups shown matches the mockGroups
            // There should be multiple Math as the mock task group is Math
            expect(getAllByText('Math')).toBeTruthy();
            expect(getByText('General')).toBeTruthy();
        });
        // Press on General
        fireEvent.press(getByText('General'));
    
        // Press on Priority Level dropdown
        fireEvent.press(getByTestId('Priority Level-button'));
        await waitFor(() => {
            // Verify the priorities shown matches the mockPriorities
            // There should be multiple High as the mock task priority level is High
            expect(getByText('Urgent')).toBeTruthy();
            expect(getAllByText('High')).toBeTruthy();
            expect(getByText('Medium')).toBeTruthy();
            expect(getByText('Low')).toBeTruthy();
            expect(getByText('N/A')).toBeTruthy();
        });
        // Press on Urgent
        fireEvent.press(getByText('Urgent'));

        // Press the delete button for the first attachment
        fireEvent.press(getByTestId('delete-1'));
        await waitFor(() => {
            // Verify that the attachment is gone
            expect(queryByText('test_attachment.pdf')).toBeNull();
        });

        // Press on Insert Attachment
        fireEvent.press(getByText('Insert Attachment'));

        await waitFor(() => {
            // Verify the mocked attachment is correct
            expect(getByText('new_attachment.pdf')).toBeTruthy();
        });

        // Press the Update button
        fireEvent.press(getByText('Update'));

        await waitFor(() => {
            // Verify updateTask was called once
            expect(updateTask).toHaveBeenCalledTimes(1);
            // Verify updateTask was called with updated values
            expect(updateTask).toHaveBeenCalledWith(expect.any(Object), 'task1', 
                expect.objectContaining({
                task_name: 'Updated Task Name',
                start_date: earlierDate,
                end_date: laterDate,
                duration: expect.any(Number),
                task_notes: 'Updating test notes.',
                group_id: '2',
                priority_id: '1',
            }));
            // Verify that the createAttachment was called once
            expect(createAttachment).toHaveBeenCalledTimes(1);
            // Verify the attachment creation information
            expect(createAttachment).toHaveBeenCalledWith(expect.any(Object), {
                task_id: 'task1',
                file_name: 'new_attachment.pdf',
                file_type: 'application/pdf',
                uri: 'https://test.com/new_attachment.pdf',
                size: 1024,
                durationMillis: null,
            });
            // Verify that deleteAttachment was called once
            expect(deleteAttachment).toHaveBeenCalledTimes(1);
            // Check that success alert is shown.
            expect(Alert.alert).toHaveBeenCalledWith('Success', 'Task updated successfully!');
            // Verify that goBack was called once
            expect(mockNavigation.goBack).toHaveBeenCalledTimes(1);
        });
    });

    // Test to load groups and priorities on mount
    it('should load groups and priorities on mount', async () => {
        // Renders the EditTaskScreen component
        const { getByText, getByTestId, getAllByText  } = render(
            <NavigationContainer>
                <EditTaskScreen route={{ params: { taskID: 'task1' } }} />
            </NavigationContainer>
        );

        await waitFor(() => {
            // Verify Groups and Priority Level is displayed
            expect(getByText('Math')).toBeTruthy();
            expect(getByText('High')).toBeTruthy();
        });

        // Press on Groups dropdown
        fireEvent.press(getByTestId('Groups-button'));
        await waitFor(() => {
            // Verify the groups shown matches the mockGroups
            // There should be multiple Math as the mock task group is Math
            expect(getAllByText('Math')).toBeTruthy();
            expect(getByText('General')).toBeTruthy();
        });
        // Press on General
        fireEvent.press(getByText('General'));

        // Press on Priority Level dropdown
        fireEvent.press(getByTestId('Priority Level-button'));
        await waitFor(() => {
            // Verify the priorities shown matches the mockPriorities
            // There should be multiple High as the mock task priority level is High
            expect(getByText('Urgent')).toBeTruthy();
            expect(getAllByText('High')).toBeTruthy();
            expect(getByText('Medium')).toBeTruthy();
            expect(getByText('Low')).toBeTruthy();
            expect(getByText('N/A')).toBeTruthy();
        });
        // Press on Urgent
        fireEvent.press(getByText('Urgent'));
    });

    // Test to render loading indicator initially
    it('should render loading indicator initially', async () => {
        // Renders the EditTaskScreen component
        const { getByText } = render(
            <NavigationContainer>
                <EditTaskScreen route={{ params: { taskID: 'task1' } }} />
            </NavigationContainer>
        );

        // Verify the Loading task detail... is displayed
        expect(getByText('Loading task detail...')).toBeTruthy();
    });

    // Test to show an alert if fetching task details fails
    it('should show an alert if fetching task details fails', async () => {
        // Mock fetching task error
        getTaskByID.mockRejectedValueOnce(new Error('Fetching Task Details Error'));
    
        // Renders the EditTaskScreen component
        render(
            <NavigationContainer>
                <EditTaskScreen route={{ params: { taskID: 'task1' } }} />
            </NavigationContainer>
        );
    
        await waitFor(() => {
            // Verify that an error alert is shown to the user when failing to fetch task details
            expect(Alert.alert).toHaveBeenCalledWith('Fetching Task Details Error', 'Failed to fetch task details.');
        });
    });

    // Test to show an alert if failed to update task
    it('should show an alert if failed to update task', async () => {
        // Mock task update error
        updateTask.mockRejectedValueOnce(new Error('Failed to update task'));

        // Renders the EditTaskScreen component
        const { getByText, getByDisplayValue } = render(
            <NavigationContainer>
                <EditTaskScreen route={{ params: { taskID: 'task1' } }} />
            </NavigationContainer>
        );
    
        await waitFor(() => {
            // Verify that all component are rendered with the correct text
            expect(getByDisplayValue('Test Edit Task')).toBeTruthy();
            expect(getByText('20/01/2025')).toBeTruthy();
            expect(getByText('10:00')).toBeTruthy();
            expect(getByText('21/01/2025')).toBeTruthy();
            expect(getByText('12:00')).toBeTruthy();
            expect(getByDisplayValue('Test notes.')).toBeTruthy();
            expect(getByText('Math')).toBeTruthy();
            expect(getByText('High')).toBeTruthy();
            expect(getByText('Insert Attachment')).toBeTruthy();
            expect(getByText('test_attachment.pdf')).toBeTruthy();
            expect(getByText('Update')).toBeTruthy();
        });

        // Change the task name
        fireEvent.changeText(getByDisplayValue('Test Edit Task'), 'Test Edit Task Failed');
    
        // Press on Update button
        fireEvent.press(getByText('Update'));
    
        await waitFor(() => {
            // Verify updateTask was called once
            expect(updateTask).toHaveBeenCalledTimes(1);
            // Verify that an error alert is shown to the user when updating the task failed
            expect(Alert.alert).toHaveBeenCalledWith('Update Error', 'Failed to update the task.');
        });
        
    });

    // Test to show an alert if failed to add attachments
    it('should show an alert if failed to add attachments', async () => {
        // Mock the successful update of task
        updateTask.mockResolvedValueOnce(true);
        // Mock attachment creation error
        createAttachment.mockRejectedValueOnce(new Error('Failed to create attachment'));
    
        // Renders the EditTaskScreen component
        const { getByText, getByDisplayValue } = render(
            <NavigationContainer>
                <EditTaskScreen route={{ params: { taskID: 'task1' } }} />
            </NavigationContainer>
        );
    
        await waitFor(() => {
            // Verify that all component are rendered with the correct text
            expect(getByDisplayValue('Test Edit Task')).toBeTruthy();
            expect(getByText('20/01/2025')).toBeTruthy();
            expect(getByText('10:00')).toBeTruthy();
            expect(getByText('21/01/2025')).toBeTruthy();
            expect(getByText('12:00')).toBeTruthy();
            expect(getByDisplayValue('Test notes.')).toBeTruthy();
            expect(getByText('Math')).toBeTruthy();
            expect(getByText('High')).toBeTruthy();
            expect(getByText('Insert Attachment')).toBeTruthy();
            expect(getByText('test_attachment.pdf')).toBeTruthy();
            expect(getByText('Update')).toBeTruthy();
        });

        // Change the task name
        fireEvent.changeText(getByDisplayValue('Test Edit Task'), 'Test Edit Task Attachment Failed');
    
        // Press on Insert Attachment
        fireEvent.press(getByText('Insert Attachment'));
        await waitFor(() => {
            // Verify the mocked attachment is correct
            expect(getByText('new_attachment.pdf')).toBeTruthy();
        });

        // Press on Update button
        fireEvent.press(getByText('Update'));
    
        await waitFor(() => {
            // Verify updateTask was called once
            expect(updateTask).toHaveBeenCalledTimes(1);
            // Verify that the createAttachment was called once
            expect(createAttachment).toHaveBeenCalledTimes(1);
            // Verify that an error alert is shown to the user when updating the task failed
            expect(Alert.alert).toHaveBeenCalledWith('Update Error', 'Failed to update the task.');
        });
    });

    // Test to show an alert if Task Name is missing
    it('should show an alert if Task Name is missing', async () => {
        // Renders the EditTaskScreen component
        const { getByText, getByDisplayValue } = render(
            <NavigationContainer>
                <EditTaskScreen route={{ params: { taskID: 'task1' } }} />
            </NavigationContainer>
        );

        await waitFor(() => {
            // Verify that the task name is displayed correctly
            expect(getByDisplayValue('Test Edit Task')).toBeTruthy();
        });

        // Clear task name
        fireEvent.changeText(getByDisplayValue('Test Edit Task'), '');

        // Press on Update button
        fireEvent.press(getByText('Update'));

        await waitFor(() => {
            // Verify that an error alert is shown to the user when there is no task name added
            expect(Alert.alert).toHaveBeenCalledWith('Incomplete Task', 'Please enter the Task Name.');
        });
    });

    // Test to show an alert if End Date is invalid
    it('should show an alert if End Date is invalid', async () => {
        // Mock the task to have no end date
        const taskWithoutEndDate = { ...mockTask, end_date: '' };
        getTaskByID.mockResolvedValueOnce(taskWithoutEndDate);

        // Renders the EditTaskScreen component
        const { getByText, getByDisplayValue } = render(
            <NavigationContainer>
                <EditTaskScreen route={{ params: { taskID: 'task1' } }} />
            </NavigationContainer>
        );

        await waitFor(() => {
            // Verify that the task name is displayed correctly
            expect(getByDisplayValue('Test Edit Task')).toBeTruthy();
        });

        // Press on Update button
        fireEvent.press(getByText('Update'));

        await waitFor(() => {
            // Verify that an error alert is shown to the user when there is no end date and time added
            expect(Alert.alert).toHaveBeenCalledWith('Incomplete Task', 'Please select an End Date and Time.');
        });
    });

    // Test to show an alert if End Date is on or before Start Date
    it('should show an alert if End Date is before Start Date', async () => {
        // Renders the EditTaskScreen component
        const { getByText, getByTestId, getByDisplayValue } = render(
            <NavigationContainer>
                <EditTaskScreen route={{ params: { taskID: 'task1' } }} />
            </NavigationContainer>
        );

        await waitFor(() => {
            // Verify that the task name is displayed correctly
            expect(getByDisplayValue('Test Edit Task')).toBeTruthy();
        });

        // Set an invalid end date
        const invalidEndDate = new Date('2025-01-19T10:00:00');

        // Press on end date which is 21/01/2025
        fireEvent.press(getByText('21/01/2025'));
        // Retrieve the end date picker component
        const endDatePicker = getByTestId('endDatePicker');
        // Simulate changing the end date to an earlier date
        fireEvent(endDatePicker, 'onChange', { type: 'set' }, invalidEndDate);

        // Press on Update button
        fireEvent.press(getByText('Update'));

        await waitFor(() => {
            // Verify that an error alert is shown to the user when end date is earlier than start date
            expect(Alert.alert).toHaveBeenCalledWith('Invalid Date', 'End Date must be on or after the Start Date.');
        });
    });

    // Test to show an alert if Group is not selected
    it('should show an alert if no Group is not selected', async () => {
        // Return a task with an empty group_id to simulate no group selected.
        const taskWithoutGroup = { ...mockTask, group_id: '' };
        getTaskByID.mockResolvedValueOnce(taskWithoutGroup);
    
        // Renders the EditTaskScreen component
        const { getByText, getByDisplayValue } = render(
            <NavigationContainer>
                <EditTaskScreen route={{ params: { taskID: 'task1' } }} />
            </NavigationContainer>
        );
    
        await waitFor(() => {
            // Verify that the task name is displayed correctly
            expect(getByDisplayValue('Test Edit Task')).toBeTruthy();
        });

        // Press the Update button
        fireEvent.press(getByText('Update'));
    
        await waitFor(() => {
            // Verify that an error alert is shown to the user when no group was selected
            expect(Alert.alert).toHaveBeenCalledWith('Incomplete Task', 'Please select a Group.');
        });
    });

    // Test to show an alert if loading groups fails
    it('should show an alert if loading groups fails', async () => {
        // Mock loading group error
        getGroupsByCreator.mockRejectedValueOnce(new Error('Groups Initialisation Error'));
    
        // Renders the EditTaskScreen component
        render(
            <NavigationContainer>
                <EditTaskScreen route={{ params: { taskID: 'task1' } }} />
            </NavigationContainer>
        );
    
        await waitFor(() => {
            // Verify that an error alert is shown to the user when group loading fails
            expect(Alert.alert).toHaveBeenCalledWith('Initialising User, Groups and Priorities Error', 'Failed to initialise user, groups and priorities.');
        });
    });

    // Test to show an alert if loading priority levels fails
    it('should show an alert if loading priority levels fails', async () => {
        // Mock loading priorities error
        getAllPriorities.mockRejectedValueOnce(new Error('Priority Levels Initialisation Error'));
    
        // Renders the EditTaskScreen component
        render(
            <NavigationContainer>
                <EditTaskScreen route={{ params: { taskID: 'task1' } }} />
            </NavigationContainer>
        );
    
        await waitFor(() => {
            // Verify that an error alert is shown to the user when priorities loading fails
            expect(Alert.alert).toHaveBeenCalledWith('Initialising User, Groups and Priorities Error', 'Failed to initialise user, groups and priorities.');
        });
    });


    // Snapshot test for EditTaskScreen
    it('should match the snapshot', async () => {
        // Renders the EditTaskScreen component
        const { toJSON, getByDisplayValue } = render(
            <NavigationContainer>
                <EditTaskScreen route={{ params: { taskID: 'task1' } }} />
            </NavigationContainer>
        );

        await waitFor(() => {
            // Verify that the task name is displayed correctly
            expect(getByDisplayValue('Test Edit Task')).toBeTruthy();
        });

        // Verify snapshot matches
        expect(toJSON()).toMatchSnapshot();
    });

});