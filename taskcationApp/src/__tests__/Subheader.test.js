// Import dependencies and libraries used for testing Subheader
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import Subheader from '../components/Subheader';
import { deleteTask } from '../services/taskService';
import { deleteGroup } from '../services/groupsService';
import { deleteSubtask } from '../services/subtaskService';


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
    };
});

describe('Subheader Component', () => {
    // Clear all mocks before each test
    beforeEach(() => {
        jest.clearAllMocks();
        // Spy on Alert.alert to verify alerts
        jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    });
    
    // Test to render the Subheader correctly when there is no kebab menu 
    it('should render the title and back arrow when there is no kebab menu', () => {
        // Renders the Subheader component
        const { getByText, getByTestId, queryByTestId } = render(
            <Subheader title='Test Title' hasKebab={false} itemID='123' itemType='Task' />
        );
        
        // Verify the title is displayed correctly
        expect(getByText('Test Title')).toBeTruthy();
        // Verify the kebab button is not there
        expect(queryByTestId('kebab-button')).toBeNull();

        // Verify the back button is displayed correctly
        expect(getByTestId('back-button')).toBeTruthy();
        // Press the back button
        fireEvent.press(getByTestId('back-button'));
        // Verify that goBack was called once
        expect(mockGoBack).toHaveBeenCalledTimes(1);
    });
    
    // Test to render the Subheader correctly when there is kebab menu 
    it('should open the modal when the kebab icon is pressed', () => {
        // Renders the Subheader component
        const { getByText, getByTestId } = render(
            <Subheader title='Test Title' hasKebab={true} itemID='123' itemType='Task' />
        );
    
        // Verify the kebab button is there
        expect(getByTestId('kebab-button')).toBeTruthy();
        // Press the kebab button
        fireEvent.press(getByTestId('kebab-button'));
    
        // Verify the edit and delete is displayed correctly
        expect(getByText('Edit')).toBeTruthy();
        expect(getByText('Delete')).toBeTruthy();
    });
    
    // Test to navigate to EditTaskScreen when Edit is pressed for a Task
    it('should navigate to EditTaskScreen when Edit is pressed for a Task', () => {
        // Renders the Subheader component
        const { getByText, getByTestId } = render(
            <Subheader title='Task Title' hasKebab={true} itemID='task1' itemType='Task' />
        );
    
        // Verify the kebab button is there
        expect(getByTestId('kebab-button')).toBeTruthy();
        // Press the kebab button
        fireEvent.press(getByTestId('kebab-button'));

        // Verify the edit and delete is displayed correctly
        expect(getByText('Edit')).toBeTruthy();
        expect(getByText('Delete')).toBeTruthy();

        // Press the edit button
        fireEvent.press(getByTestId('edit-button'));

        // Verify that navigation to EditTaskScreen screen has been called with taskID as its parameter 
        expect(mockNavigate).toHaveBeenCalledWith('EditTaskScreen', { taskID: 'task1' });
    });
    
    // Test to navigate to EditSubtaskScreen when Edit is pressed for a Subtask
    it('should navigate to EditSubtaskScreen when Edit is pressed for a Subtask', () => {
        // Renders the Subheader component
        const { getByText, getByTestId } = render(
            <Subheader title='Subtask Title' hasKebab={true} itemID='subtask1' itemType='Subtask' />
        );
    
        // Verify the kebab button is there
        expect(getByTestId('kebab-button')).toBeTruthy();
        // Press the kebab button
        fireEvent.press(getByTestId('kebab-button'));

        // Verify the edit and delete is displayed correctly
        expect(getByText('Edit')).toBeTruthy();
        expect(getByText('Delete')).toBeTruthy();

        // Press the edit button
        fireEvent.press(getByTestId('edit-button'));
    
        // Verify that navigation to EditSubtaskScreen screen has been called with subtaskID as its parameter 
        expect(mockNavigate).toHaveBeenCalledWith('EditSubtaskScreen', { subtaskID: 'subtask1' });
    });
    
    // Test to navigate to EditGroupScreen when Edit is pressed for a Groups
    it('should navigate to EditGroupScreen when Edit is pressed for Groups', () => {
        // Renders the Subheader component
        const { getByText, getByTestId } = render(
            <Subheader title='Group Title' hasKebab={true} itemID='group1' itemType='Group' />
        );
    
        // Verify the kebab button is there
        expect(getByTestId('kebab-button')).toBeTruthy();
        // Press the kebab button
        fireEvent.press(getByTestId('kebab-button'));

        // Verify the edit and delete is displayed correctly
        expect(getByText('Edit')).toBeTruthy();
        expect(getByText('Delete')).toBeTruthy();

        // Press the edit button
        fireEvent.press(getByTestId('edit-button'));
    
        // Verify that navigation to EditGroupScreen screen has been called with groupID as its parameter 
        expect(mockNavigate).toHaveBeenCalledWith('EditGroupScreen', { groupID: 'group1' });
    });
    
    // Test to call deleteTask and navigates back when deletion is confirmed for Task
    it('should call deleteTask and navigates back when deletion is confirmed for Task', async () => {
        // Mock alert to find the destructive button and press the delete button
        Alert.alert.mockImplementationOnce((title, message, buttons) => {
            const destructiveButton = buttons.find(b => b.style === 'destructive');
            destructiveButton?.onPress?.();
        });
        // Mock deleteTask
        deleteTask.mockResolvedValueOnce();
        
        // Renders the Subheader component
        const { getByText, getByTestId } = render(
            <Subheader title='Task Title' hasKebab={true} itemID='task1' itemType='Task' />
        );
        
        // Verify the kebab button is there
        expect(getByTestId('kebab-button')).toBeTruthy();
        // Press the kebab button
        fireEvent.press(getByTestId('kebab-button'));

        // Verify the edit and delete is displayed correctly
        expect(getByText('Edit')).toBeTruthy();
        expect(getByText('Delete')).toBeTruthy();

        // Press the delete button
        fireEvent.press(getByTestId('delete-button'));
        
        
        await waitFor(() => {
            // Verify that deleteTask has been called
            expect(deleteTask).toHaveBeenCalledTimes(1);
            // Verify that deleteTask has been called with db and the taskID
            expect(deleteTask).toHaveBeenCalledWith(expect.any(Object), 'task1');
            // Verify that goBack was called once
            expect(mockGoBack).toHaveBeenCalledTimes(1);
        });
    });
    
    // Test to call deleteSubtask and navigates back when deletion is confirmed for Subtask
    it('should call deleteSubtask and navigates back when deletion is confirmed for Subtask', async () => {
        // Mock alert to find the destructive button and press the delete button
        Alert.alert.mockImplementationOnce((title, message, buttons) => {
            const destructiveButton = buttons.find(b => b.style === 'destructive');
            destructiveButton?.onPress?.();
        });
        // Mock deleteSubtask
        deleteSubtask.mockResolvedValueOnce();

        // Renders the Subheader component
        const { getByText, getByTestId } = render(
            <Subheader title='Subtask Title' hasKebab={true} itemID='subtask1' itemType='Subtask' />
        );
        
        // Verify the kebab button is there
        expect(getByTestId('kebab-button')).toBeTruthy();
        // Press the kebab button
        fireEvent.press(getByTestId('kebab-button'));

        // Verify the edit and delete is displayed correctly
        expect(getByText('Edit')).toBeTruthy();
        expect(getByText('Delete')).toBeTruthy();

        // Press the delete button
        fireEvent.press(getByTestId('delete-button'));
        
        
        await waitFor(() => {
            // Verify that deleteSubtask has been called
            expect(deleteSubtask).toHaveBeenCalledTimes(1);
            // Verify that deleteSubtask has been called with db and the subtaskID
            expect(deleteSubtask).toHaveBeenCalledWith(expect.any(Object), 'subtask1');
            // Verify that goBack was called once
            expect(mockGoBack).toHaveBeenCalledTimes(1);;
        });
    });
    
    // Test to call deleteGroup and navigates back when deletion is confirmed for Group
    it('should call deleteGroup and navigates back when deletion is confirmed for Group', async () => {
        // Mock alert to find the destructive button and press the delete button
        Alert.alert.mockImplementationOnce((title, message, buttons) => {
            const destructiveButton = buttons.find(b => b.style === 'destructive');
            destructiveButton?.onPress?.();
        });
        // Mock deleteGroup
        deleteGroup.mockResolvedValueOnce();
        
        // Renders the Subheader component
        const { getByText, getByTestId } = render(
            <Subheader title='Group Title' hasKebab={true} itemID='group1' itemType='Group' />
        );
        
        // Verify the kebab button is there
        expect(getByTestId('kebab-button')).toBeTruthy();
        // Press the kebab button
        fireEvent.press(getByTestId('kebab-button'));

        // Verify the edit and delete is displayed correctly
        expect(getByText('Edit')).toBeTruthy();
        expect(getByText('Delete')).toBeTruthy();

        // Press the delete button
        fireEvent.press(getByTestId('delete-button'));
        
        
        await waitFor(() => {
            // Verify that deleteGroup has been called
            expect(deleteGroup).toHaveBeenCalledTimes(1);
            // Verify that deleteGroup has been called with db and the groupID
            expect(deleteGroup).toHaveBeenCalledWith(expect.any(Object), 'group1');
            // Verify that goBack was called once
            expect(mockGoBack).toHaveBeenCalledTimes(1);;
        });
    });
    
    // Test to not call delete if Cancel is pressed
    it('should not call delete if Cancel is pressed', async () => {
        // Mock alert to find the cancel button and press the cancel button
        Alert.alert.mockImplementationOnce((title, message, buttons) => {
            const cancelButton = buttons.find(b => b.style === 'cancel');
            cancelButton?.onPress?.();
        });

        // Renders the Subheader component
        const { getByText, getByTestId } = render(
            <Subheader title='Task Title' hasKebab={true} itemID='task1' itemType='Task' />
        );
        
        // Verify the kebab button is there
        expect(getByTestId('kebab-button')).toBeTruthy();
        // Press the kebab button
        fireEvent.press(getByTestId('kebab-button'));

        // Verify the edit and delete is displayed correctly
        expect(getByText('Edit')).toBeTruthy();
        expect(getByText('Delete')).toBeTruthy();

        // Press the delete button
        fireEvent.press(getByTestId('delete-button'));
        
        // Verify that the deleteTask function was not called
        expect(deleteTask).not.toHaveBeenCalled();
            // Verify that goBack was called once
        expect(mockGoBack).not.toHaveBeenCalled();
    });

    // Test to close the kebab modal when the overlay is pressed
    it('should close the kebab modal when the overlay is pressed', async () => {
        // Renders the Subheader component
        const { getByText, getByTestId, queryByText, queryByTestId } = render(
            <Subheader title='Task Title' hasKebab={true} itemID='task1' itemType='Task' />
        );
    
        // Verify the kebab button is there
        expect(getByTestId('kebab-button')).toBeTruthy();
        // Press the kebab button
        fireEvent.press(getByTestId('kebab-button'));
    
        // Verify the edit and delete is displayed correctly
        expect(getByText('Edit')).toBeTruthy();
        expect(getByText('Delete')).toBeTruthy();

        // Press the kebab modal overlay
        fireEvent.press(getByTestId('kebab-TouchableWithoutFeedback'));

        await waitFor(() => {
            // Verify that the kebab modal is closed
            expect(queryByTestId('kebab-modal')).toBeNull();
            // Verify the edit and delete is not displayed
            expect(queryByText('Edit')).toBeNull();
            expect(queryByText('Delete')).toBeNull();
        });

    });
    
    // Test to show an alert if deletion fails
    it('should show an alert if deletion fails', async () => {
        Alert.alert.mockImplementationOnce((title, message, buttons) => {
            const destructiveButton = buttons.find(b => b.style === 'destructive');
            destructiveButton?.onPress?.();
        });
        // Mock deleteTask error
        deleteTask.mockRejectedValueOnce(new Error('Deletion failed'));
        
        // Renders the Subheader component
        const { getByText, getByTestId } = render(
            <Subheader title='Task Title' hasKebab={true} itemID='task1' itemType='Task' />
        );
        
        // Verify the kebab button is there
        expect(getByTestId('kebab-button')).toBeTruthy();
        // Press the kebab button
        fireEvent.press(getByTestId('kebab-button'));

        // Verify the edit and delete is displayed correctly
        expect(getByText('Edit')).toBeTruthy();
        expect(getByText('Delete')).toBeTruthy();

        // Press the delete button
        fireEvent.press(getByTestId('delete-button'));
        
        await waitFor(() => {
            // Verify that an error alert is shown to the user when there is an error deleting the item
            expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to delete the item.');
        });
        
    });

    // Snapshot test for Subheader when there is no kebab menu
    it('should match the snapshot when there is no kebab menu', () => {
        // Renders the Subheader component
        const { toJSON } = render(
            <Subheader title='Test Title' hasKebab={false} itemID='task1' itemType='Task' />
        );

        // Verify snapshot matches
        expect(toJSON()).toMatchSnapshot();
    });

    // Snapshot test for Subheader when there is a kebab menu
    it('should match the snapshot when there is a kebab menu', () => {
        // Renders the Subheader component
        const { toJSON } = render(
            <Subheader title='Task Title' hasKebab={true} itemID='task1' itemType='Task' />
        );

        // Verify snapshot matches
        expect(toJSON()).toMatchSnapshot();
    });
});
