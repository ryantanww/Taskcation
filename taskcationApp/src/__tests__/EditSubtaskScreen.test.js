// Import dependencies and libraries used for testing Edit Subtask Screen
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EditSubtaskScreen from '../screens/EditSubtaskScreen';
import { getSubtaskByID, updateSubtask } from '../services/subtaskService';
import { getAllPriorities } from '../services/priorityLevelsService';
import { getAttachmentsBySubtaskID, createAttachment, deleteAttachment } from '../services/attachmentService';
import { suggestDatePriority } from '../utils/suggestPriority';
import { Alert } from 'react-native';

// Mock subtask for the test
const mockSubtask = {
    id: 'subtask1',
    subtask_name: 'Test Edit Subtask',
    start_date: new Date('2025-01-01T10:00:00'),
    end_date: new Date('2025-01-06T12:00:00'),
    duration: 439200000,
    subtask_notes: 'Test notes.',
    task_name: 'Test Task',
    task_id: 'task1',
    priority_id: '1',
    status: false,
};

// Mock attachment for the test
const mockAttachments = [
    { id: '1', uri: 'https://test.com/test_attachment.pdf', file_name: 'test_attachment.pdf', file_type: 'application/pdf',},
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
        useRoute: () => ({ params: { subtaskID: 'subtask1' } }),
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



describe('EditSubtaskScreen', () => {
    // Clear all mocks and reset them before each test
    beforeEach(() => {
        getSubtaskByID.mockClear();
        getSubtaskByID.mockReset();
        updateSubtask.mockClear();
        updateSubtask.mockReset();
        createAttachment.mockClear();
        createAttachment.mockReset();
        getAttachmentsBySubtaskID.mockClear();
        getAttachmentsBySubtaskID.mockReset();
        getAllPriorities.mockClear();
        getAllPriorities.mockReset();
        suggestDatePriority.mockClear();
        suggestDatePriority.mockReset();
        jest.clearAllMocks();
        // Spy on Alert.alert to verify alerts
        jest.spyOn(Alert, 'alert').mockImplementation(() => {});
        // Spy on console to verify errors
        jest.spyOn(console, 'error').mockImplementation(() => {});
        // Intialise the AsyncStorage with user_id and joined_date
        AsyncStorage.getItem.mockImplementation(async (key) => {
            if (key === 'user_id') {
                return 'temp_user_123';
            }
            return null;
        });
        // Mock the required services
        getSubtaskByID.mockResolvedValue(mockSubtask);
        getAttachmentsBySubtaskID.mockResolvedValue(mockAttachments);
        getAllPriorities.mockResolvedValue(mockPriorities);
    });

    // Test to render the Edit Subtask screen with all components
    it('should render the Edit Subtask screen with all components', async () => {
        // Renders the EditSubtaskScreen component
        const { getByText, getByDisplayValue } = render(
            <NavigationContainer>
                <EditSubtaskScreen route={{ params: { subtaskID: 'subtask1' } }} />
            </NavigationContainer>
        );

        await waitFor(() => {
            // Verify that all component are rendered with the correct text
            expect(getByText('Edit Subtask')).toBeTruthy();
            expect(getByDisplayValue('Test Edit Subtask')).toBeTruthy();
            expect(getByText('01/01/2025')).toBeTruthy();
            expect(getByText('10:00')).toBeTruthy();
            expect(getByText('06/01/2025')).toBeTruthy();
            expect(getByText('12:00')).toBeTruthy();
            expect(getByDisplayValue('Test notes.')).toBeTruthy();
            expect(getByText('Urgent')).toBeTruthy();
            expect(getByText('Insert Attachment')).toBeTruthy();
            expect(getByText('test_attachment.pdf')).toBeTruthy();
            expect(getByText('Update')).toBeTruthy();
        });
    });

    // Test to successfully update the subtask, delete and insert new attachments
    it('should update the subtask successfully, delete and insert new attachments', async () => {
        // Mock successful service for updateSubtask, createAttachment, and deleteAttachment
        updateSubtask.mockResolvedValueOnce(undefined);
        createAttachment.mockResolvedValueOnce(undefined);
        deleteAttachment.mockResolvedValueOnce(undefined);

        // Renders the EditSubtaskScreen component
        const { getByText, queryByText, getByTestId, getByDisplayValue, getAllByText  } = render(
            <NavigationContainer>
                <EditSubtaskScreen route={{ params: { subtaskID: 'subtask1' } }} />
            </NavigationContainer>
        );

        await waitFor(() => {
            // Verify that the subtask name is displayed correctly
            expect(getByDisplayValue('Test Edit Subtask')).toBeTruthy();
        });

        // Change the subtask name
        fireEvent.changeText(getByDisplayValue('Test Edit Subtask'), 'Updated Subtask Name');

        // Start date set to one day ago
        const earlierDate = new Date(mockSubtask.start_date - 86400000);
        const startDateString = earlierDate.toLocaleDateString('en-GB', {day: '2-digit', month:'2-digit', year:'numeric'});
        const startTimeString = earlierDate.toLocaleTimeString('en-GB',{hour:'2-digit', minute:'2-digit'});

        // End date set to one day later and a few minutes later
        const laterDate = new Date(mockSubtask.end_date + 86400000 + 300000);
        const endDateString = laterDate.toLocaleDateString('en-GB', {day: '2-digit', month:'2-digit', year:'numeric'});
        const endTimeString = laterDate.toLocaleTimeString('en-GB',{hour:'2-digit', minute:'2-digit'});

        // Press on start date which is 01/01/2025
        fireEvent.press(getByText('01/01/2025'));
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

        // Press on end date which is 06/01/2025
        fireEvent.press(getByText('06/01/2025'));
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

        // Change the subtask notes
        fireEvent.changeText(getByDisplayValue('Test notes.'), 'Updating test notes.');
        
        // Press on Priority Level dropdown
        fireEvent.press(getByTestId('Priority Level-button'));
        await waitFor(() => {
            // Verify the priorities shown matches the mockPriorities
            // There should be multiple Urgent as the mock subtask priority level is Urgent
            expect(getAllByText('Urgent')).toBeTruthy();
            expect(getByText('High')).toBeTruthy();
            expect(getByText('Medium')).toBeTruthy();
            expect(getByText('Low')).toBeTruthy();
            expect(getByText('N/A')).toBeTruthy();
        });
        // Press on High
        fireEvent.press(getByText('High'));

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
            // Verify updateSubtask was called once
            expect(updateSubtask).toHaveBeenCalledTimes(1);
            // Verify updateSubtask was called with updated values
            expect(updateSubtask).toHaveBeenCalledWith(expect.any(Object), 'subtask1', 
                expect.objectContaining({
                subtask_name: 'Updated Subtask Name',
                start_date: earlierDate,
                end_date: laterDate,
                duration: expect.any(Number),
                subtask_notes: 'Updating test notes.',
                priority_id: '2',
            }));
            // Verify that the createAttachment was called once
            expect(createAttachment).toHaveBeenCalledTimes(1);
            // Verify the attachment creation information
            expect(createAttachment).toHaveBeenCalledWith(expect.any(Object), {
                task_id: 'task1',
                created_by: 'temp_user_123',
                subtask_id: 'subtask1',
                file_name: 'new_attachment.pdf',
                file_type: 'application/pdf',
                uri: 'https://test.com/new_attachment.pdf',
                size: 1024,
                durationMillis: null,
            });
            // Verify that deleteAttachment was called once
            expect(deleteAttachment).toHaveBeenCalledTimes(1);
            // Check that success alert is shown.
            expect(Alert.alert).toHaveBeenCalledWith('Success', 'Subtask updated successfully!');
            // Verify that goBack was called once
            expect(mockNavigation.goBack).toHaveBeenCalledTimes(1);
        });
    });


    // Test to load priorities on mount
    it('should load priorities on mount', async () => {
        // Renders the EditSubtaskScreen component
        const { getByText, getAllByText, getByTestId } = render(
            <NavigationContainer>
                <EditSubtaskScreen route={{ params: { subtaskID: 'subtask1' } }} />
            </NavigationContainer>
        );

        await waitFor(() => {
            // Verify Priority Level Urgent is displayed
            expect(getByText('Urgent')).toBeTruthy();
        });

        // Press on Priority Level dropdown
        fireEvent.press(getByTestId('Priority Level-button'));

        await waitFor(() => {
            // Verify the priorities shown matches the mockPriorities
            expect(getAllByText('Urgent')).toBeTruthy();
            expect(getByText('High')).toBeTruthy();
            expect(getByText('Medium')).toBeTruthy();
            expect(getByText('Low')).toBeTruthy();
            expect(getByText('N/A')).toBeTruthy();
        });

        // Press on High
        fireEvent.press(getByText('High'));
    });

    // Test to show suggestion alert for end date less than 1 day
    it('should show suggestion alert for end date less than 1 day', async () => {
        // Mock priority suggestion
        suggestDatePriority.mockReturnValueOnce('Urgent');
    
        // Renders the EditSubtaskScreen component
        const { getByText, getByTestId, getByDisplayValue } = render(
            <NavigationContainer>
                <EditSubtaskScreen route={{ params: { subtaskID: 'subtask1' } }} />
            </NavigationContainer>
        );

        await waitFor(() => {
            // Verify that the subtask name is displayed correctly
            expect(getByDisplayValue('Test Edit Subtask')).toBeTruthy();
        });
    
        // Press on end date which is 06/01/2025
        fireEvent.press(getByText('06/01/2025'));

        // Retrieve the end date picker component
        const endDatePicker = getByTestId('endDatePicker');

        // End date set to one day later
        const laterDate = new Date(mockSubtask.end_date + 86000000); 
        const endDateString = laterDate.toLocaleDateString('en-GB', {day: '2-digit', month:'2-digit', year:'numeric'});

        // Simulate changing the end date to an later date
        fireEvent(endDatePicker, 'onChange', {type: 'set'}, laterDate);
    
        await waitFor(() => {
            // Verify the priority suggestion alert is called correctly with less than 1 day
            expect(Alert.alert).toHaveBeenCalledWith(`I suggest a priority of Urgent for end date ${endDateString}!`);
        });
    });

    // Test to show suggestion alert for end date when end time is selected
    it('should show suggestion alert for end date when end time is selected', async () => {
        // Mock priority suggestion
        suggestDatePriority.mockReturnValueOnce('Urgent');
    
        // Renders the EditSubtaskScreen component
        const { getByText, getByTestId, getByDisplayValue } = render(
            <NavigationContainer>
                <EditSubtaskScreen route={{ params: { subtaskID: 'subtask1' } }} />
            </NavigationContainer>
        );

        await waitFor(() => {
            // Verify that the subtask name is displayed correctly
            expect(getByDisplayValue('Test Edit Subtask')).toBeTruthy();
        });
    
        // Press on end time which is 12:00
        fireEvent.press(getByText('12:00'));

        // Retrieve the end time picker component
        const endTimePicker = getByTestId('endTimePicker');

        // End time set few seconds later
        const laterTime = new Date(mockSubtask.end_date + 3000); 
        const endTimeString = laterTime.toLocaleDateString('en-GB', {day: '2-digit', month:'2-digit', year:'numeric'});

        // Simulate changing the end time to an later time
        fireEvent(endTimePicker, 'onChange', {type: 'set'}, laterTime);
    
        await waitFor(() => {
            // Verify the priority suggestion alert is called correctly with less than 1 day when selecting time
            expect(Alert.alert).toHaveBeenCalledWith(`I suggest a priority of Urgent for end date ${endTimeString}!`);
        });
    });

    // Test to show suggestion alert for end date more than 1 day and less than 5 days
    it('should show suggestion alert for end date more than 1 day and less than 5 days', async () => {
        // Mock priority suggestion
        suggestDatePriority.mockReturnValueOnce('High');
    
        // Renders the EditSubtaskScreen component
        const { getByText, getByTestId, getByDisplayValue } = render(
            <NavigationContainer>
                <EditSubtaskScreen route={{ params: { subtaskID: 'subtask1' } }} />
            </NavigationContainer>
        );

        await waitFor(() => {
            // Verify that the subtask name is displayed correctly
            expect(getByDisplayValue('Test Edit Subtask')).toBeTruthy();
        });
    
        // Press on end date which is 06/01/2025
        fireEvent.press(getByText('06/01/2025'));

        // Retrieve the end date picker component
        const endDatePicker = getByTestId('endDatePicker');

        // End date set to one day later
        const laterDate = new Date(mockSubtask.end_date + 172800000); 
        const endDateString = laterDate.toLocaleDateString('en-GB', {day: '2-digit', month:'2-digit', year:'numeric'});

        // Simulate changing the end date to an later date
        fireEvent(endDatePicker, 'onChange', {type: 'set'}, laterDate);
    
        await waitFor(() => {
            // Verify the priority suggestion alert is called correctly with more than 1 day and less than 5 days
            expect(Alert.alert).toHaveBeenCalledWith(`I suggest a priority of High for end date ${endDateString}!`);
        });
    });

    // Test to show suggestion alert for end date more than 5 days and less than 10 days
    it('should show suggestion alert for end date more than 5 days and less than 10 days', async () => {
        // Mock priority suggestion
        suggestDatePriority.mockReturnValueOnce('Medium');
    
        // Renders the EditSubtaskScreen component
        const { getByText, getByTestId, getByDisplayValue } = render(
            <NavigationContainer>
                <EditSubtaskScreen route={{ params: { subtaskID: 'subtask1' } }} />
            </NavigationContainer>
        );

        await waitFor(() => {
            // Verify that the subtask name is displayed correctly
            expect(getByDisplayValue('Test Edit Subtask')).toBeTruthy();
        });
    
        // Press on end date which is 06/01/2025
        fireEvent.press(getByText('06/01/2025'));

        // Retrieve the end date picker component
        const endDatePicker = getByTestId('endDatePicker');

        // End date set to one day later
        const laterDate = new Date(mockSubtask.end_date + 518400000); 
        const endDateString = laterDate.toLocaleDateString('en-GB', {day: '2-digit', month:'2-digit', year:'numeric'});

        // Simulate changing the end date to an later date
        fireEvent(endDatePicker, 'onChange', {type: 'set'}, laterDate);
    
        await waitFor(() => {
            // Verify the priority suggestion alert is called correctly with more than 5 day and less than 10 days
            expect(Alert.alert).toHaveBeenCalledWith(`I suggest a priority of Medium for end date ${endDateString}!`);
        });
    });

    // Test to show suggestion alert for end date more than 10 days
    it('should show suggestion alert for end date more than 10 days', async () => {
        // Mock priority suggestion
        suggestDatePriority.mockReturnValueOnce('Low');
    
        // Renders the EditSubtaskScreen component
        const { getByText, getByTestId, getByDisplayValue } = render(
            <NavigationContainer>
                <EditSubtaskScreen route={{ params: { subtaskID: 'subtask1' } }} />
            </NavigationContainer>
        );

        await waitFor(() => {
            // Verify that the subtask name is displayed correctly
            expect(getByDisplayValue('Test Edit Subtask')).toBeTruthy();
        });

        // Press on end date which is 06/01/2025
        fireEvent.press(getByText('06/01/2025'));

        // Retrieve the end date picker component
        const endDatePicker = getByTestId('endDatePicker');

        // End date set to one day later
        const laterDate = new Date(mockSubtask.end_date + 950400000); 
        const endDateString = laterDate.toLocaleDateString('en-GB', {day: '2-digit', month:'2-digit', year:'numeric'});

        // Simulate changing the end date to an later date
        fireEvent(endDatePicker, 'onChange', {type: 'set'}, laterDate);
    
        await waitFor(() => {
            // Verify the priority suggestion alert is called correctly with more than 10 days
            expect(Alert.alert).toHaveBeenCalledWith(`I suggest a priority of Low for end date ${endDateString}!`);
        });
    });

    // Test to render loading indicator initially
    it('should render loading indicator initially', async () => {
        // Renders the EditSubtaskScreen component
        const { getByText } = render(
            <NavigationContainer>
                <EditSubtaskScreen route={{ params: { subtaskID: 'subtask1' } }} />
            </NavigationContainer>
        );

        // Verify the Loading subtask detail... is displayed
        expect(getByText('Loading subtask detail...')).toBeTruthy();
    });

    // Test to show an alert if fetching subtask details fails
    it('should show an alert if fetching subtask details fails', async () => {
        // Mock fetching subtask error
        getSubtaskByID.mockRejectedValueOnce(new Error('Fetching Subtask Details Error'));
    
        // Renders the EditSubtaskScreen component
        render(
            <NavigationContainer>
                <EditSubtaskScreen route={{ params: { subtaskID: 'subtask1' } }} />
            </NavigationContainer>
        );
    
        await waitFor(() => {
            // Verify that an error alert is shown to the user when failing to fetch subtask details
            expect(Alert.alert).toHaveBeenCalledWith('Fetching Subtask Details Error', 'Failed to fetch subtask details.');
        });
    });

    // Test to show an alert if failed to update subtask
    it('should show an alert if failed to update subtask', async () => {
        // Mock subtask update error
        updateSubtask.mockRejectedValueOnce(new Error('Failed to update subtask'));

        // Renders the EditSubtaskScreen component
        const { getByText, getByDisplayValue } = render(
            <NavigationContainer>
                <EditSubtaskScreen route={{ params: { subtaskID: 'subtask1' } }} />
            </NavigationContainer>
        );
    
        await waitFor(() => {
            // Verify that all component are rendered with the correct text
            expect(getByDisplayValue('Test Edit Subtask')).toBeTruthy();
            expect(getByText('01/01/2025')).toBeTruthy();
            expect(getByText('10:00')).toBeTruthy();
            expect(getByText('06/01/2025')).toBeTruthy();
            expect(getByText('12:00')).toBeTruthy();
            expect(getByDisplayValue('Test notes.')).toBeTruthy();
            expect(getByText('Urgent')).toBeTruthy();
            expect(getByText('Insert Attachment')).toBeTruthy();
            expect(getByText('test_attachment.pdf')).toBeTruthy();
            expect(getByText('Update')).toBeTruthy();
        });

        // Change the subtask name
        fireEvent.changeText(getByDisplayValue('Test Edit Subtask'), 'Test Edit Subtask Failed');
    
        // Press on Update button
        fireEvent.press(getByText('Update'));
    
        await waitFor(() => {
            // Verify updateSubtask was called once
            expect(updateSubtask).toHaveBeenCalledTimes(1);
            // Verify that an error alert is shown to the user when updating the subtask failed
            expect(Alert.alert).toHaveBeenCalledWith('Update Error', 'Failed to update the subtask.');
        });
        
    });

    // Test to show an alert if failed to add attachments
    it('should show an alert if failed to add attachments', async () => {
        // Mock the successful update of subtask
        updateSubtask.mockResolvedValueOnce(true);
        // Mock attachment creation error
        createAttachment.mockRejectedValueOnce(new Error('Failed to create attachment'));
    
        // Renders the EditSubtaskScreen component
        const { getByText, getByDisplayValue } = render(
            <NavigationContainer>
                <EditSubtaskScreen route={{ params: { subtaskID: 'subtask1' } }} />
            </NavigationContainer>
        );
    
        await waitFor(() => {
            // Verify that all component are rendered with the correct text
            expect(getByDisplayValue('Test Edit Subtask')).toBeTruthy();
            expect(getByText('01/01/2025')).toBeTruthy();
            expect(getByText('10:00')).toBeTruthy();
            expect(getByText('06/01/2025')).toBeTruthy();
            expect(getByText('12:00')).toBeTruthy();
            expect(getByDisplayValue('Test notes.')).toBeTruthy();
            expect(getByText('Urgent')).toBeTruthy();
            expect(getByText('Insert Attachment')).toBeTruthy();
            expect(getByText('test_attachment.pdf')).toBeTruthy();
            expect(getByText('Update')).toBeTruthy();
        });

        // Change the subtask name
        fireEvent.changeText(getByDisplayValue('Test Edit Subtask'), 'Test Edit Subtask Attachment Failed');
    
        // Press on Insert Attachment
        fireEvent.press(getByText('Insert Attachment'));
        await waitFor(() => {
            // Verify the mocked attachment is correct
            expect(getByText('new_attachment.pdf')).toBeTruthy();
        });

        // Press on Update button
        fireEvent.press(getByText('Update'));
    
        await waitFor(() => {
            // Verify updateSubtask was called once
            expect(updateSubtask).toHaveBeenCalledTimes(1);
            // Verify that the createAttachment was called once
            expect(createAttachment).toHaveBeenCalledTimes(1);
            // Verify that an error alert is shown to the user when updating the subtask failed
            expect(Alert.alert).toHaveBeenCalledWith('Update Error', 'Failed to update the subtask.');
        });
    });

    // Test to show an alert if Subtask Name is missing
    it('should show an alert if Subtask Name is missing', async () => {
        // Renders the EditSubtaskScreen component
        const { getByText, getByDisplayValue } = render(
            <NavigationContainer>
                <EditSubtaskScreen route={{ params: { subtaskID: 'subtask1' } }} />
            </NavigationContainer>
        );

        await waitFor(() => {
            // Verify that the subtask name is displayed correctly
            expect(getByDisplayValue('Test Edit Subtask')).toBeTruthy();
        });

        // Clear subtask name
        fireEvent.changeText(getByDisplayValue('Test Edit Subtask'), '');

        // Press on Update button
        fireEvent.press(getByText('Update'));

        await waitFor(() => {
            // Verify that an error alert is shown to the user when there is no subtask name added
            expect(Alert.alert).toHaveBeenCalledWith('Incomplete Subtask', 'Please enter the Subtask Name.');
        });
    });

    // Test to show an alert if End Date is invalid
    it('should show an alert if End Date is invalid', async () => {
        // Mock the subtask to have no end date
        const subtaskWithoutEndDate = { ...mockSubtask, end_date: '' };
        getSubtaskByID.mockResolvedValueOnce(subtaskWithoutEndDate);

        // Renders the EditSubtaskScreen component
        const { getByText, getByDisplayValue } = render(
            <NavigationContainer>
                <EditSubtaskScreen route={{ params: { subtaskID: 'subtask1' } }} />
            </NavigationContainer>
        );

        await waitFor(() => {
            // Verify that the subtask name is displayed correctly
            expect(getByDisplayValue('Test Edit Subtask')).toBeTruthy();
        });

        // Press on Update button
        fireEvent.press(getByText('Update'));

        await waitFor(() => {
            // Verify that an error alert is shown to the user when there is no end date and time added
            expect(Alert.alert).toHaveBeenCalledWith('Incomplete Subtask', 'Please select an End Date and Time.');
        });
    });

    // Test to show an alert if End Date is on or before Start Date
    it('should show an alert if End Date is before Start Date', async () => {
        // Renders the EditSubtaskScreen component
        const { getByText, getByTestId, getByDisplayValue } = render(
            <NavigationContainer>
                <EditSubtaskScreen route={{ params: { subtaskID: 'subtask1' } }} />
            </NavigationContainer>
        );

        await waitFor(() => {
            // Verify that the subtask name is displayed correctly
            expect(getByDisplayValue('Test Edit Subtask')).toBeTruthy();
        });

        // Set an invalid end date
        const invalidEndDate = new Date('2024-12-19T10:00:00');

        // Press on end date which is 06/01/2025
        fireEvent.press(getByText('06/01/2025'));
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

    // Test to show an alert if loading priority levels fails
    it('should show an alert if loading priority levels fails', async () => {
        // Mock loading priorities error
        getAllPriorities.mockRejectedValueOnce(new Error('Priority Levels Initialisation Error'));
    
        // Renders the EditSubtaskScreen component
        render(
            <NavigationContainer>
                <EditSubtaskScreen route={{ params: { subtaskID: 'subtask1' } }} />
            </NavigationContainer>
        );
    
        await waitFor(() => {
            // Verify that an error alert is shown to the user when priorities loading fails
            expect(Alert.alert).toHaveBeenCalledWith('Initialising User and Priorities Error', 'Failed to initialise user and priorities.');
        });
    });

    // Test to show console error when no suggestion is returned for end date
    it('should show console error when no suggestion is returned for end date', async () => {
        // Mock priority suggestion
        suggestDatePriority.mockReturnValueOnce(undefined);
    
        // Renders the EditSubtaskScreen component
        const { getByText, getByTestId, getByDisplayValue } = render(
            <NavigationContainer>
                <EditSubtaskScreen route={{ params: { subtaskID: 'subtask1' } }} />
            </NavigationContainer>
        );

        await waitFor(() => {
            // Verify that the subtask name is displayed correctly
            expect(getByDisplayValue('Test Edit Subtask')).toBeTruthy();
        });
    
        // Press on end date which is 06/01/2025
        fireEvent.press(getByText('06/01/2025'));

        // Retrieve the end date picker component
        const endDatePicker = getByTestId('endDatePicker');

        // End date set to less than one day later
        const laterDate = new Date(mockSubtask.end_date + 86000000); 
        const endDateString = laterDate.toLocaleDateString('en-GB', {day: '2-digit', month:'2-digit', year:'numeric'});
        
        // Simulate changing the end date to an later date
        fireEvent(endDatePicker, 'onChange', {type: 'set'}, laterDate);
    
        await waitFor(() => {
            // Verify the console error logged that there is an error suggesting priority for end date
            expect(console.error).toHaveBeenCalledWith('Error Suggesting Priority for End Date.');
        });
    });

    // Test to show console error when no suggestion is returned for end time
    it('should show console error when no suggestion is returned for end time', async () => {
        // Mock priority suggestion
        suggestDatePriority.mockReturnValueOnce(undefined);
    
        // Renders the EditSubtaskScreen component
        const { getByText, getByTestId, getByDisplayValue } = render(
            <NavigationContainer>
                <EditSubtaskScreen route={{ params: { subtaskID: 'subtask1' } }} />
            </NavigationContainer>
        );

        await waitFor(() => {
            // Verify that the subtask name is displayed correctly
            expect(getByDisplayValue('Test Edit Subtask')).toBeTruthy();
        });
    
    
        // Press on end time which is 12:00
        fireEvent.press(getByText('12:00'));

        // Retrieve the end time picker component
        const endTimePicker = getByTestId('endTimePicker');

        // End time set few seconds later
        const laterTime = new Date(mockSubtask.end_date + 3000); 
        const endTimeString = laterTime.toLocaleDateString('en-GB', {day: '2-digit', month:'2-digit', year:'numeric'});

        // Simulate changing the end time to an later time
        fireEvent(endTimePicker, 'onChange', {type: 'set'}, laterTime);
    
        await waitFor(() => {
            // Verify the console error logged that there is an error suggesting priority for end time
            expect(console.error).toHaveBeenCalledWith('Error Suggesting Priority for End Time.');
        });
    });


    // Snapshot test for EditSubtaskScreen
    it('should match the snapshot', async () => {
        // Renders the EditSubtaskScreen component
        const { toJSON, getByDisplayValue } = render(
            <NavigationContainer>
                <EditSubtaskScreen route={{ params: { subtaskID: 'subtask1' } }} />
            </NavigationContainer>
        );

        await waitFor(() => {
            // Verify that the subtask name is displayed correctly
            expect(getByDisplayValue('Test Edit Subtask')).toBeTruthy();
        });

        // Verify snapshot matches
        expect(toJSON()).toMatchSnapshot();
    });

});