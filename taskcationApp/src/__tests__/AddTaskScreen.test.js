import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AddTaskScreen from '../screens/AddTaskScreen';
import { createTask } from '../services/taskService';
import { createAttachment } from '../services/attachmentService';
import { getGroupsByCreator } from '../services/groupsService';
import { getAllPriorities } from '../services/priorityLevelsService';
import { Alert } from 'react-native'; 



const mockGroups = [
    { id: '1', group_name: 'Math', group_type: 'Subjects', created_by: 'temp_user_123' },
    { id: '2', group_name: 'General', group_type: 'Categories', created_by: 'temp_user_123' },
];

const mockPriorities = [
    { id: '1', priority_name: 'Urgent' },
    { id: '2', priority_name: 'High' },
    { id: '3', priority_name: 'Medium' },
    { id: '4', priority_name: 'Low' },
    { id: '5', priority_name: 'N/A' },
];

jest.spyOn(Alert, 'alert').mockImplementation(() => {});

// Mock AddAttachments Component
jest.mock('../components/AddAttachments', () => {
    const React = require('react');
    const { TouchableOpacity, Text } = require('react-native');
    return ({ onAttachmentsChange }) => (
        <TouchableOpacity
            testID="insert-attachment-button"
            onPress={() => {
                // Simulate adding an attachment
                const newAttachment = {
                    id: '1',
                    file_name: 'test_attachment.pdf',
                    file_type: 'application/pdf',
                    uri: 'mock-uri',
                    size: 1024,
                };
                onAttachmentsChange([newAttachment]);
            }}
        >
            <Text>Insert Attachment</Text>
        </TouchableOpacity>
    );
});

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

describe('AddTaskScreen', () => {
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
        AsyncStorage.getItem.mockImplementation(async (key) => {
            if (key === 'user_id') {
                return 'temp_user_123';
            }
            if (key === 'joined_date') {
                return '2025-01-20T00:00:00Z';
            }
            return null;
        });
    });

    it('renders the Add Task screen with all components', async () => {
        const { getByPlaceholderText, getByText } = render(
            <NavigationContainer>
                <AddTaskScreen />
            </NavigationContainer>
        );

        const now = new Date();
        const startDateString = now.toLocaleDateString('en-GB', {day: '2-digit', month:'2-digit', year:'numeric'});
        const startTimeString = now.toLocaleTimeString('en-GB',{hour:'2-digit', minute:'2-digit'});

        // Verify presence of input and buttons
        expect(getByPlaceholderText('Task Name')).toBeTruthy();
        expect(getByText(startDateString)).toBeTruthy();
        expect(getByText(startTimeString)).toBeTruthy();
        expect(getByText('End Date')).toBeTruthy();
        expect(getByText('End Time')).toBeTruthy();
        expect(getByText('Groups')).toBeTruthy();
        expect(getByText('Priority Level')).toBeTruthy();
        expect(getByText('Insert Attachment')).toBeTruthy();
        expect(getByText('Add')).toBeTruthy();
    });

    it('selects start date and time, end date and time and displays the updated values', async () => {
        // Arrange
        getGroupsByCreator.mockResolvedValueOnce(mockGroups);
        getAllPriorities.mockResolvedValueOnce(mockPriorities);

        const { getByText, getByPlaceholderText, getByTestId } = render(
            <NavigationContainer>
                <AddTaskScreen />
            </NavigationContainer>
        );

        // Change Task Name
        fireEvent.changeText(getByPlaceholderText('Task Name'), 'Date Test Task');

        const now = new Date();
        const startDateString = now.toLocaleDateString('en-GB', {day: '2-digit', month:'2-digit', year:'numeric'});
        const startTimeString = now.toLocaleTimeString('en-GB',{hour:'2-digit', minute:'2-digit'});

        const laterDate = new Date(new Date().getTime() + 86400000 + 300000);
        const endDateString = laterDate.toLocaleDateString('en-GB', {day: '2-digit', month:'2-digit', year:'numeric'});
        const endTimeString = laterDate.toLocaleTimeString('en-GB',{hour:'2-digit', minute:'2-digit'});

        fireEvent.press(getByText(startDateString));
        const startDatePicker = getByTestId('startDatePicker');
        fireEvent(startDatePicker, 'onChange', {type: 'set'}, now);

        fireEvent.press(getByText(startTimeString));
        const startTimePicker = getByTestId('startTimePicker');
        fireEvent(startTimePicker, 'onChange', {type: 'set'}, now);

        fireEvent.press(getByText('End Date'));
        const endDatePicker = getByTestId('endDatePicker');
        fireEvent(endDatePicker, 'onChange', {type: 'set'}, laterDate);

        fireEvent.press(getByText(endTimeString));
        const endTimePicker = getByTestId('endTimePicker');
        fireEvent(endTimePicker, 'onChange', {type: 'set'}, laterDate);
    
        await waitFor(() => {
            expect(getByText(startDateString)).toBeTruthy();
            expect(getByText(startTimeString)).toBeTruthy();
            expect(getByText(endDateString)).toBeTruthy();
            expect(getByText(endTimeString)).toBeTruthy();
        });
    });

    it('successfully creates a task and clears the form', async () => {
        createTask.mockResolvedValueOnce('12345');
        createAttachment.mockResolvedValueOnce(undefined);
        getGroupsByCreator.mockResolvedValueOnce(mockGroups);
        getAllPriorities.mockResolvedValueOnce(mockPriorities);
    
        const { getByText, getByPlaceholderText, getByTestId, queryByText } = render(
            <NavigationContainer>
                <AddTaskScreen />
            </NavigationContainer>
        );
    
        fireEvent.changeText(getByPlaceholderText('Task Name'), 'My Task');

        fireEvent.press(getByText('End Date'));

        // Get the actual endDatePicker component
        const endDatePicker = getByTestId('endDatePicker');

        const laterDate = new Date(new Date().getTime() + 86400000); // 1 day
        const endDateString = laterDate.toLocaleDateString('en-GB', {day: '2-digit', month:'2-digit', year:'numeric'});

        fireEvent(endDatePicker, 'onChange', {type: 'set'}, laterDate);
    
        await waitFor(() => {
            expect(getByText(endDateString)).toBeTruthy();
        });

        fireEvent.changeText(getByPlaceholderText('Task Notes.....'), 'Testing Task Notes.');
    
        fireEvent.press(getByText('Groups'));
        await waitFor(() => {
            expect(getByText('Math')).toBeTruthy();
            expect(getByText('General')).toBeTruthy();
        });
        fireEvent.press(getByText('Math'));
    
        fireEvent.press(getByText('Priority Level'));
        await waitFor(() => {
            expect(getByText('Urgent')).toBeTruthy();
            expect(getByText('High')).toBeTruthy();
            expect(getByText('Medium')).toBeTruthy();
            expect(getByText('Low')).toBeTruthy();
            expect(getByText('N/A')).toBeTruthy();
        });
        fireEvent.press(getByText('Urgent'));
    
        fireEvent.press(getByText('Insert Attachment')); // 'Insert Attachment' button from mocked AddAttachments
        await waitFor(() => {
            expect(getByText('test_attachment.pdf')).toBeTruthy();
        });

        fireEvent.press(getByText('Add'));
    
        await waitFor(() => {
            expect(createTask).toHaveBeenCalledTimes(1);
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
            expect(createAttachment).toHaveBeenCalledTimes(1);
            expect(createAttachment).toHaveBeenCalledWith(expect.any(Object), {
                task_id: '12345',
                file_name: 'test_attachment.pdf',
                file_type: 'application/pdf',
                uri: 'mock-uri',
                size: 1024,
                durationMillis: null,
            });
            expect(Alert.alert).toHaveBeenCalledWith('Success', 'Task created successfully!');
        });
        
        await waitFor(() => {
            expect(getByPlaceholderText('Task Name').props.value).toBe('');
            expect(getByText('End Date')).toBeTruthy();
            expect(getByText('End Time')).toBeTruthy();
            expect(getByPlaceholderText('Task Notes.....').props.value).toBe('');
            expect(queryByText('test_attachment.pdf')).toBeNull();
        });
    });
    
    it('allows deleting an attachment', async () => {
        createTask.mockResolvedValueOnce('12345');
        createAttachment.mockResolvedValueOnce(undefined);
        getGroupsByCreator.mockResolvedValueOnce(mockGroups);
        getAllPriorities.mockResolvedValueOnce(mockPriorities);
    
        const { getByText, getByPlaceholderText, getByTestId, queryByText } = render(
            <NavigationContainer>
                <AddTaskScreen />
            </NavigationContainer>
        );
    
        fireEvent.changeText(getByPlaceholderText('Task Name'), 'My Task');

        fireEvent.press(getByText('End Date'));

        // Get the actual endDatePicker component
        const endDatePicker = getByTestId('endDatePicker');

        const laterDate = new Date(new Date().getTime() + 86400000); // 1 day
        const endDateString = laterDate.toLocaleDateString('en-GB', {day: '2-digit', month:'2-digit', year:'numeric'});

        fireEvent(endDatePicker, 'onChange', {type: 'set'}, laterDate);
    
        await waitFor(() => {
            expect(getByText(endDateString)).toBeTruthy();
        });

        fireEvent.changeText(getByPlaceholderText('Task Notes.....'), 'Testing Task Notes.');
    
        fireEvent.press(getByText('Groups'));
        await waitFor(() => {
            expect(getByText('Math')).toBeTruthy();
            expect(getByText('General')).toBeTruthy();
        });
        fireEvent.press(getByText('General'));

        fireEvent.press(getByText('Insert Attachment')); // 'Insert Attachment' button from mocked AddAttachments
        await waitFor(() => {
            expect(getByText('test_attachment.pdf')).toBeTruthy();
        });

        // Delete Attachment
        fireEvent.press(getByTestId('delete-1')); // Press the 'Delete' button for the attachment
        await waitFor(() => {
            expect(queryByText('test_attachment.pdf')).toBeNull();
        });
    });

    it('loads groups and priorities on mount', async () => {
        getGroupsByCreator.mockResolvedValueOnce(mockGroups);
        getAllPriorities.mockResolvedValueOnce(mockPriorities);

        const { getByText } = render(
            <NavigationContainer>
                <AddTaskScreen />
            </NavigationContainer>
        );

        expect(getByText('Groups')).toBeTruthy();
        expect(getByText('Priority Level')).toBeTruthy();
        fireEvent.press(getByText('Groups'));
    
        // Wait for groups and priorities to load
        await waitFor(() => {
            expect(getByText('Math')).toBeTruthy();
            expect(getByText('General')).toBeTruthy();
        });
        fireEvent.press(getByText('General'));

        fireEvent.press(getByText('Priority Level'));

        await waitFor(() => {
            expect(getByText('Urgent')).toBeTruthy();
            expect(getByText('High')).toBeTruthy();
            expect(getByText('Medium')).toBeTruthy();
            expect(getByText('Low')).toBeTruthy();
            expect(getByText('N/A')).toBeTruthy();
        });
    });

    it('shows an alert if failed to add task', async () => {
        // Arrange
        createTask.mockRejectedValueOnce(new Error('Failed to create task'));
        getGroupsByCreator.mockResolvedValueOnce(mockGroups);
        getAllPriorities.mockResolvedValueOnce(mockPriorities);
    
        const { getByText, getByPlaceholderText, getByTestId } = render(
            <NavigationContainer>
                <AddTaskScreen />
            </NavigationContainer>
        );
    
        // Change Task Name
        fireEvent.changeText(getByPlaceholderText('Task Name'), 'My Task');
    
        
        // Select End Date
        fireEvent.press(getByText('End Date'));
        // Get the actual endDatePicker component
        const endDatePicker = getByTestId('endDatePicker');

        const laterDate = new Date(new Date().getTime() + 86400000); // 1 day earlier
        const endDateString = laterDate.toLocaleDateString('en-GB', {day: '2-digit', month:'2-digit', year:'numeric'});
        
        fireEvent(endDatePicker, 'onChange', {type: 'set'}, laterDate);
    
        await waitFor(() => {
            expect(getByText(endDateString)).toBeTruthy();
        });

        // Select Group
        fireEvent.press(getByText('Groups'));
        await waitFor(() => {
            expect(getByText('Math')).toBeTruthy();
            expect(getByText('General')).toBeTruthy();
        });

        fireEvent.press(getByText('Math'));
    
        // Press 'Add' to create the task
        fireEvent.press(getByText('Add'));
    
        // Assert that createTask was called and error alert is shown
        await waitFor(() => {
            expect(createTask).toHaveBeenCalledTimes(1);
            expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to create the task or attachments.');
        });
        
    });

    it('shows an alert if failed to add attachments', async () => {
        // Arrange
        createTask.mockResolvedValueOnce('12345');
        createAttachment.mockRejectedValueOnce(new Error('Failed to create attachment'));
        getGroupsByCreator.mockResolvedValueOnce(mockGroups);
        getAllPriorities.mockResolvedValueOnce(mockPriorities);
    
        const { getByText, getByPlaceholderText, getByTestId } = render(
            <NavigationContainer>
                <AddTaskScreen />
            </NavigationContainer>
        );
    
        // Change Task Name
        fireEvent.changeText(getByPlaceholderText('Task Name'), 'My Task');
    
        // Select End Date
        fireEvent.press(getByText('End Date'));
        // Get the actual endDatePicker component
        const endDatePicker = getByTestId('endDatePicker');

        const laterDate = new Date(new Date().getTime() + 86400000); // 1 day earlier
        const endDateString = laterDate.toLocaleDateString('en-GB', {day: '2-digit', month:'2-digit', year:'numeric'});
        
        fireEvent(endDatePicker, 'onChange', {type: 'set'}, laterDate);
    
        await waitFor(() => {
            expect(getByText(endDateString)).toBeTruthy();
        });

        // Select Group
        fireEvent.press(getByText('Groups'));
        await waitFor(() => {
            expect(getByText('Math')).toBeTruthy();
            expect(getByText('General')).toBeTruthy();
        });

        fireEvent.press(getByText('General'));
        
    
        // Select Priority Level
        fireEvent.press(getByText('Priority Level'));
        await waitFor(() => {
            expect(getByText('Urgent')).toBeTruthy();
            expect(getByText('High')).toBeTruthy();
            expect(getByText('Medium')).toBeTruthy();
            expect(getByText('Low')).toBeTruthy();
            expect(getByText('N/A')).toBeTruthy();
        });
        fireEvent.press(getByText('Urgent'));

        // Insert Attachment
        fireEvent.press(getByText('Insert Attachment')); // 'Insert Attachment' button from mocked AddAttachments
        await waitFor(() => {
            expect(getByText('test_attachment.pdf')).toBeTruthy();
        });
    
        // Press 'Add' to create the task
        fireEvent.press(getByText('Add'));
    
        // Assert that createTask and createAttachment were called, and error alert is shown
        await waitFor(() => {
            expect(createTask).toHaveBeenCalledTimes(1);
            expect(createAttachment).toHaveBeenCalledTimes(1);
            expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to create the task or attachments.');
        });
    });

    it('shows an alert if Task Name is missing', async () => {
        const { getByText } = render(
            <NavigationContainer>
                <AddTaskScreen />
            </NavigationContainer>
        );
    
        fireEvent.press(getByText('Add'));
    
        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Incomplete Task', 'Please enter the Task Name.');
        });
    });
    
    it('shows an alert if End Date is invalid', async () => {
        getGroupsByCreator.mockResolvedValueOnce(mockGroups);
        const { getByText, getByPlaceholderText } = render(
            <NavigationContainer>
                <AddTaskScreen />
            </NavigationContainer>
        );
    
        fireEvent.changeText(getByPlaceholderText('Task Name'), 'My Task');

        fireEvent.press(getByText('Add'));
    
        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Incomplete Task', 'Please select an End Date and Time.');
        });
    });

    it('shows an alert if End Date is on or before Start Date', async () => {
        // Mock groups so we can select one
        getGroupsByCreator.mockResolvedValueOnce(mockGroups);
        
        // Render
        const { getByPlaceholderText, getByText, getByTestId } = render(
            <NavigationContainer>
                <AddTaskScreen />
            </NavigationContainer>
        );
        
        // Set the task name
        fireEvent.changeText(getByPlaceholderText('Task Name'), 'Date Test Task');
        
        
        // Press 'End Date' to open the DateTimePicker
        fireEvent.press(getByText('End Date'));
        
        // Get the actual endDatePicker component
        const endDatePicker = getByTestId('endDatePicker');

        const earlierDate = new Date(new Date().getTime() - 86400000); // 1 day earlier
        const endDateString = earlierDate.toLocaleDateString('en-GB', {day: '2-digit', month:'2-digit', year:'numeric'});
        
        fireEvent(endDatePicker, 'onChange', {type: 'set'}, earlierDate);

        await waitFor(() => {
            expect(getByText(endDateString)).toBeTruthy();
        });

        fireEvent.press(getByText('Add'));
        
        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith(
                'Invalid Date',
                'End Date must be on or after the Start Date.'
            );
        });
    });
    

    
    it('shows an alert if Group is not selected', async () => {
        const { getByText, getByPlaceholderText, getByTestId } = render(
            <NavigationContainer>
                <AddTaskScreen />
            </NavigationContainer>
        );
    
        fireEvent.changeText(getByPlaceholderText('Task Name'), 'My Task');

        fireEvent.press(getByText('End Date'));

        // Get the actual endDatePicker component
        const endDatePicker = getByTestId('endDatePicker');

        const laterDate = new Date(new Date().getTime() + 86400000); // 1 day
        const endDateString = laterDate.toLocaleDateString('en-GB', {day: '2-digit', month:'2-digit', year:'numeric'});
        
        fireEvent(endDatePicker, 'onChange', {type: 'set'}, laterDate);

        await waitFor(() => {
            expect(getByText(endDateString)).toBeTruthy();
        });
        // Now we skip selecting a group => triggers "Please select a Group"
        fireEvent.press(getByText('Add'));
    
        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith(
                'Incomplete Task',
                'Please select a Group.'
            );
        });
    });

    
    it('shows an alert if loading groups fails', async () => {
        getGroupsByCreator.mockRejectedValueOnce(new Error('Groups Initialisation Error'));
        getAllPriorities.mockResolvedValueOnce(mockPriorities);
    
        const { getByText } = render(
            <NavigationContainer>
                <AddTaskScreen />
            </NavigationContainer>
        );
    
        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to initialise the screen.');
        });
    });

    it('shows an alert if loading priority levels fails', async () => {
        getGroupsByCreator.mockResolvedValueOnce(mockGroups);
        getAllPriorities.mockRejectedValueOnce(new Error('Priority Levels Initialisation Error'));
    
        const { getByText } = render(
            <NavigationContainer>
                <AddTaskScreen />
            </NavigationContainer>
        );
    
        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to initialise the screen.');
        });
    });

    // Snapshot Test Group
    describe('Snapshot Tests', () => {
        const FIXED_DATE = new Date('2025-01-01T12:00:00Z'); // Fixed date for snapshot consistency
    
        beforeEach(() => {
            // Mock Date using Jest's Fake Timers
            jest.useFakeTimers('modern');
            jest.setSystemTime(FIXED_DATE);
        });
    
        afterEach(() => {
            // Restore real timers after snapshot tests
            jest.useRealTimers();
        });
    
        it('should match the snapshot', () => {
            const { toJSON } = render(
                <NavigationContainer>
                    <AddTaskScreen />
                </NavigationContainer>
            );
    
            // Snapshot test for consistent rendering
            expect(toJSON()).toMatchSnapshot();
        });
    });
});