// Import dependencies and libraries used for testing Add Group Screen
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AddGroupScreen from '../screens/AddGroupScreen';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createGroup } from '../services/groupsService';
import { getAllGrades } from '../services/gradesService';
import { Alert } from 'react-native'; 

// Array of mocked grades to do dropdown testing
const mockGrades = [
    { id: 'A', grade: 'A' },
    { id: 'B', grade: 'B' },
    { id: 'C', grade: 'C' },
    { id: 'D', grade: 'D' },
    { id: 'E', grade: 'E' },
    { id: 'F', grade: 'F' },
    { id: 'NA', grade: 'N/A' },
];

// Spy on Alert.alert to verify alerts
jest.spyOn(Alert, 'alert').mockImplementation(() => {});

// Mock useNavigation hook
const mockNavigation = {
    goBack: jest.fn(),
    addListener: jest.fn(() => {
        return () => {};
    }),
};
// Mock route parameter to be Subjects
let mockRoute = { params: { group_type: 'Subjects' } };

jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual('@react-navigation/native');
    return {
        ...actualNav,
        useNavigation: () => mockNavigation,
        useRoute: () => mockRoute,
    };
});



describe('AddGroupScreen', () => {
    // Clear all mocks and reset them before each test
    beforeEach(() => {
        createGroup.mockClear();
        createGroup.mockReset();
        getAllGrades.mockClear();
        getAllGrades.mockReset();
        jest.clearAllMocks();
        // Intialise the AsyncStorage with user_id and joined_date
        AsyncStorage.getItem.mockImplementation(async (key) => {
            if (key === 'user_id') {
                return 'temp_user_123';
            }
            return null;
        });
        // Mock required services
        getAllGrades.mockResolvedValue(mockGrades);
        mockRoute = { params: { group_type: 'Subjects' } };
    });

    // Test to render and show subjects information if group_type is Subjects
    it('should render and show subjects information if group_type is Subjects', async () => {

        // Renders the AddGroupScreen component
        const { getByText, getByPlaceholderText } = render(
            <NavigationContainer>
                <AddGroupScreen/>
            </NavigationContainer>
        );

        await waitFor(() => {
            // Verify that all components are rendered with the correct text
            expect(getByText('Add Group')).toBeTruthy();
            expect(getByPlaceholderText('Group Name')).toBeTruthy();
            expect(getByText('Grades')).toBeTruthy();
            expect(getByText('Add Subject')).toBeTruthy();
        });
    });

    // Test to render and show categories information if group_type is Categories
    it('should render and show categories information if group_type is Categories', async () => {
        // Mock the correct route parameter 
        mockRoute = { params: { group_type: 'Categories' } };

        // Renders the AddGroupScreen component
        const { getByText, getByPlaceholderText } = render(
            <NavigationContainer>
                <AddGroupScreen/>
            </NavigationContainer>
        );

        await waitFor(() => {
            // Verify that all components are rendered with the correct text
            expect(getByText('Add Group')).toBeTruthy();
            expect(getByPlaceholderText('Group Name')).toBeTruthy();
            expect(getByText('Add Category')).toBeTruthy();
        });
    });

    // Test to fetch grades on mount
    it('should fetch grades on mount', async () => {
        // Renders the AddGroupScreen component
        const { getByText, getByPlaceholderText } = render(
            <NavigationContainer>
                <AddGroupScreen/>
            </NavigationContainer>
        );

        await waitFor(() => {
            // Verify that Group Name and Grades are displayed correctly
            expect(getByPlaceholderText('Group Name')).toBeTruthy();
            expect(getByText('Grades')).toBeTruthy();
        });

        // Press on Grades
        fireEvent.press(getByText('Grades'));

        await waitFor(() => {
            // Verify that all the grades are rendered correctly in the dropdown
            expect(getByText('A')).toBeTruthy();
            expect(getByText('B')).toBeTruthy();
            expect(getByText('C')).toBeTruthy();
            expect(getByText('D')).toBeTruthy();
            expect(getByText('E')).toBeTruthy();
            expect(getByText('F')).toBeTruthy();
            expect(getByText('N/A')).toBeTruthy();
        });

        await waitFor(() => {
            // Verify that getAllGrades was called on mount
            expect(getAllGrades).toHaveBeenCalledTimes(1);
        });
    });

    // Test to create group with subject and grades and go back on success
    it('should create group with subject and grades and go back on success', async () => {
        // Mock createGroup success
        createGroup.mockResolvedValueOnce(true);

        // Renders the AddGroupScreen component
        const { getByText, getByPlaceholderText } = render(
            <NavigationContainer>
                <AddGroupScreen/>
            </NavigationContainer>
        );

        await waitFor(() => {
            // Verify that Group Name and Grades are displayed correctly
            expect(getByPlaceholderText('Group Name')).toBeTruthy();
            expect(getByText('Grades')).toBeTruthy();
        });

        // Change Group Name to Physics
        fireEvent.changeText(getByPlaceholderText('Group Name'), 'Physics');

        // Press on Grades
        fireEvent.press(getByText('Grades'));

        await waitFor(() => {
            // Verify that all the grades are rendered correctly in the dropdown
            expect(getByText('A')).toBeTruthy();
            expect(getByText('B')).toBeTruthy();
            expect(getByText('C')).toBeTruthy();
            expect(getByText('D')).toBeTruthy();
            expect(getByText('E')).toBeTruthy();
            expect(getByText('F')).toBeTruthy();
            expect(getByText('N/A')).toBeTruthy();
        });

        // Press on A
        fireEvent.press(getByText('A'));

        // Press on Add Subject
        fireEvent.press(getByText('Add Subject'));

        await waitFor(() => {
            // Verify createGroup was called once
            expect(createGroup).toHaveBeenCalledTimes(1);
            // Verify the group creation information
            expect(createGroup).toHaveBeenCalledWith(expect.anything(), {
                group_name: 'Physics',
                created_by: 'temp_user_123',
                group_type: 'Subjects',
                grade_id: 'A',
            });
            // Verify the success alert for group creation
            expect(Alert.alert).toHaveBeenCalledWith('Success', 'Group created successfully!');

            // Verify that the form resets after group creation
            expect(getByPlaceholderText('Group Name').props.value).toBe('');
            expect(getByText('Grades')).toBeTruthy();
            // Verify that goBack was called once
            expect(mockNavigation.goBack).toHaveBeenCalled();

        });
    });

    // Test to create group with category and grades and go back on success
    it('should create group with category and goes back on success', async () => {
        // Mock the correct route parameter 
        mockRoute = { params: { group_type: 'Categories' } };
        // Mock createGroup success
        createGroup.mockResolvedValueOnce(true);

        // Renders the AddGroupScreen component
        const { getByText, getByPlaceholderText } = render(
            <NavigationContainer>
                <AddGroupScreen/>
            </NavigationContainer>
        );

        await waitFor(() => {
            // Verify that Group Name is displayed correctly
            expect(getByPlaceholderText('Group Name')).toBeTruthy();
        }); 

        // Change Group Name to Personal
        fireEvent.changeText(getByPlaceholderText('Group Name'), 'Personal');

        // Press on Add Category
        fireEvent.press(getByText('Add Category'));

        await waitFor(() => {
            // Verify createGroup was called once
            expect(createGroup).toHaveBeenCalledTimes(1);
            // Verify the group creation information
            expect(createGroup).toHaveBeenCalledWith(expect.anything(), {
                group_name: 'Personal',
                created_by: 'temp_user_123',
                group_type: 'Categories',
                grade_id: 'NA', 
            });
            // Verify the success alert for group creation
            expect(Alert.alert).toHaveBeenCalledWith('Success', 'Group created successfully!');

            // Verify that the form resets after group creation
            expect(getByPlaceholderText('Group Name').props.value).toBe('');
            // Verify that goBack was called once
            expect(mockNavigation.goBack).toHaveBeenCalled();
        });
    });

    // Test to show an alert if failed to create group
    it('should show an alert if failed to create group', async () => {
        // Mock creating group error
        createGroup.mockRejectedValueOnce(new Error('Create Group Error'));

        // Renders the AddGroupScreen component
        const { getByText, getByPlaceholderText } = render(
            <NavigationContainer>
                <AddGroupScreen/>
            </NavigationContainer>
        );

        await waitFor(() => {
            // Verify that all components are rendered with the correct text
            expect(getByText('Add Group')).toBeTruthy();
            expect(getByPlaceholderText('Group Name')).toBeTruthy();
            expect(getByText('Grades')).toBeTruthy();
            expect(getByText('Add Subject')).toBeTruthy();
        });

        // Change Group Name to Fail Test
        fireEvent.changeText(getByPlaceholderText('Group Name'), 'Fail Test');

        // Press on Add Subject
        fireEvent.press(getByText('Add Subject'));

        await waitFor(() => {
            // Verify that an error alert is shown to the user when creating the group fails
            expect(Alert.alert).toHaveBeenCalledWith('Group Creation Error', 'Failed to create the group.');
        });
    });

    // Test to show an alert if Group Name is missing
    it('should show an alert if Group Name is missing', async () => {
        // Renders the AddGroupScreen component
        const { getByText, getByPlaceholderText } = render(
            <NavigationContainer>
                <AddGroupScreen/>
            </NavigationContainer>
        );

        await waitFor(() => {
            // Verify that all components are rendered with the correct text
            expect(getByText('Add Group')).toBeTruthy();
            expect(getByPlaceholderText('Group Name')).toBeTruthy();
            expect(getByText('Grades')).toBeTruthy();
            expect(getByText('Add Subject')).toBeTruthy();
        });

        // Press on Add Subject
        fireEvent.press(getByText('Add Subject'));

        // Verify that an error alert is shown to the user when there is no group name added
        expect(Alert.alert).toHaveBeenCalledWith('Incomplete Group', 'Please enter the Group Name.');
        // Verify createGroup was  not called
        expect(createGroup).not.toHaveBeenCalled();
    });

    // Test to show an alert if loading grades fails
    it('should shows an alert if loading grades fails', async () => {
        // Mock loading grades error
        getAllGrades.mockRejectedValueOnce(new Error('Grade fetch error'));

        // Renders the AddGroupScreen component
        render(
            <NavigationContainer>
                <AddGroupScreen/>
            </NavigationContainer>
        );

        await waitFor(() => {
            // Verify that an error alert is shown to the user when grades loading fails
            expect(Alert.alert).toHaveBeenCalledWith('Initialising User and Grades Error', 'Failed to initialise user and grades.');
        });
    });

    // Snapshot test for AddGroupScreen for subjects
    it('should match the snapshot for subjects', () => {
        // Renders the AddGroupScreen component
        const { toJSON } = render(
            <NavigationContainer>
                <AddGroupScreen />
            </NavigationContainer>
        );

        // Verify snapshot matches
        expect(toJSON()).toMatchSnapshot();
    });

    // Snapshot test for AddGroupScreen for categories
    it('should match the snapshot for categories', () => {
        // Mock the correct route parameter 
        mockRoute = { params: { group_type: 'Categories' } };

        // Renders the AddGroupScreen component
        const { toJSON } = render(
            <NavigationContainer>
                <AddGroupScreen />
            </NavigationContainer>
        );

        // Verify snapshot matches
        expect(toJSON()).toMatchSnapshot();
    });
});