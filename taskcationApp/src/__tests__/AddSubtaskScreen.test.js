// Import dependencies and libraries used for testing Add Subtask Screen
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AddSubtaskScreen from '../screens/AddSubtaskScreen';
import { createSubtask, deleteSubtask } from '../services/subtaskService';
import { getAllPriorities } from '../services/priorityLevelsService';
import { createAttachment } from '../services/attachmentService';
import { Alert } from 'react-native'; 


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
        useRoute: () => ({ params: {taskID: 'task1', task_name:'Test Subtask'}}),
        useFocusEffect: () => {},
    };
});

describe('AddSubtaskScreen', () => {
    // Clear all mocks and reset them before each test
    beforeEach(() => {
        createSubtask.mockClear();
        createSubtask.mockReset();
        createAttachment.mockClear();
        createAttachment.mockReset();
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

    // Test to render the Add Subtask screen with all components
    it('should render the Add Subtask screen with all components', async () => {
        // Renders the AddSubtaskScreen component
        const { getByPlaceholderText, getByText } = render(
            <NavigationContainer>
                <AddSubtaskScreen />
            </NavigationContainer>
        );

        // Get the current date and time
        const now = new Date();
        const startDateString = now.toLocaleDateString('en-GB', {day: '2-digit', month:'2-digit', year:'numeric'});
        const startTimeString = now.toLocaleTimeString('en-GB',{hour:'2-digit', minute:'2-digit'});

        // Verify that all components are rendered with the correct text
        expect(getByPlaceholderText('Subtask Name')).toBeTruthy();
        expect(getByText(startDateString)).toBeTruthy();
        expect(getByText(startTimeString)).toBeTruthy();
        expect(getByText('End Date')).toBeTruthy();
        expect(getByText('End Time')).toBeTruthy();
        expect(getByPlaceholderText('Subtask Notes.....')).toBeTruthy();
        expect(getByText('Priority Level')).toBeTruthy();
        expect(getByText('Insert Attachment')).toBeTruthy();
        expect(getByText('Add')).toBeTruthy();
    });

    // Test to select start date and time, end date and time and display the updated values
    it('should select start date and time, end date and time and display the updated values', async () => {
        // Renders the AddSubtaskScreen component
        const { getByText, getByPlaceholderText, getByTestId } = render(
            <NavigationContainer>
                <AddSubtaskScreen />
            </NavigationContainer>
        );

        // Change the subtask name
        fireEvent.changeText(getByPlaceholderText('Subtask Name'), 'Date Test Subtask');

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

    // Test to successfully create a subtask and clear the form
    it('should successfully create a subtask and clear the form', async () => {
        // Mock the successful creation of a subtask with subtask ID subtask1
        createSubtask.mockResolvedValueOnce('subtask1');
        // Mock successful attachment creation
        createAttachment.mockResolvedValueOnce(undefined);
        // Mock priority services
        getAllPriorities.mockResolvedValueOnce(mockPriorities);

        // Renders the AddSubtaskScreen component
        const { getByText, getByPlaceholderText, getByTestId, queryByText } = render(
            <NavigationContainer>
                <AddSubtaskScreen />
            </NavigationContainer>
        );
    
        // Change the subtask name
        fireEvent.changeText(getByPlaceholderText('Subtask Name'), 'My Subtask');

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

        // Change the subtask notes
        fireEvent.changeText(getByPlaceholderText('Subtask Notes.....'), 'Testing Subtask Notes.');
    
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
            // Verify createSubtask was called once
            expect(createSubtask).toHaveBeenCalledTimes(1);
            // Verify the subtask creation information
            expect(createSubtask).toHaveBeenCalledWith(expect.any(Object), {
                subtask_name: 'My Subtask',
                task_id: 'task1',
                task_name: 'Test Subtask',
                created_by: 'temp_user_123',
                start_date: expect.any(Date),
                end_date: expect.any(Date),
                duration: expect.any(Number),
                subtask_notes: 'Testing Subtask Notes.',
                priority_id: '1',
                status: false,
                attachments: [],
            });

            // Verify that the createAttachment was called once
            expect(createAttachment).toHaveBeenCalledTimes(1);
            // Verify the attachment creation information
            expect(createAttachment).toHaveBeenCalledWith(expect.any(Object), {
                task_id: 'task1',
                subtask_id: 'subtask1',
                file_name: 'test_attachment.pdf',
                file_type: 'application/pdf',
                uri: 'https://test.com/test_attachment.pdf',
                size: 1024,
                durationMillis: null,
            });
            // Verify the success alert for subtask creation
            expect(Alert.alert).toHaveBeenCalledWith('Success', 'Subtask created successfully!');
        });
        
        await waitFor(() => {
            // Verify that the form resets after subtask creation
            expect(getByPlaceholderText('Subtask Name').props.value).toBe('');
            expect(getByText('End Date')).toBeTruthy();
            expect(getByText('End Time')).toBeTruthy();
            expect(getByPlaceholderText('Subtask Notes.....').props.value).toBe('');
            expect(queryByText('test_attachment.pdf')).toBeNull();
            // Verify that goBack was called once
            expect(mockNavigation.goBack).toHaveBeenCalledTimes(1);
        });
    });

    // Test to delete an attachment
    it('should delete an attachment', async () => {
        // Mock the successful creation of a subtask with subtask ID subtask1
        createSubtask.mockResolvedValueOnce('subtask1');
        // Mock successful attachment creation
        createAttachment.mockResolvedValueOnce(undefined);
    
        // Renders the AddSubtaskScreen component
        const { getByText, getByPlaceholderText, getByTestId, queryByText } = render(
            <NavigationContainer>
                <AddSubtaskScreen />
            </NavigationContainer>
        );
    
        // Change the subtask name
        fireEvent.changeText(getByPlaceholderText('Subtask Name'), 'Date Test Subtask');

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

        // Change the subtask notes
        fireEvent.changeText(getByPlaceholderText('Subtask Notes.....'), 'Testing Subtask Notes.');

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

    // Test to load priorities on mount
    it('should load priorities on mount', async () => {
        // Mock priority services
        getAllPriorities.mockResolvedValueOnce(mockPriorities);
        
        // Renders the AddSubtaskScreen component
        const { getByText } = render(
            <NavigationContainer>
                <AddSubtaskScreen />
            </NavigationContainer>
        );

        // Verify Priority Level is displayed
        expect(getByText('Priority Level')).toBeTruthy();

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

    // Test to show an alert if failed to add subtask
    it('should show an alert if failed to add subtask', async () => {
        // Mock subtask creation error
        createSubtask.mockRejectedValueOnce(new Error('Failed to create subtask'));
    
        // Renders the AddSubtaskScreen component
        const { getByText, getByPlaceholderText, getByTestId } = render(
            <NavigationContainer>
                <AddSubtaskScreen />
            </NavigationContainer>
        );
    
        // Change the subtask name
        fireEvent.changeText(getByPlaceholderText('Subtask Name'), 'My Subtask');

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

        // Change the subtask notes
        fireEvent.changeText(getByPlaceholderText('Subtask Notes.....'), 'Testing Subtask Notes.');

        // Press on Add button
        fireEvent.press(getByText('Add'));
    
        await waitFor(() => {
            // Verify createSubtask was called once
            expect(createSubtask).toHaveBeenCalledTimes(1);
            // Verify that an error alert is shown to the user when subtask creation or attachment creation failed
            expect(Alert.alert).toHaveBeenCalledWith('Subtask Creation Error', 'Failed to create the subtask or attachments.');
        });
        
    });

    // Test to show an alert if failed to add attachments and delete the subtask
    it('should show an alert if failed to add attachments and delete the subtask', async () => {
        // Mock the successful creation of a subtask with subtask ID subtask1
        createSubtask.mockResolvedValueOnce('subtask1');
        // Mock deleteSubtask
        deleteSubtask.mockResolvedValueOnce(undefined);
        // Mock attachment creation error
        createAttachment.mockRejectedValueOnce(new Error('Failed to create attachment'));
        // Mock priority services
        getAllPriorities.mockResolvedValueOnce(mockPriorities);

        // Renders the AddSubtaskScreen component
        const { getByText, getByPlaceholderText, getByTestId } = render(
            <NavigationContainer>
                <AddSubtaskScreen />
            </NavigationContainer>
        );
    
        // Change the subtask name
        fireEvent.changeText(getByPlaceholderText('Subtask Name'), 'My Subtask');

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

        // Change the subtask notes
        fireEvent.changeText(getByPlaceholderText('Subtask Notes.....'), 'Testing Subtask Notes.');
    
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
            // Verify createSubtask was called once
            expect(createSubtask).toHaveBeenCalledTimes(1);
            // Verify that the createAttachment was called once
            expect(createAttachment).toHaveBeenCalledTimes(1);
            // Verify that deleteSubtask has been called
            expect(deleteSubtask).toHaveBeenCalledTimes(1);
            // Verify that an error alert is shown to the user when subtask creation or attachment creation failed
            expect(Alert.alert).toHaveBeenCalledWith('Subtask Creation Error', 'Failed to create the subtask or attachments.');
        });
    });

    // Test to show an alert if Subtask Name is missing
    it('should show an alert if Subtask Name is missing', async () => {
        // Renders the AddSubtaskScreen component
        const { getByText } = render(
            <NavigationContainer>
                <AddSubtaskScreen />
            </NavigationContainer>
        );
    
        // Press on Add button
        fireEvent.press(getByText('Add'));
    
        await waitFor(() => {
            // Verify that an error alert is shown to the user when there is no subtask name added
            expect(Alert.alert).toHaveBeenCalledWith('Incomplete Subtask', 'Please enter the Subtask Name.');
        });
    });
    
    // Test to show an alert if End Date is invalid
    it('should show an alert if End Date is invalid', async () => {
        // Renders the AddSubtaskScreen component
        const { getByText, getByPlaceholderText } = render(
            <NavigationContainer>
                <AddSubtaskScreen />
            </NavigationContainer>
        );
    
        // Change the subtask name
        fireEvent.changeText(getByPlaceholderText('Subtask Name'), 'My Subtask');

        // Press on Add button
        fireEvent.press(getByText('Add'));
    
        await waitFor(() => {
            // Verify that an error alert is shown to the user when there is no end date and time added
            expect(Alert.alert).toHaveBeenCalledWith('Incomplete Subtask', 'Please select an End Date and Time.');
        });
    });

    // Test to show an alert if End Date is on or before Start Date
    it('should show an alert if End Date is on or before Start Date', async () => {
        // Renders the AddSubtaskScreen component
        const { getByPlaceholderText, getByText, getByTestId } = render(
            <NavigationContainer>
                <AddSubtaskScreen />
            </NavigationContainer>
        );
        
        // Change the subtask name
        fireEvent.changeText(getByPlaceholderText('Subtask Name'), 'My Subtask');
        
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

    // Test to show an alert if loading priority levels fails
    it('should show an alert if loading priority levels fails', async () => {
        // Mock loading priorities error
        getAllPriorities.mockRejectedValueOnce(new Error('Priority Levels Initialisation Error'));
    
        // Renders the AddSubtaskScreen component
        render(
            <NavigationContainer>
                <AddSubtaskScreen />
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
    
        // Snapshot test for AddSubtaskScreen
        it('should match the snapshot', () => {
            // Renders the AddSubtaskScreen component
            const { toJSON } = render(
                <NavigationContainer>
                    <AddSubtaskScreen />
                </NavigationContainer>
            );
    
            // Verify snapshot matches
            expect(toJSON()).toMatchSnapshot();
        });
    });

});