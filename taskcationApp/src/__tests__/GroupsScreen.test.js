// Import dependencies and libraries used for testing Groups Screen
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import GroupsScreen from '../screens/GroupsScreen';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getGroupsByCreator } from '../services/groupsService';
import { Alert } from 'react-native'; 

// Array of mocked groups
const mockGroups = [
    { id: '1', group_name: 'Math', group_type: 'Subjects', created_by: 'temp_user_123' },
    { id: '2', group_name: 'General', group_type: 'Categories', created_by: 'temp_user_123' },
];

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual('@react-navigation/native');
    return {
        ...actualNav,
        useNavigation: () => ({
            navigate: mockNavigate,
        }),
    };
});

// Spy on Alert.alert
jest.spyOn(Alert, 'alert').mockImplementation(() => {});

describe('GroupsScreen', () => {
    beforeEach(() => {
        getGroupsByCreator.mockClear();
        getGroupsByCreator.mockReset();
        jest.clearAllMocks();
        // Intialise the AsyncStorage with user_id and joined_date
        AsyncStorage.getItem.mockImplementation(async (key) => {
            if (key === 'user_id') {
                return 'temp_user_123';
            }
            return null;
        });
        // Mock groups
        getGroupsByCreator.mockResolvedValue(mockGroups);
    });

    // Test to check if user ID is stored in AsyncStorage
    it('should store user ID in AsyncStorage', async () => {
        // Retrieve the user ID
        const userId = await AsyncStorage.getItem('user_id');
        // Verify that the user ID is correctly stored
        expect(userId).toBe('temp_user_123');
    });

    // Test to load groups on mount
    it('should load groups on mount', async () => {
        // Renders the GroupsScreen component
        const { getByText, queryByText } = render(
            <NavigationContainer>
                <GroupsScreen />
            </NavigationContainer>
        );

        await waitFor(() => {
            // Verify that all components are displayed correctly
            expect(getByText('Subjects')).toBeTruthy();
            expect(getByText('Categories')).toBeTruthy();
            expect(getByText('Math')).toBeTruthy();
            expect(getByText('Add Subject')).toBeTruthy();
            expect(queryByText('General')).toBeNull();
            expect(queryByText('Add Category')).toBeNull();
        });

    });

    // Test to switch tabs and filters groups correctly
    it('should switch tabs and filters groups correctly', async () => {
        // Renders the GroupsScreen component
        const { getByText, queryByText } = render(
            <NavigationContainer>
                <GroupsScreen />
            </NavigationContainer>
        );

        await waitFor(() => {
            // Verify that all components are displayed correctly
            expect(getByText('Subjects')).toBeTruthy();
            expect(getByText('Categories')).toBeTruthy();
            expect(getByText('Math')).toBeTruthy();
            expect(getByText('Add Subject')).toBeTruthy();
            expect(queryByText('General')).toBeNull();
            expect(queryByText('Add Category')).toBeNull();
        });

        // Press on Categories tab
        fireEvent.press(getByText('Categories'));

        await waitFor(() => {
            // Verify that all components are displayed correctly after clicking Categories
            expect(getByText('Subjects')).toBeTruthy();
            expect(getByText('Categories')).toBeTruthy();
            expect(getByText('General')).toBeTruthy();
            expect(getByText('Add Category')).toBeTruthy();
            expect(queryByText('Math')).toBeNull();
            expect(queryByText('Add Subject')).toBeNull();
        });

        // Press on Subjects tab
        fireEvent.press(getByText('Subjects'));

        await waitFor(() => {
            // Verify that all components are displayed correctly after clicking Subjects
            expect(getByText('Subjects')).toBeTruthy();
            expect(getByText('Categories')).toBeTruthy();
            expect(getByText('Math')).toBeTruthy();
            expect(getByText('Add Subject')).toBeTruthy();
            expect(queryByText('General')).toBeNull();
            expect(queryByText('Add Category')).toBeNull();
        });
    });

    // Test to navigate to GroupDetailScreen when a group is pressed
    it('should navigate to GroupDetailScreen when a group is pressed', async () => {
        // Renders the GroupsScreen component
        const { getByText } = render(
            <NavigationContainer>
                <GroupsScreen />
            </NavigationContainer>
        );

        await waitFor(() => {
            // Verify Math is displayed correctly
            expect(getByText('Math')).toBeTruthy();
        });

        // Press on Math
        fireEvent.press(getByText('Math'));

        // Verify that navigation to GroupDetailScreen screen has been called with groupID as its parameter 
        expect(mockNavigate).toHaveBeenCalledWith('GroupDetailScreen', { groupID: '1' });

        // Press on Categories tab
        fireEvent.press(getByText('Categories'));

        await waitFor(() => {
            // Verify General is displayed correctly
            expect(getByText('General')).toBeTruthy();
        });

        // Press on General
        fireEvent.press(getByText('General'));

        // Verify that navigation to GroupDetailScreen screen has been called with groupID as its parameter 
        expect(mockNavigate).toHaveBeenCalledWith('GroupDetailScreen', { groupID: '2' });

    });

    // Test to navigate to AddGroupScreen with correct group_type parameter
    it('should navigate to AddGroupScreen with correct group_type parameter', async () => {
        // Mock empty groups
        getGroupsByCreator.mockResolvedValue([]);

        // Renders the GroupsScreen component
        const { getByText } = render(
            <NavigationContainer>
                <GroupsScreen />
            </NavigationContainer>
        );

        await waitFor(() => {
            // Verify Add Subject is displayed correctly
            expect(getByText('Add Subject')).toBeTruthy();
        });

        // Press on Add Subject
        fireEvent.press(getByText('Add Subject'));

        // Verify that navigation to AddGroupScreen screen has been called with group_type as its parameter 
        expect(mockNavigate).toHaveBeenCalledWith('AddGroupScreen', { group_type: 'Subjects' });

        // Press on Categories tab
        fireEvent.press(getByText('Categories'));

        await waitFor(() => {
            // Verify Add Category is displayed correctly
            expect(getByText('Add Category')).toBeTruthy();
        });

        // Press on Add Category
        fireEvent.press(getByText('Add Category'));

        // Verify that navigation to AddGroupScreen screen has been called with group_type as its parameter 
        expect(mockNavigate).toHaveBeenCalledWith('AddGroupScreen', { group_type: 'Categories' });
    });

    // Test to render loading indicator initially
    it('should renders loading state initially', async () => {
        // Mock empty groups
        getGroupsByCreator.mockResolvedValue([]);
    
        // Renders the GroupsScreen component
        const { getByText } = render(
            <NavigationContainer>
                <GroupsScreen />
            </NavigationContainer>
        );

        // Verify the Loading groups detail... is displayed
        expect(getByText('Loading groups detail...')).toBeTruthy();
    });

    // Test to show an alert if loading groups fails
    it('should show an alert if loading groups fails', async () => {
        // Mock loading group error
        getGroupsByCreator.mockRejectedValueOnce(new Error('Groups Initialisation Error'));
    
        // Renders the GroupsScreen component
        render(
            <NavigationContainer>
                <GroupsScreen />
            </NavigationContainer>
        );
    
        await waitFor(() => {
            // Verify that an error alert is shown to the user when group loading fails
            expect(Alert.alert).toHaveBeenCalledWith('Initialising Groups Error', 'Failed to initialise Groups.');
        });
    });

    // Snapshot test for GroupsScreen when Subjects tab is active
    it('should match the snapshot when Subjects tab is active', async () => {
        // Renders the GroupsScreen component
        const { toJSON, getByText, queryByText } = render(
            <NavigationContainer>
                <GroupsScreen />
            </NavigationContainer>
        );

        await waitFor(() => {
            // Verify that all components are displayed correctly
            expect(getByText('Subjects')).toBeTruthy();
            expect(getByText('Categories')).toBeTruthy();
            expect(getByText('Math')).toBeTruthy();
            expect(getByText('Add Subject')).toBeTruthy();
            expect(queryByText('General')).toBeNull();
            expect(queryByText('Add Category')).toBeNull();
        });

        // Verify snapshot matches
        expect(toJSON()).toMatchSnapshot();
    });

    // Snapshot test for GroupsScreen when Categories tab is active
    it('should match the snapshot when Categories tab is active', async () => {
        // Renders the GroupsScreen component
        const { toJSON, getByText, queryByText } = render(
            <NavigationContainer>
                <GroupsScreen />
            </NavigationContainer>
        );

        await waitFor(() => {
            // Verify that all components are displayed correctly
            expect(getByText('Subjects')).toBeTruthy();
            expect(getByText('Categories')).toBeTruthy();
            expect(getByText('Math')).toBeTruthy();
            expect(getByText('Add Subject')).toBeTruthy();
            expect(queryByText('General')).toBeNull();
            expect(queryByText('Add Category')).toBeNull();
        });

        // Press on Categories tab
        fireEvent.press(getByText('Categories'));

        await waitFor(() => {
            // Verify that all components are displayed correctly after clicking Categories
            expect(getByText('Subjects')).toBeTruthy();
            expect(getByText('Categories')).toBeTruthy();
            expect(getByText('General')).toBeTruthy();
            expect(getByText('Add Category')).toBeTruthy();
            expect(queryByText('Math')).toBeNull();
            expect(queryByText('Add Subject')).toBeNull();
        });

        // Verify snapshot matches
        expect(toJSON()).toMatchSnapshot();
    });
});