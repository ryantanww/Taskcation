// Import dependencies and libraries used for testing Add Task Screen
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AddTaskScreen from '../screens/AddTaskScreen';
import { createTask, deleteTask } from '../services/taskService';
import { createAttachment } from '../services/attachmentService';
import { getGroupsByCreator } from '../services/groupsService';
import { getAllPriorities } from '../services/priorityLevelsService';
import { Alert } from 'react-native'; 

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

// Spy on Alert.alert to verify alerts
jest.spyOn(Alert, 'alert').mockImplementation(() => {});

// Mock AddAttachments Component
jest.mock('../components/AddAttachments', () => {
    const React = require('react');
    const { TouchableOpacity, Text } = require('react-native');
    return ({ onAttachmentsChange }) => (
        <TouchableOpacity
            testID='insert-attachment-button'
            onPress={() => {
                const newAttachment = {
                    id: '1',
                    file_name: 'test_attachment.pdf',
                    file_type: 'application/pdf',
                    uri: 'https://test.com/test_attachment.pdf',
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
        return () => {};
    }),
};

jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual('@react-navigation/native');
    return {
        ...actualNav,
        useNavigation: () => mockNavigation,
    };
});

describe('AddTaskScreen', () => {
    // Clear all mocks and reset them before each test
    beforeEach(() => {
        createTask.mockClear();
        createTask.mockReset();
        createAttachment.mockClear();
        createAttachment.mockReset();
        getGroupsByCreator.mockClear();
        getGroupsByCreator.mockReset();
        getAllPriorities.mockClear();
        getAllPriorities.mockReset();
        jest.clearAllMocks();
        // Intialise the AsyncStorage with user_id and joined_date
        AsyncStorage.getItem.mockImplementation(async (key) => {
            if (key === 'user_id') {
                return 'temp_user_123';
            }
            return null;
        });
    });

    // Test to render the Add Task screen with all components
    it('should render the Add Task screen with all components', async () => {
        // Renders the AddTaskScreen component
        const { getByPlaceholderText, getByText } = render(
            <NavigationContainer>
                <AddTaskScreen />
            </NavigationContainer>
        );

        // Get the current date and time
        const now = new Date();
        const startDateString = now.toLocaleDateString('en-GB', {day: '2-digit', month:'2-digit', year:'numeric'});
        const startTimeString = now.toLocaleTimeString('en-GB',{hour:'2-digit', minute:'2-digit'});

        // Verify that all components are rendered with the correct text
        expect(getByPlaceholderText('Task Name')).toBeTruthy();
        expect(getByText(startDateString)).toBeTruthy();
        expect(getByText(startTimeString)).toBeTruthy();
        expect(getByText('End Date')).toBeTruthy();
        expect(getByText('End Time')).toBeTruthy();
        expect(getByPlaceholderText('Task Notes.....')).toBeTruthy();
        expect(getByText('Groups')).toBeTruthy();
        expect(getByText('Priority Level')).toBeTruthy();
        expect(getByText('Insert Attachment')).toBeTruthy();
        expect(getByText('Add')).toBeTruthy();
    });

    // Test to select start date and time, end date and time and display the updated values
    it('should select start date and time, end date and time and display the updated values', async () => {
        // Mock group and priority services
        getGroupsByCreator.mockResolvedValueOnce(mockGroups);
        getAllPriorities.mockResolvedValueOnce(mockPriorities);

        // Renders the AddTaskScreen component
        const { getByText, getByPlaceholderText, getByTestId } = render(
            <NavigationContainer>
                <AddTaskScreen />
            </NavigationContainer>
        );

        // Change the task name
        fireEvent.changeText(getByPlaceholderText('Task Name'), 'Date Test Task');

        // Get the current date and time
        const now = new Date();
        const nowDateString = now.toLocaleDateString('en-GB', {day: '2-digit', month:'2-digit', year:'numeric'});
        const nowTimeString = now.toLocaleTimeString('en-GB',{hour:'2-digit', minute:'2-digit'});

        // Start date set to one day ago
        const earlierDate = new Date(new Date().getTime() - 86400000 );
        const startDateString = earlierDate.toLocaleDateString('en-GB', {day: '2-digit', month:'2-digit', year:'numeric'});
        const startTimeString = earlierDate.toLocaleTimeString('en-GB',{hour:'2-digit', minute:'2-digit'});

        // End date set to one day later and a few minutes later
        const laterDate = new Date(new Date().getTime() + 86400000 + 300000);
        const endDateString = laterDate.toLocaleDateString('en-GB', {day: '2-digit', month:'2-digit', year:'numeric'});
        const endTimeString = laterDate.toLocaleTimeString('en-GB',{hour:'2-digit', minute:'2-digit'});

        // Press on start date which is usually todays date
        fireEvent.press(getByText(nowDateString));
        // Retrieve the start date picker component
        const startDatePicker = getByTestId('startDatePicker');
        // Simulate changing the start date to an earlier date
        fireEvent(startDatePicker, 'onChange', {type: 'set'}, earlierDate);

        // Press on start time which is usually current time
        fireEvent.press(getByText(nowTimeString));
        // Retrieve the start time picker component
        const startTimePicker = getByTestId('startTimePicker');
        // Simulate changing the start time to an earlier time
        fireEvent(startTimePicker, 'onChange', {type: 'set'}, earlierDate);

        // Press on end date 
        fireEvent.press(getByText('End Date'));
        // Retrieve the end date picker component
        const endDatePicker = getByTestId('endDatePicker');
        // Simulate changing the end date to an later date
        fireEvent(endDatePicker, 'onChange', {type: 'set'}, laterDate);

        // Press on end time which generates the time after selecting the date
        fireEvent.press(getByText(endTimeString));
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
    });

    // Test to successfully create a task and clear the form
    it('should successfully create a task and clear the form', async () => {
        // Mock the successful creation of a task with taskID task1
        createTask.mockResolvedValueOnce('task1');
        // Mock successful attachment creation
        createAttachment.mockResolvedValueOnce(undefined);

        // Mock group and priority services
        getGroupsByCreator.mockResolvedValueOnce(mockGroups);
        getAllPriorities.mockResolvedValueOnce(mockPriorities);
    
        // Renders the AddTaskScreen component
        const { getByText, getByPlaceholderText, getByTestId, queryByText } = render(
            <NavigationContainer>
                <AddTaskScreen />
            </NavigationContainer>
        );
    
        // Change the task name
        fireEvent.changeText(getByPlaceholderText('Task Name'), 'My Task');

        // Press on end date 
        fireEvent.press(getByText('End Date'));

        // Retrieve the end date picker component
        const endDatePicker = getByTestId('endDatePicker');

        // End date set to one day later
        const laterDate = new Date(new Date().getTime() + 86400000); 
        const endDateString = laterDate.toLocaleDateString('en-GB', {day: '2-digit', month:'2-digit', year:'numeric'});

        // Simulate changing the end date to an later date
        fireEvent(endDatePicker, 'onChange', {type: 'set'}, laterDate);
    
        await waitFor(() => {
            // Verify that end date is displayed correctly
            expect(getByText(endDateString)).toBeTruthy();
        });

        // Change the task notes
        fireEvent.changeText(getByPlaceholderText('Task Notes.....'), 'Testing Task Notes.');
    
        // Press on Groups dropdown
        fireEvent.press(getByText('Groups'));
        await waitFor(() => {
            // Verify the groups shown matches the mockGroups
            expect(getByText('Math')).toBeTruthy();
            expect(getByText('General')).toBeTruthy();
        });
        // Press on Math
        fireEvent.press(getByText('Math'));
    
        // Press on Priority Level dropdown
        fireEvent.press(getByText('Priority Level'));
        await waitFor(() => {
            // Verify the priorities shown matches the mockPriorities
            expect(getByText('Urgent')).toBeTruthy();
            expect(getByText('High')).toBeTruthy();
            expect(getByText('Medium')).toBeTruthy();
            expect(getByText('Low')).toBeTruthy();
            expect(getByText('N/A')).toBeTruthy();
        });
        // Press on Urgent
        fireEvent.press(getByText('Urgent'));
    
        // Press on Insert Attachment
        fireEvent.press(getByText('Insert Attachment'));
        await waitFor(() => {
            // Verify the mocked attachment is correct
            expect(getByText('test_attachment.pdf')).toBeTruthy();
        });

        // Press on Add button
        fireEvent.press(getByText('Add'));
    
        await waitFor(() => {
            // Verify createTask was called once
            expect(createTask).toHaveBeenCalledTimes(1);
            // Verify the task creation information
            expect(createTask).toHaveBeenCalledWith(expect.any(Object), {
                task_name: 'My Task',
                created_by: 'temp_user_123',
                start_date: expect.any(Date),
                end_date: expect.any(Date),
                duration: expect.any(Number),
                task_notes: 'Testing Task Notes.',
                group_id: '1',
                priority_id: '1',
                status: false,
                attachments: [],
            });

            // Verify that the createAttachment was called once
            expect(createAttachment).toHaveBeenCalledTimes(1);
            // Verify the attachment creation information
            expect(createAttachment).toHaveBeenCalledWith(expect.any(Object), {
                task_id: 'task1',
                file_name: 'test_attachment.pdf',
                file_type: 'application/pdf',
                uri: 'https://test.com/test_attachment.pdf',
                size: 1024,
                durationMillis: null,
            });
            // Verify the success alert for task creation
            expect(Alert.alert).toHaveBeenCalledWith('Success', 'Task created successfully!');
        });
        
        await waitFor(() => {
            // Verify that the form resets after task creation
            expect(getByPlaceholderText('Task Name').props.value).toBe('');
            expect(getByText('End Date')).toBeTruthy();
            expect(getByText('End Time')).toBeTruthy();
            expect(getByPlaceholderText('Task Notes.....').props.value).toBe('');
            expect(queryByText('test_attachment.pdf')).toBeNull();
            // Verify that goBack was called once
            expect(mockNavigation.goBack).toHaveBeenCalledTimes(1);
        });
    });
    
    // Test to delete an attachment
    it('should delete an attachment', async () => {
        // Mock the successful creation of a task with taskID task1
        createTask.mockResolvedValueOnce('task1');
        // Mock successful attachment creation
        createAttachment.mockResolvedValueOnce(undefined);

        // Mock group and priority services
        getGroupsByCreator.mockResolvedValueOnce(mockGroups);
        getAllPriorities.mockResolvedValueOnce(mockPriorities);
    
        // Renders the AddTaskScreen component
        const { getByText, getByPlaceholderText, getByTestId, queryByText } = render(
            <NavigationContainer>
                <AddTaskScreen />
            </NavigationContainer>
        );
    
        // Change the task name
        fireEvent.changeText(getByPlaceholderText('Task Name'), 'Delete attachment');

        // Press on end date 
        fireEvent.press(getByText('End Date'));

        // Retrieve the end date picker component
        const endDatePicker = getByTestId('endDatePicker');

        // End date set to one day later
        const laterDate = new Date(new Date().getTime() + 86400000); 
        const endDateString = laterDate.toLocaleDateString('en-GB', {day: '2-digit', month:'2-digit', year:'numeric'});

        // Simulate changing the end date to an later date
        fireEvent(endDatePicker, 'onChange', {type: 'set'}, laterDate);
    
        await waitFor(() => {
            // Verify that end date is displayed correctly
            expect(getByText(endDateString)).toBeTruthy();
        });

        // Change the task notes
        fireEvent.changeText(getByPlaceholderText('Task Notes.....'), 'Testing Task Notes.');
    
        // Press on Groups dropdown
        fireEvent.press(getByText('Groups'));
        await waitFor(() => {
            // Verify the groups shown matches the mockGroups
            expect(getByText('Math')).toBeTruthy();
            expect(getByText('General')).toBeTruthy();
        });
        // Press on General
        fireEvent.press(getByText('General'));

        // Press on Insert Attachment
        fireEvent.press(getByText('Insert Attachment'));
        await waitFor(() => {
            // Verify the mocked attachment is correct
            expect(getByText('test_attachment.pdf')).toBeTruthy();
        });

        // Press the delete button for the first attachment
        fireEvent.press(getByTestId('delete-1')); 
        await waitFor(() => {
            // Ensure that the attachment is deleted and not displayed
            expect(queryByText('test_attachment.pdf')).toBeNull();
        });
    });

    // Test to load groups and priorities on mount
    it('should load groups and priorities on mount', async () => {
        // Mock group and priority services
        getGroupsByCreator.mockResolvedValueOnce(mockGroups);
        getAllPriorities.mockResolvedValueOnce(mockPriorities);

        // Renders the AddTaskScreen component
        const { getByText } = render(
            <NavigationContainer>
                <AddTaskScreen />
            </NavigationContainer>
        );

        // Verify Groups and Priority Level is displayed
        expect(getByText('Groups')).toBeTruthy();
        expect(getByText('Priority Level')).toBeTruthy();

        // Press on Groups dropdown
        fireEvent.press(getByText('Groups'));
    
        await waitFor(() => {
            // Verify the groups shown matches the mockGroups
            expect(getByText('Math')).toBeTruthy();
            expect(getByText('General')).toBeTruthy();
        });
        fireEvent.press(getByText('General'));

        // Press on Priority Level dropdown
        fireEvent.press(getByText('Priority Level'));

        await waitFor(() => {
            // Verify the priorities shown matches the mockPriorities
            expect(getByText('Urgent')).toBeTruthy();
            expect(getByText('High')).toBeTruthy();
            expect(getByText('Medium')).toBeTruthy();
            expect(getByText('Low')).toBeTruthy();
            expect(getByText('N/A')).toBeTruthy();
        });
    });

    // Test to show an alert if failed to add task
    it('should show an alert if failed to add task', async () => {
        // Mock task creation error
        createTask.mockRejectedValueOnce(new Error('Failed to create task'));
        
        // Mock group and priority services
        getGroupsByCreator.mockResolvedValueOnce(mockGroups);
        getAllPriorities.mockResolvedValueOnce(mockPriorities);
    
        // Renders the AddTaskScreen component
        const { getByText, getByPlaceholderText, getByTestId } = render(
            <NavigationContainer>
                <AddTaskScreen />
            </NavigationContainer>
        );
    
        // Change the task name
        fireEvent.changeText(getByPlaceholderText('Task Name'), 'My Task');

        // Press on end date 
        fireEvent.press(getByText('End Date'));

        // Retrieve the end date picker component
        const endDatePicker = getByTestId('endDatePicker');

        // End date set to one day later
        const laterDate = new Date(new Date().getTime() + 86400000); 
        const endDateString = laterDate.toLocaleDateString('en-GB', {day: '2-digit', month:'2-digit', year:'numeric'});

        // Simulate changing the end date to an later date
        fireEvent(endDatePicker, 'onChange', {type: 'set'}, laterDate);
    
        await waitFor(() => {
            // Verify that end date is displayed correctly
            expect(getByText(endDateString)).toBeTruthy();
        });

        // Change the task notes
        fireEvent.changeText(getByPlaceholderText('Task Notes.....'), 'Testing Task Notes.');
    
        // Press on Groups dropdown
        fireEvent.press(getByText('Groups'));
        await waitFor(() => {
            // Verify the groups shown matches the mockGroups
            expect(getByText('Math')).toBeTruthy();
            expect(getByText('General')).toBeTruthy();
        });
        // Press on Math
        fireEvent.press(getByText('Math'));
    
        // Press on Add button
        fireEvent.press(getByText('Add'));
    
        await waitFor(() => {
            // Verify createTask was called once
            expect(createTask).toHaveBeenCalledTimes(1);
            // Verify that an error alert is shown to the user when task creation or attachment creation failed
            expect(Alert.alert).toHaveBeenCalledWith('Task Creation Error', 'Failed to create the task or attachments.');
        });
        
    });

    // Test to show an alert if failed to add attachments and delete the task
    it('should show an alert if failed to add attachments and delete the task', async () => {
        // Mock the successful creation of a task with taskID task1
        createTask.mockResolvedValueOnce('task1');
        // Mock deleteTask
        deleteTask.mockResolvedValueOnce(undefined);
        // Mock attachment creation error
        createAttachment.mockRejectedValueOnce(new Error('Failed to create attachment'));

        // Mock group and priority services
        getGroupsByCreator.mockResolvedValueOnce(mockGroups);
        getAllPriorities.mockResolvedValueOnce(mockPriorities);
    
        // Renders the AddTaskScreen component
        const { getByText, getByPlaceholderText, getByTestId } = render(
            <NavigationContainer>
                <AddTaskScreen />
            </NavigationContainer>
        );
    
        // Change the task name
        fireEvent.changeText(getByPlaceholderText('Task Name'), 'My Task');

        // Press on end date 
        fireEvent.press(getByText('End Date'));

        // Retrieve the end date picker component
        const endDatePicker = getByTestId('endDatePicker');

        // End date set to one day later
        const laterDate = new Date(new Date().getTime() + 86400000); 
        const endDateString = laterDate.toLocaleDateString('en-GB', {day: '2-digit', month:'2-digit', year:'numeric'});

        // Simulate changing the end date to an later date
        fireEvent(endDatePicker, 'onChange', {type: 'set'}, laterDate);
    
        await waitFor(() => {
            // Verify that end date is displayed correctly
            expect(getByText(endDateString)).toBeTruthy();
        });

        // Change the task notes
        fireEvent.changeText(getByPlaceholderText('Task Notes.....'), 'Testing Task Notes.');
    
        // Press on Groups dropdown
        fireEvent.press(getByText('Groups'));
        await waitFor(() => {
            // Verify the groups shown matches the mockGroups
            expect(getByText('Math')).toBeTruthy();
            expect(getByText('General')).toBeTruthy();
        });
        // Press on Math
        fireEvent.press(getByText('Math'));
    
        // Press on Priority Level dropdown
        fireEvent.press(getByText('Priority Level'));
        await waitFor(() => {
            // Verify the priorities shown matches the mockPriorities
            expect(getByText('Urgent')).toBeTruthy();
            expect(getByText('High')).toBeTruthy();
            expect(getByText('Medium')).toBeTruthy();
            expect(getByText('Low')).toBeTruthy();
            expect(getByText('N/A')).toBeTruthy();
        });
        // Press on Urgent
        fireEvent.press(getByText('Urgent'));
    
        // Press on Insert Attachment
        fireEvent.press(getByText('Insert Attachment'));
        await waitFor(() => {
            // Verify the mocked attachment is correct
            expect(getByText('test_attachment.pdf')).toBeTruthy();
        });

        // Press on Add button
        fireEvent.press(getByText('Add'));
    
        await waitFor(() => {
            // Verify createTask was called once
            expect(createTask).toHaveBeenCalledTimes(1);
            // Verify that the createAttachment was called once
            expect(createAttachment).toHaveBeenCalledTimes(1);
            // Verify that deleteTask has been called
            expect(deleteTask).toHaveBeenCalledTimes(1);
            // Verify that an error alert is shown to the user when task creation or attachment creation failed
            expect(Alert.alert).toHaveBeenCalledWith('Task Creation Error', 'Failed to create the task or attachments.');
        });
    });

    // Test to show an alert if Task Name is missing
    it('should show an alert if Task Name is missing', async () => {
        // Renders the AddTaskScreen component
        const { getByText } = render(
            <NavigationContainer>
                <AddTaskScreen />
            </NavigationContainer>
        );
    
        // Press on Add button
        fireEvent.press(getByText('Add'));
    
        await waitFor(() => {
            // Verify that an error alert is shown to the user when there is no task name added
            expect(Alert.alert).toHaveBeenCalledWith('Incomplete Task', 'Please enter the Task Name.');
        });
    });
    
    // Test to show an alert if End Date is invalid
    it('should show an alert if End Date is invalid', async () => {
        // Renders the AddTaskScreen component
        const { getByText, getByPlaceholderText } = render(
            <NavigationContainer>
                <AddTaskScreen />
            </NavigationContainer>
        );
    
        // Change the task name
        fireEvent.changeText(getByPlaceholderText('Task Name'), 'My Task');

        // Press on Add button
        fireEvent.press(getByText('Add'));
    
        await waitFor(() => {
            // Verify that an error alert is shown to the user when there is no end date and time added
            expect(Alert.alert).toHaveBeenCalledWith('Incomplete Task', 'Please select an End Date and Time.');
        });
    });

    // Test to show an alert if End Date is on or before Start Date
    it('should show an alert if End Date is on or before Start Date', async () => {
        // Renders the AddTaskScreen component
        const { getByPlaceholderText, getByText, getByTestId } = render(
            <NavigationContainer>
                <AddTaskScreen />
            </NavigationContainer>
        );
        
        // Change the task name
        fireEvent.changeText(getByPlaceholderText('Task Name'), 'My Task');
        
        // Press on end date 
        fireEvent.press(getByText('End Date'));
        
        
        // Set an invalid end date
        const invalidEndDate = new Date('2025-01-19T10:00:00');
        // Retrieve the end date picker component
        const endDatePicker = getByTestId('endDatePicker');
        // Simulate changing the end date to an earlier date
        fireEvent(endDatePicker, 'onChange', {type: 'set'}, invalidEndDate);

        // Press on Add button
        fireEvent.press(getByText('Add'));
        
        await waitFor(() => {
            // Verify that an error alert is shown to the user when end date is earlier than start date
            expect(Alert.alert).toHaveBeenCalledWith('Invalid Date', 'End Date must be on or after the Start Date.');
        });
    });
    

    
    // Test to show an alert if Group is not selected
    it('should show an alert if Group is not selected', async () => {
        // Renders the AddTaskScreen component
        const { getByText, getByPlaceholderText, getByTestId } = render(
            <NavigationContainer>
                <AddTaskScreen />
            </NavigationContainer>
        );
    
        // Change the task name
        fireEvent.changeText(getByPlaceholderText('Task Name'), 'My Task');

        // Press on end date 
        fireEvent.press(getByText('End Date'));

        // Retrieve the end date picker component
        const endDatePicker = getByTestId('endDatePicker');

        // End date set to one day later
        const laterDate = new Date(new Date().getTime() + 86400000); 
        const endDateString = laterDate.toLocaleDateString('en-GB', {day: '2-digit', month:'2-digit', year:'numeric'});

        // Simulate changing the end date to an later date
        fireEvent(endDatePicker, 'onChange', {type: 'set'}, laterDate);
    
        await waitFor(() => {
            // Verify that end date is displayed correctly
            expect(getByText(endDateString)).toBeTruthy();
        });

        // Press on Add button
        fireEvent.press(getByText('Add'));
    
        await waitFor(() => {
            // Verify that an error alert is shown to the user when no group was selected
            expect(Alert.alert).toHaveBeenCalledWith('Incomplete Task', 'Please select a Group.');
        });
    });

    
    // Test to show an alert if loading groups fails
    it('should show an alert if loading groups fails', async () => {
        // Mock loading group error
        getGroupsByCreator.mockRejectedValueOnce(new Error('Groups Initialisation Error'));
        // Mock priority services
        getAllPriorities.mockResolvedValueOnce(mockPriorities);
    
        // Renders the AddTaskScreen component
        render(
            <NavigationContainer>
                <AddTaskScreen />
            </NavigationContainer>
        );
    
        await waitFor(() => {
            // Verify that an error alert is shown to the user when group loading fails
            expect(Alert.alert).toHaveBeenCalledWith('Initialising Error', 'Failed to initialise the screen.');
        });
    });

    // Test to show an alert if loading priority levels fails
    it('should show an alert if loading priority levels fails', async () => {
        // Mock groups services
        getGroupsByCreator.mockResolvedValueOnce(mockGroups);
        // Mock loading priorities error
        getAllPriorities.mockRejectedValueOnce(new Error('Priority Levels Initialisation Error'));
    
        // Renders the AddTaskScreen component
        render(
            <NavigationContainer>
                <AddTaskScreen />
            </NavigationContainer>
        );
    
        await waitFor(() => {
            // Verify that an error alert is shown to the user when priorities loading fails
            expect(Alert.alert).toHaveBeenCalledWith('Initialising Error', 'Failed to initialise the screen.');
        });
    });

    // Snapshot Test Group
    describe('Snapshot Tests', () => {
        // Fixed date for snapshot consistency
        const fixed_date = new Date('2025-01-01T12:00:00Z'); 
    
        beforeEach(() => {
            // Mock Date using Jest's Fake Timers
            jest.useFakeTimers('modern');
            jest.setSystemTime(fixed_date);
        });
    
        afterEach(() => {
            // Restore real timers after snapshot tests
            jest.useRealTimers();
        });
    
        // Snapshot test for AddTaskScreen
        it('should match the snapshot', () => {
            // Renders the AddTaskScreen component
            const { toJSON } = render(
                <NavigationContainer>
                    <AddTaskScreen />
                </NavigationContainer>
            );
    
            // Verify snapshot matches
            expect(toJSON()).toMatchSnapshot();
        });
    });
});