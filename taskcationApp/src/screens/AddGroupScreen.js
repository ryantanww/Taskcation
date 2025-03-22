// Import dependencies and libraries used in Add Group Screen
import React, { useEffect, useState } from 'react';
import {
    Text,
    View,
    TextInput,
    TouchableOpacity,
    Alert,
    TouchableWithoutFeedback,
    StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import Subheader from '../components/Subheader';
import DropDownPicker from 'react-native-dropdown-picker';
import { createGroup } from '../services/groupsService';
import { getAllGrades } from '../services/gradesService';
import { db } from '../../firebaseConfig';

const AddGroupScreen = () => {
    // Access the route  object to get the group_type passed from navigation
    const route = useRoute();
    const { group_type } = route.params;

    // Access the navigation object
    const navigation = useNavigation();
    
    // State to store user ID
    const [userID, setUserID] = useState(null);

    // State for storing the group name 
    const [groupName, setGroupName] = useState('');

    // State for storing the subject grade
    const [selectedGrade, setSelectedGrade] = useState('');

    // State for storing grade details
    const [grades, setGrades] = useState([]);

    // State for dropdown visibilities
    const [gradeOpen, setGradeOpen] = useState(false);

    // useEffect to initialise user and fetch grades on component mount
    useEffect(() => {
        const initialise = async () => {
            try {
                // Retrieve the user ID from AsyncStorage
                const storedUserID = await AsyncStorage.getItem('user_id');
                // Set user ID in state
                setUserID(storedUserID);

                // Fetch all grades from the database
                const allGrades = await getAllGrades(db);

                // Map grades to dropdown format
                setGrades(allGrades.map((grade) => ({ label: grade.grade, value: grade.id })));
            } catch (error) {
                // Log any errors when initialising user and grades
                console.error('Initialisation User and Grades Error:', error);
                // Set error if initialising fails
                Alert.alert('Initialising User and Grades Error', 'Failed to initialise user and grades.');
            }
        }
        
        initialise();

        // Reset all input fields when navigating away from the screen
        const resetStates = navigation.addListener('blur', () => {
            setGroupName('');
            setSelectedGrade('');
        });

        // Reset all states on component unmount
        return resetStates;
    }, [navigation]);

    // Function to handle adding group into the database
    const handleAddGroup = async () => {
        // Validate if group name is entered
        if (!groupName) {
            // Alert error when group name is not entered
            Alert.alert('Incomplete Group', 'Please enter the Group Name.');
            return;
        }

        try {
            // Create a new group with the provided details and store it in the database
            const groupID = await createGroup(db, {
                group_name: groupName,
                created_by: userID,
                group_type: group_type,
                grade_id:   selectedGrade  || 'NA',
            });

            // Reset all input fields after group creation is successful
            setGroupName('');
            setSelectedGrade('');

            // Alert success when group is created successfully
            Alert.alert('Success', 'Group created successfully!');
            // Navigate back to the previous screen
            navigation.goBack();
        } catch (error) {
            // Log any errors when creating group
            console.error('Error creating group:', error);
            // Alert error for group creation 
            Alert.alert('Group Creation Error', 'Failed to create the group.');
        }
    }

    // Change the Button text depending on the group_type
    const addButtonText = group_type === 'Subjects' ? 'Add Subject' : 'Add Category';

    return (
        <SafeAreaView style={styles.container}>
            {/* Header with back arrow and title */}
            <Subheader title='Add Group' hasKebab={false}/>
            
            {/* TouchableWithoutFeedback to allow pressing outside of the dropdowns to close the dropdowns */}
            <TouchableWithoutFeedback onPress={() =>  setGradeOpen(false)}>
                <View style={styles.contentContainer}>
                    {/* Group Name */}
                    <TextInput
                        style={styles.textInput}
                        placeholder='Group Name'
                        placeholderTextColor='#A5734D'
                        value={groupName}
                        onChangeText={setGroupName}
                    />

                    { group_type === 'Subjects' && (
                        <>
                            {/* Dropdown for Grades */}
                            <View style={styles.pickerContainer}>
                                <DropDownPicker
                                    open={gradeOpen}
                                    value={selectedGrade}
                                    items={grades}
                                    setOpen={setGradeOpen}
                                    setValue={setSelectedGrade}
                                    setItems={setGrades}
                                    placeholder='Grades'
                                    closeAfterSelecting={true}
                                    closeOnBackPressed={true}
                                    closeOnBlur={true}
                                    style={styles.dropdown}
                                    placeholderStyle={styles.placeholderText}
                                    textStyle={styles.text}
                                    dropDownContainerStyle={styles.dropdownContainer}
                                    listMode='SCROLLVIEW'
                                    maxHeight={200} 
                                />
                            </View>
                        </>
                    )}
                    
                </View>
            </TouchableWithoutFeedback>
            
            {/* Add Group button depending on group type */}
            <View style={styles.addButtonContainer}>
                <TouchableOpacity style={styles.addButton} onPress={handleAddGroup}>
                    <Text style={styles.addButtonText}>{addButtonText}</Text>
                </TouchableOpacity>
            </View>
            
        </SafeAreaView>
    );

};

const styles = StyleSheet.create({
    // Style for the container
    container: {
        flex: 1,
        backgroundColor: '#F5F5DC',
    },
    // Style for the contentContainer
    contentContainer: {
        flex: 1,
    },
    // Style for the textInput
    textInput: {
        borderWidth: 2,
        borderColor: '#8B4513',
        backgroundColor: '#F5F5DC',
        color: '#8B4513',
        borderRadius: 8,
        paddingHorizontal: 10,
        marginHorizontal: 16,
        marginTop: 12,
        height: 50,
        fontSize: 20,
        fontWeight: '500',
    },
    // Style for the text
    text: {
        color: '#8B4513',
        fontSize: 20,
        fontWeight: '500',
    },
    // Style for the placeholderText
    placeholderText: {
        color: '#A5734D',
        fontSize: 20,
        fontWeight: '500',
    },
    // Style for the pickerContainer
    pickerContainer: {
        marginHorizontal: 16,
        marginTop: 12,
    },
    // Style for the dropdownContainer
    dropdownContainer: {
        borderWidth: 2,
        borderColor: '#8B4513',
        backgroundColor: '#F5F5DC',
    },
    // Style for the dropdown
    dropdown: {
        borderWidth: 2,
        borderColor: '#8B4513',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 10,
        backgroundColor: '#F5F5DC',
    },
    // Style for the addButtonContainer
    addButtonContainer: {
        alignItems: 'center',
        marginBottom: 10,
        padding: 10,
        backgroundColor: '#F5F5DC',
    },
    // Style for the addButton
    addButton: {
        backgroundColor: '#8B4513',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
    },
    // Style for the addButtonText
    addButtonText: {
        fontWeight: '800',
        color: '#F5F5DC',
        fontSize: 24,
    },
});

export default AddGroupScreen;