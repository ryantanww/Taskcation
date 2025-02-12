// Import dependencies and libraries used in Edit Group Screen
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
import { useNavigation, useRoute } from '@react-navigation/native';
import Subheader from '../components/Subheader';
import DropDownPicker from 'react-native-dropdown-picker';
import { updateGroup, getGroupByID } from '../services/groupsService';
import { getAllGrades } from '../services/gradesService';
import { db } from '../../firebaseConfig';

const EditGroupScreen = () => {

    // Access the route  object to get the groupID passed from navigation
    const route = useRoute();
    const { groupID } = route.params;

    // Access the navigation object
    const navigation = useNavigation();
    
    // State for storing the group name 
    const [groupName, setGroupName] = useState('');

    const [groupType, setGroupType] = useState('');

    // State for storing the subject grade
    const [selectedGrade, setSelectedGrade] = useState('');

    // State for storing grade details
    const [grades, setGrades] = useState([]);

    // State for dropdown visibilities
    const [gradeOpen, setGradeOpen] = useState(false);

    // State for loading status
    const [loading, setLoading] = useState(true);

    // useEffect to initialise user and fetch grades on component mount
    useEffect(() => {
        const initialise = async () => {
            try {
                setLoading(true);
                // Fetch the group details from the Firebase database based on groupID
                if (groupID) {
                    const fetchedGroup = await getGroupByID(db, groupID);
                    if (fetchedGroup) {
                        // Store task details into their respective states
                        setGroupName(fetchedGroup.group_name);
                        setGroupType(fetchedGroup.group_type);

                        // If group has a grade, fetch it
                        if (fetchedGroup.grade_id) {
                            setSelectedGrade(fetchedGroup.grade_id);
                        }
                    }
                }
                // Fetch all grades from the database
                const allGrades = await getAllGrades(db);

                // Map grades to dropdown format
                setGrades(allGrades.map((grade) => ({ label: grade.grade, value: grade.id })));
            } catch (error) {
                // Log any errors when initialising user and grades
                console.error('Initialisation Group and Grades Error:', error);
                // Set error if initialising fails
                Alert.alert('Initialising Group and Grades Error', 'Failed to initialise group and grades.');
            } finally {
                setLoading(false);
            }
            
        }
        
        initialise();
    }, [groupID]);

    // Function to handle adding group into the database
    const handleUpdateGroup = async () => {
        // Validate if group name is entered
        if (!groupName) {
            // Alert error when group name is not entered
            Alert.alert('Incomplete Group', 'Please enter the Group Name.');
            return;
        }

        try {
            // Create a new group with the provided details and store it in the database
            await updateGroup(db, groupID, {
                group_name: groupName,
                grade_id:   selectedGrade  || 'NA',
            });

            // Alert success when group is updated successfully
            Alert.alert('Success', 'Group updated successfully!');
            // Navigate back to the previous screen
            navigation.goBack();
        } catch (error) {
            // Log any errors when updating group
            console.log('Error updating group:', error);
            // Alert error for group update 
            Alert.alert('Group Update Error', 'Failed to update the group.');
        }
    }

     // Display loading indicator if task are still loading
    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Loading group detail...</Text>
            </View>
        );
    }

    // Change the Button text depending on the group_type
    const updateButtonText = groupType === 'Subjects' ? 'Update Subject' : 'Update Category';

    return (
        <SafeAreaView style={styles.container}>
            {/* Header with back arrow and title */}
            <Subheader title='Edit Group' hasKebab={false}/>
            
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

                    {/* Render grades dropdown if group type is Subjects */}
                    { groupType === 'Subjects' && (
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
                                    placeholderStyle={styles.text}
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
            
            {/* Update Group button depending on group type */}
            <View style={styles.updateButtonContainer}>
                <TouchableOpacity style={styles.updateButton} onPress={handleUpdateGroup}>
                    <Text style={styles.updateButtonText}>{updateButtonText}</Text>
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
    // Style for the loadingContainer
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
    // Style for the updateButtonContainer
    updateButtonContainer: {
        alignItems: 'center',
        marginBottom: 10,
        padding: 10,
        backgroundColor: '#F5F5DC',
    },
    // Style for the updateButton
    updateButton: {
        backgroundColor: '#8B4513',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
    },
    // Style for the updateButtonText
    updateButtonText: {
        fontWeight: '800',
        color: '#F5F5DC',
        fontSize: 24,
    },
});

export default EditGroupScreen;