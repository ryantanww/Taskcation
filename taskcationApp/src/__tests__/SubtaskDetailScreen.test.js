// Import dependencies and libraries used for testing Subtask Detail Screen
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import SubtaskDetailScreen from '../screens/SubtaskDetailScreen';
import { getSubtaskByID, updateSubtask } from '../services/subtaskService';
import { getPriorityByID } from '../services/priorityLevelsService';
import { getAttachmentsBySubtaskID } from '../services/attachmentService';
import { Alert } from 'react-native'; 

// Mock subtask for the test
const mockSubtask = {
    id: 'subtask1',
    subtask_name: 'Test Subtask',
    start_date: new Date('2025-01-01T10:00:00'),
    end_date: new Date('2025-01-06T12:00:00'),
    duration: 439200000,
    subtask_notes: 'This is a test note.',
    task_name: 'Test Task',
    priority_id: 'priority0',
    status: false,
};

// Mock priority for the test
const mockPriority = {
    id: 'priority0',
    priority_name: 'Urgent',
};

// Mock attachment for the test
const mockAttachments = [
    { id: 'attach1', uri: 'https://test.com/test_attachment.pdf', file_name: 'test_attachment.pdf', file_type: 'application/pdf',},
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
        useRoute: () => ({ params: {subtaskID: 'subtask1'}}),
        useFocusEffect: () => {},
    };
});


describe('SubtaskDetailScreen', () => {
    // Clear all mocks and reset them before each test
    beforeEach(() => {
        getSubtaskByID.mockClear();
        getSubtaskByID.mockReset();
        updateSubtask.mockClear();
        updateSubtask.mockReset();
        getPriorityByID.mockClear();
        getPriorityByID.mockReset();
        getAttachmentsBySubtaskID.mockClear();
        getAttachmentsBySubtaskID.mockReset();
        jest.clearAllMocks();
        // Spy on Alert.alert to verify alerts
        jest.spyOn(Alert, 'alert');
        // Mock the required services
        getSubtaskByID.mockResolvedValue(mockSubtask);
        getPriorityByID.mockResolvedValue(mockPriority);
        getAttachmentsBySubtaskID.mockResolvedValue(mockAttachments);
    });
    
    // Test to display correct subtask details after fetching
    it('should display correct subtask details after fetching', async () => {
        // Renders the SubtaskDetailScreen component
        const { getByText } = render(
            <NavigationContainer>
                <SubtaskDetailScreen />
            </NavigationContainer>
        );

        await waitFor(() => {
            // Verify that all components are rendered with the correct subtask details after fetching
            expect(getByText('Test Subtask')).toBeTruthy();
            expect(getByText('Start Date')).toBeTruthy();
            expect(getByText('01/01/2025')).toBeTruthy();
            expect(getByText('10:00')).toBeTruthy();
            expect(getByText('End Date')).toBeTruthy();
            expect(getByText('06/01/2025')).toBeTruthy();
            expect(getByText('12:00')).toBeTruthy();
            expect(getByText('Duration')).toBeTruthy();
            expect(getByText('5 days 2 hours')).toBeTruthy();
            expect(getByText('This is a test note.')).toBeTruthy();
            expect(getByText('Task')).toBeTruthy();
            expect(getByText('Test Task')).toBeTruthy();
            expect(getByText('Priority')).toBeTruthy();
            expect(getByText('Urgent')).toBeTruthy();
            expect(getByText('Attachments')).toBeTruthy();
            expect(getByText('test_attachment.pdf')).toBeTruthy();
            expect(getByText('View Logged Time')).toBeTruthy();
            expect(getByText('Mark As Completed')).toBeTruthy();
        });
    });

    // Test to display notes correctly when there are no notes
    it('should display notes correctly when there are no notes', async () => {
        // Create a subtask with missing notes
        const subtaskWithoutNotes = { ...mockSubtask, subtask_notes: '' };
        // Make getSubtaskByID return the subtask without notes
        getSubtaskByID.mockResolvedValueOnce(subtaskWithoutNotes);
    
        // Renders the SubtaskDetailScreen component
        const { getByText } = render(
            <NavigationContainer>
                <SubtaskDetailScreen />
            </NavigationContainer>
        );
    
        await waitFor(() => {
            // Verify that notes shows No additional notes provided.
            expect(getByText('No additional notes provided.')).toBeTruthy();
        });
    });

    // Test to open the timer modal when the View Logged Time button is pressed
    it('should open the timer modal when the View Logged Time button is pressed', async () => {
        // Renders the SubtaskDetailScreen component
        const { getByText, getByTestId } = render(
            <NavigationContainer>
                <SubtaskDetailScreen />
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
        // Renders the SubtaskDetailScreen component
        const { getByText, getByTestId, queryByTestId } = render(
            <NavigationContainer>
                <SubtaskDetailScreen />
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
        // Renders the SubtaskDetailScreen component
        const { getByText, getByTestId, queryByTestId } = render(
            <NavigationContainer>
                <SubtaskDetailScreen />
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

    // Test to mark subtask as completed
    it('should mark subtask as completed', async () => {
        // Mock the updateSubtask service
        updateSubtask.mockResolvedValueOnce(true);
    
        // Renders the SubtaskDetailScreen component
        const { getByText } = render(
            <NavigationContainer>
                <SubtaskDetailScreen />
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
            // Verify that updateSubtask has been called with the updated status
            expect(updateSubtask).toHaveBeenCalledWith(expect.anything(), 'subtask1', { status: true });
            // Verify the success alert for updating subtask
            expect(Alert.alert).toHaveBeenCalledWith('Success', 'Subtask marked as completed.');
        });
    
    });

    // Test to mark subtask as uncompleted
    it('should mark subtask as uncompleted', async () => {
        // Mock the required services
        const completedSubtask = { ...mockSubtask, status: true };
        getSubtaskByID.mockResolvedValueOnce(completedSubtask);
        updateSubtask.mockResolvedValueOnce(true);
    
        // Renders the SubtaskDetailScreen component
        const { getByText } = render(
            <NavigationContainer>
                <SubtaskDetailScreen />
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
            // Verify that updateSubtask has been called with the updated status
            expect(updateSubtask).toHaveBeenCalledWith(expect.anything(), 'subtask1', { status: false });
            // Verify the success alert for updating subtask
            expect(Alert.alert).toHaveBeenCalledWith('Success', 'Subtask marked as uncompleted.');
        });
    });

    // Test to update UI on successful refresh
    it('should update UI on successful refresh', async () => {
        // Mock useFocusEffect
        const { useFocusEffect } = jest.requireActual('@react-navigation/native');
        jest.spyOn(require('@react-navigation/native'), 'useFocusEffect')
            .mockImplementation(useFocusEffect);
        
        // Get the updated subtask name when refreshed
        const refreshedSubtask = { ...mockSubtask, subtask_name: 'Updated Test Subtask' };
        // Mock the subtask details with the refreshed subtask
        getSubtaskByID
            .mockResolvedValueOnce(mockSubtask)
            .mockResolvedValueOnce(refreshedSubtask);
        
        // Renders the SubtaskDetailScreen component
        const { getByText } = render(
            <NavigationContainer>
                <SubtaskDetailScreen />
            </NavigationContainer>
        );
        await waitFor(() => {
            // Verify the Updated Test Subtask is displayed
            expect(getByText('Updated Test Subtask')).toBeTruthy();
        });
    });

    // Test to render loading indicator initially
    it('should render loading indicator initially', async () => {
        // Renders the SubtaskDetailScreen component
        const { getByText } = render(
            <NavigationContainer>
                <SubtaskDetailScreen />
            </NavigationContainer>
        );

        // Verify the Loading subtask detail... is displayed
        expect(getByText('Loading subtask detail...')).toBeTruthy();
    });

    // Test to show an alert for failing to fetch subtask if getSubtaskByID fails
    it('should show an alert for failing to fetch subtask if getSubtaskByID fails', async () => {
        // Mock the subtask service with an error
        getSubtaskByID.mockRejectedValueOnce(new Error('Error fetching subtask'));

        // Renders the SubtaskDetailScreen component
        render(
            <NavigationContainer>
                <SubtaskDetailScreen />
            </NavigationContainer>
        );

        await waitFor(() => {
            // Verify that an error alert is shown to the user when failed to fetch subtask
            expect(Alert.alert).toHaveBeenCalledWith('Fetching Subtask Error', 'Failed to fetch subtask.');
        });
    });

     // Test to show an alert for failing to fetch priority if getPriorityByID fails
    it('should show an alert for failing to fetch priority if getPriorityByID fails', async () => {
        // Mock priority service with an error
        getPriorityByID.mockRejectedValueOnce(new Error('Error fetching priority'));

        // Renders the SubtaskDetailScreen component
        render(
            <NavigationContainer>
                <SubtaskDetailScreen />
            </NavigationContainer>
        );

        await waitFor(() => {
            // Verify that an error alert is shown to the user when failed to fetch priority
            expect(Alert.alert).toHaveBeenCalledWith('Fetching Priority Error', 'Failed to fetch priority.');
        });
    });

    // Test to show an alert for failing to fetch attachments if getAttachmentsBySubtaskID fails
    it('should show an alert for failing to fetch attachments if getAttachmentsBySubtaskID fails', async () => {
        // Mock attachments service with an error
        getAttachmentsBySubtaskID.mockRejectedValueOnce(new Error('Error fetching attachments'));

        // Renders the SubtaskDetailScreen component
        render(
            <NavigationContainer>
                <SubtaskDetailScreen />
            </NavigationContainer>
        );

        await waitFor(() => {
            // Verify that an error alert is shown to the user when failed to fetch attachments
            expect(Alert.alert).toHaveBeenCalledWith('Fetching Attachments Error', 'Failed to fetch attachments.');
        });
    });

    // Test to show an alert for failing to update subtask if updateSubtask fails
    it('should show an alert for failing to update subtask if updateSubtask fails', async () => {
        // Mock update subtask service with an error
        updateSubtask.mockRejectedValueOnce(new Error('Error updating subtask'));

        // Renders the SubtaskDetailScreen component
        const { getByText } = render(
            <NavigationContainer>
                <SubtaskDetailScreen />
            </NavigationContainer>
        );

        await waitFor(() => {
            // Press on Mark As Completed
            expect(getByText('Mark As Completed')).toBeTruthy();
        });

        // Press on Mark As Completed
        fireEvent.press(getByText('Mark As Completed'));

        await waitFor(() => {
            // Verify that an error alert is shown to the user when failed to update subtask
            expect(Alert.alert).toHaveBeenCalledWith('Update Subtask Error', 'Failed to update subtask.');
        });
    });

    // Test to show an alert for invalid duration formatting when subtask.duration is negative
    it('should show an alert for invalid duration formatting when subtask.duration is negative', async () => {
        // Mock the required services but mock groups service with negative duration
        const invalidSubtask = { ...mockSubtask, duration: -1000};
        getSubtaskByID.mockResolvedValueOnce(invalidSubtask);
    
        // Renders the SubtaskDetailScreen component
        render(
            <NavigationContainer>
                <SubtaskDetailScreen />
            </NavigationContainer>
        );
    
        await waitFor(() => {
            // Verify that an error alert is shown to the user when failed to format duration
            expect(Alert.alert).toHaveBeenCalledWith('Formatting Duration Error', 'Failed to format duration.');
        });
    });

    // Test to show an alert for invalid duration formatting when subtask.duration is a string
    it('should show an alert for invalid duration formatting when subtask.duration is a string', async () => {
        // Mock the required services but mock subtask with string duration
        const invalidSubtask = { ...mockSubtask, duration:'one thousand'};
        getSubtaskByID.mockResolvedValueOnce(invalidSubtask);
    
        // Renders the SubtaskDetailScreen component
        render(
            <NavigationContainer>
                <SubtaskDetailScreen />
            </NavigationContainer>
        );
    
        await waitFor(() => {
            // Verify that an error alert is shown to the user when failed to format duration
            expect(Alert.alert).toHaveBeenCalledWith('Formatting Duration Error', 'Failed to format duration.');
        });
    });

    // Test to show an alert for failing to refresh subtask
    it('should show an alert for failing to refresh subtask', async () => {
        // Mock useFocusEffect
        const { useFocusEffect } = jest.requireActual('@react-navigation/native');
        jest.spyOn(require('@react-navigation/native'), 'useFocusEffect')
            .mockImplementation(useFocusEffect);
        
        // Mock the subtask details with the error
        getSubtaskByID
            .mockResolvedValueOnce(mockSubtask)
            .mockRejectedValueOnce(new Error('Error refreshing subtask'));
        
        // Renders the SubtaskDetailScreen component
        render(
            <NavigationContainer>
                <SubtaskDetailScreen />
            </NavigationContainer>
        );
        
        await waitFor(() => {
            // Verify that an error alert is shown to the user when failed to refresh subtask
            expect(Alert.alert).toHaveBeenCalledWith('Refreshing Subtask Error', 'Failed to refresh subtask.');
        });
    });

    // Snapshot test for SubtaskDetailScreen when subtask is not completed
    it('should match the snapshot when subtask is not completed', async () => {

        // Renders the SubtaskDetailScreen component
        const { getByText, toJSON } = render(
            <NavigationContainer>
                <SubtaskDetailScreen />
            </NavigationContainer>
        );
    
        await waitFor(() => {
            // Verify that Test Subtask is displayed
            expect(getByText('Test Subtask')).toBeTruthy();
        });
        // Verify snapshot matches
        expect(toJSON()).toMatchSnapshot();
    });

    // Snapshot test for SubtaskDetailScreen when subtask is completed
    it('should match the snapshot when subtask is completed', async () => {
        // Mock the updateSubtask service
        updateSubtask.mockResolvedValueOnce(true);

        // Renders the SubtaskDetailScreen component
        const { getByText, toJSON } = render(
            <NavigationContainer>
                <SubtaskDetailScreen />
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
            // Verify that updateSubtask has been called with the updated status
            expect(updateSubtask).toHaveBeenCalledWith(expect.anything(), 'subtask1', { status: true });
            // Verify the success alert for updating subtask
            expect(Alert.alert).toHaveBeenCalledWith('Success', 'Subtask marked as completed.');
        });
    
        // Verify snapshot matches
        expect(toJSON()).toMatchSnapshot();
    });

    // Snapshot test for SubtaskDetailScreen when updating UI on successful refresh
    it('should match the snapshot when updating UI on successful refresh', async () => {
        // Mock useFocusEffect
        const { useFocusEffect } = jest.requireActual('@react-navigation/native');
        jest.spyOn(require('@react-navigation/native'), 'useFocusEffect')
            .mockImplementation(useFocusEffect);
        
        // Get the updated subtask name when refreshed
        const refreshedSubtask = { ...mockSubtask, task_name: 'Updated Test Subtask' };
        // Mock the subtask details with the refreshed subtask
        getSubtaskByID
            .mockResolvedValueOnce(mockSubtask)
            .mockResolvedValueOnce(refreshedSubtask); 
        
        // Renders the SubtaskDetailScreen component
        const { getByText, toJSON } = render(
            <NavigationContainer>
                <SubtaskDetailScreen />
            </NavigationContainer>
        );
        
        await waitFor(() => {
            // Verify the Updated Test Subtask is displayed
            expect(getByText('Updated Test Subtask')).toBeTruthy();
        });

        // Verify snapshot matches
        expect(toJSON()).toMatchSnapshot();
    });
});