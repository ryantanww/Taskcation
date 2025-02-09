// Import dependencies and libraries used for testing Edit Group Screen
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import EditGroupScreen from '../screens/EditGroupScreen';
import { updateGroup, getGroupByID } from '../services/groupsService';
import { getAllGrades } from '../services/gradesService';
import { Alert } from 'react-native'; 

// Mock Subject
const mockSubject = {
    id: 'group1',
    group_name: 'Test Edit Subject',
    group_type: 'Subjects',
    grade_id: 'A',
};

// Mock Category
const mockCategory = {
    id: 'group2',
    group_name: 'Test Edit Category',
    group_type: 'Categories',
};

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
// Mock route parameter to be group1
let mockRoute = { params: { groupID: 'group1' } };

jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual('@react-navigation/native');
    return {
        ...actualNav,
        useNavigation: () => mockNavigation,
        useRoute: () => mockRoute,
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

describe('EditGroupScreen', () => {
    // Clear all mocks and reset them before each test
    beforeEach(() => {
        updateGroup.mockClear();
        updateGroup.mockReset();
        getGroupByID.mockClear();
        getGroupByID.mockReset();
        getAllGrades.mockClear();
        getAllGrades.mockReset();
        jest.clearAllMocks();
        // Mock required services
        getGroupByID.mockResolvedValue(mockSubject);
        getAllGrades.mockResolvedValue(mockGrades);
        mockRoute = { params: { groupID: 'group1' } };
    });

    // Test to render and show subjects information if group_type is Subjects
    it('should render and show subjects information if group_type is Subjects', async () => {
        // Renders the EditGroupScreen component
        const { getByText, getByDisplayValue } = render(
            <NavigationContainer>
                <EditGroupScreen/>
            </NavigationContainer>
        );

        await waitFor(() => {
            // Verify that all components are rendered with the correct text
            expect(getByText('Edit Group')).toBeTruthy();
            expect(getByDisplayValue('Test Edit Subject')).toBeTruthy();
            expect(getByText('A')).toBeTruthy();
            expect(getByText('Update Subject')).toBeTruthy();
        });
    });

    // Test to render and show categories information if group_type is Categories
    it('should render and show categories information if group_type is Categories', async () => {
        // Mock the correct route parameter 
        mockRoute = { params: { groupID: 'group2' } };
        // Mock the correct group as category
        getGroupByID.mockResolvedValue(mockCategory);

        // Renders the EditGroupScreen component
        const { getByText, getByDisplayValue } = render(
            <NavigationContainer>
                <EditGroupScreen/>
            </NavigationContainer>
        );

        await waitFor(() => {
            // Verify that all components are rendered with the correct text
            expect(getByText('Edit Group')).toBeTruthy();
            expect(getByDisplayValue('Test Edit Category')).toBeTruthy();
            expect(getByText('Update Category')).toBeTruthy();
        });
    });

    // Test to fetch grades on mount
    it('should fetch grades on mount', async () => {
        // Renders the EditGroupScreen component
        const { getByText, getAllByText, getByDisplayValue } = render(
            <NavigationContainer>
                <EditGroupScreen/>
            </NavigationContainer>
        );

        await waitFor(() => {
            // Verify that Group Name and Grades are displayed correctly
            expect(getByDisplayValue('Test Edit Subject')).toBeTruthy();
            expect(getAllByText('A')).toBeTruthy();
        });

        // Press on Grades
        fireEvent.press(getByText('A'));

        await waitFor(() => {
            // Verify that all the grades are rendered correctly in the dropdown
            expect(getAllByText('A')).toBeTruthy();
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

    // Test to update group with subject and grades and go back on success
    it('should update group with subject and grades and go back on success', async () => {
        // Mock updateGroup success
        updateGroup.mockResolvedValueOnce(true);

        // Renders the EditGroupScreen component
        const { getByText, getByDisplayValue, getAllByText } = render(
            <NavigationContainer>
                <EditGroupScreen/>
            </NavigationContainer>
        );

        await waitFor(() => {
            // Verify that Group Name and Grades are displayed correctly
            expect(getByText('Edit Group')).toBeTruthy();
            expect(getByDisplayValue('Test Edit Subject')).toBeTruthy();
            expect(getByText('A')).toBeTruthy();
            expect(getByText('Update Subject')).toBeTruthy();
        });

        // Change Group Name to Updated Subject Name
        fireEvent.changeText(getByDisplayValue('Test Edit Subject'), 'Updated Subject Name');

        // Press on Grades
        fireEvent.press(getByText('A'));

        await waitFor(() => {
            // Verify that all the grades are rendered correctly in the dropdown
            expect(getAllByText('A')).toBeTruthy();
            expect(getByText('B')).toBeTruthy();
            expect(getByText('C')).toBeTruthy();
            expect(getByText('D')).toBeTruthy();
            expect(getByText('E')).toBeTruthy();
            expect(getByText('F')).toBeTruthy();
            expect(getByText('N/A')).toBeTruthy();
        });

        // Press on B
        fireEvent.press(getByText('B'));

        // Press on Update Subject
        fireEvent.press(getByText('Update Subject'));

        await waitFor(() => {
            // Verify updateGroup was called once
            expect(updateGroup).toHaveBeenCalledTimes(1);
            // Verify the group update information
            expect(updateGroup).toHaveBeenCalledWith(expect.anything(), 'group1', {
                group_name: 'Updated Subject Name',
                grade_id: 'B',
            });
            // Verify the success alert for group update
            expect(Alert.alert).toHaveBeenCalledWith('Success', 'Group updated successfully!');

            // Verify that goBack was called once
            expect(mockNavigation.goBack).toHaveBeenCalled();

        });
    });

    // Test to update group with category and grades and go back on success
    it('should update group with category and goes back on success', async () => {
        // Mock the correct route parameter 
        mockRoute = { params: { groupID: 'group2' } };
        // Mock the correct group as category
        getGroupByID.mockResolvedValue(mockCategory);

        // Mock updateGroup success
        updateGroup.mockResolvedValueOnce(true);

        // Renders the EditGroupScreen component
        const { getByText, getByDisplayValue } = render(
            <NavigationContainer>
                <EditGroupScreen/>
            </NavigationContainer>
        );

        await waitFor(() => {
            // Verify that Group Name is displayed correctly
            expect(getByText('Edit Group')).toBeTruthy();
            expect(getByDisplayValue('Test Edit Category')).toBeTruthy();
            expect(getByText('Update Category')).toBeTruthy();
        }); 

        // Change Group Name to Updated Subject Category
        fireEvent.changeText(getByDisplayValue('Test Edit Category'), 'Updated Subject Category');

        // Press on Update Category
        fireEvent.press(getByText('Update Category'));

        await waitFor(() => {
            // Verify updateGroup was called once
            expect(updateGroup).toHaveBeenCalledTimes(1);
            // Verify the group update information
            expect(updateGroup).toHaveBeenCalledWith(expect.anything(), 'group2', {
                group_name: 'Updated Subject Category',
                grade_id: 'NA', 
            });
            // Verify the success alert for group update
            expect(Alert.alert).toHaveBeenCalledWith('Success', 'Group updated successfully!');

            // Verify that goBack was called once
            expect(mockNavigation.goBack).toHaveBeenCalled();
        });
    });

    // Test to render loading indicator initially
    it('should render loading indicator initially', async () => {
        // Renders the EditGroupScreen component
        const { getByText } = render(
            <NavigationContainer>
                <EditGroupScreen />
            </NavigationContainer>
        );

        // Verify the Loading group detail... is displayed
        expect(getByText('Loading group detail...')).toBeTruthy();
    });

    // Test to show an alert if failed to update group
    it('should show an alert if failed to update group', async () => {
        // Mock updating group error
        updateGroup.mockRejectedValueOnce(new Error('Update Group Error'));

        // Renders the EditGroupScreen component
        const { getByText, getByDisplayValue } = render(
            <NavigationContainer>
                <EditGroupScreen/>
            </NavigationContainer>
        );

        await waitFor(() => {
            // Verify that all components are rendered with the correct text
            expect(getByText('Edit Group')).toBeTruthy();
            expect(getByDisplayValue('Test Edit Subject')).toBeTruthy();
            expect(getByText('A')).toBeTruthy();
            expect(getByText('Update Subject')).toBeTruthy();
        });

        // Change Group Name to Fail edit group
        fireEvent.changeText(getByDisplayValue('Test Edit Subject'), 'Fail edit group');

        // Press on Update Subject
        fireEvent.press(getByText('Update Subject'));

        await waitFor(() => {
            // Verify that an error alert is shown to the user when updating the group fails
            expect(Alert.alert).toHaveBeenCalledWith('Group Update Error', 'Failed to update the group.');
        });
    });


    // Test to show an alert if Group Name is missing
    it('should show an alert if Group Name is missing', async () => {
        // Renders the EditGroupScreen component
        const { getByText, getByDisplayValue } = render(
            <NavigationContainer>
                <EditGroupScreen/>
            </NavigationContainer>
        );

        await waitFor(() => {
            // Verify that all components are rendered with the correct text
            expect(getByText('Edit Group')).toBeTruthy();
            expect(getByDisplayValue('Test Edit Subject')).toBeTruthy();
            expect(getByText('A')).toBeTruthy();
            expect(getByText('Update Subject')).toBeTruthy();
        });

        // Clear group name
        fireEvent.changeText(getByDisplayValue('Test Edit Subject'), '');

        // Press on Update Subject
        fireEvent.press(getByText('Update Subject'));

        // Verify that an error alert is shown to the user when there is no group name added
        expect(Alert.alert).toHaveBeenCalledWith('Incomplete Group', 'Please enter the Group Name.');
        // Verify updateGroup was  not called
        expect(updateGroup).not.toHaveBeenCalled();
    });

    // Test to show an alert if loading grades fails
    it('should shows an alert if loading grades fails', async () => {
        // Mock loading grades error
        getAllGrades.mockRejectedValueOnce(new Error('Grade fetch error'));

        // Renders the EditGroupScreen component
        render(
            <NavigationContainer>
                <EditGroupScreen/>
            </NavigationContainer>
        );

        await waitFor(() => {
            // Verify that an error alert is shown to the user when grades loading fails
            expect(Alert.alert).toHaveBeenCalledWith('Initialising Group and Grades Error', 'Failed to initialise group and grades.');
        });
    });

    // Snapshot test for EditGroupScreen for subjects
    it('should match the snapshot for subjects', () => {
        // Renders the EditGroupScreen component
        const { toJSON } = render(
            <NavigationContainer>
                <EditGroupScreen />
            </NavigationContainer>
        );

        // Verify snapshot matches
        expect(toJSON()).toMatchSnapshot();
    });

    // Snapshot test for EditGroupScreen for categories
    it('should match the snapshot for categories', () => {
        // Mock the correct route parameter 
        mockRoute = { params: { groupID: 'group2' } };
        // Mock the correct group as category
        getGroupByID.mockResolvedValue(mockCategory);

        // Renders the EditGroupScreen component
        const { toJSON } = render(
            <NavigationContainer>
                <EditGroupScreen />
            </NavigationContainer>
        );

        // Verify snapshot matches
        expect(toJSON()).toMatchSnapshot();
    });

});