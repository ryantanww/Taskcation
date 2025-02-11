// Import dependencies and libraries used in Groups Screen
import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../components/Header';
import { getGroupsByCreator } from '../services/groupsService';
import { db } from '../../firebaseConfig';

const GroupsScreen = () => {
    // Access the navigation object
    const navigation = useNavigation();

    // Hook for rerendering the screen
    const isFocused = useIsFocused();

    // State for storing the groups 
    const [groups, setGroups] = useState([]);

    // State to store the current active tab based on the group type
    const [activeTab, setActiveTab] = useState('Subjects');

    // State to store user ID
    const [userID, setUserID] = useState(null);

    // State for loading status
    const [loading, setLoading] = useState(true);

    // useEffect to initialise user and fetch groups on component mount
    useEffect(() => {
        initialise();
    }, []);

    useEffect(() => {
        // Call the initialise function whenever isFocused changes
        if (isFocused) {
            initialise();
        }
    }, [isFocused]);

    // Function to initialise user and groups
    const initialise = async () => {
        try {
            // Retrieve the user ID from AsyncStorage
            const storedUserID = await AsyncStorage.getItem('user_id');
            // Set user ID in state
            setUserID(storedUserID);

            // Fetch user's groups from the database
            const userGroups = await getGroupsByCreator(db, storedUserID);
            // Map groups to dropdown format
            setGroups(userGroups);
        } catch (error) {
            // Log any errors when initialising groups
            console.error('Initialising Groups error:', error);
            // Set error if initialising fails
            Alert.alert('Initialising Groups Error', 'Failed to initialise Groups.');
        }  finally {
            // Set loading state to false
            setLoading(false);
        }
    }

    // Function to handle changing tabs
    const handleTabPress = (tabName) => {
        setActiveTab(tabName);
    };
    
    // Function to filter groups based on their group type
    const filteredGroups = groups.filter(
        (group) => group.group_type === activeTab
    );


    // Display loading indicator if groups are still loading
    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Loading groups detail...</Text>
            </View>
        );
    }

    // Change the Button text depending on the active tab
    const addButtonText = activeTab === 'Subjects' ? 'Add Subject' : 'Add Category';

    return (
        <SafeAreaView style={styles.container}>
            {/* Render the header component */}
            <Header />
            {/* Render the Subjects and Categories Tabs */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'Subjects' && styles.activeTab]}
                    onPress={() => handleTabPress('Subjects')}
                >
                    <Text style={[styles.tabText, activeTab === 'Subjects' && styles.activeTabText]}>Subjects</Text>
                </TouchableOpacity>
        
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'Categories' && styles.activeTab]}
                    onPress={() => handleTabPress('Categories')}
                >
                    <Text style={[styles.tabText, activeTab === 'Categories' && styles.activeTabText]}>Categories</Text>
                </TouchableOpacity>
            </View>
        
            {/* Render corresponding group types groups */}
            <ScrollView style={styles.scrollView}>
                {filteredGroups.map((group) => (
                    <TouchableOpacity
                        key={group.id}
                        style={styles.groupItem}
                        onPress={() => navigation.navigate('GroupDetailScreen', { groupID: group.id })}
                    >
                        <Text style={styles.groupItemText}>
                            {group.group_name}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Add Group button depending on group type */}
            <View style={styles.addContainer}>
                <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('AddGroupScreen', { group_type: activeTab})}>
                    <Text style={styles.addButtonText}>{addButtonText}</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
    
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
    // Style for the tabContainer
    tabContainer: {
        flexDirection: 'row',
        marginTop: 1,
    },
    // Style for the tab
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F5F5DC', 
        borderWidth: 2,
        borderColor: '#8B4513',
    },
    // Style for the activeTab
    activeTab: {
        backgroundColor: '#8B4513', 
    },
    // Style for the activeTabText
    activeTabText: {
        color: '#F5F5DC',
        fontSize: 24,
        fontWeight: '800',
    },
    // Style for the tabText
    tabText: {
        color: '#8B4513',
        fontSize: 24,
        fontWeight: 'bold',
    },
    // Style for the activeTabText
    activeTabText: {
        color: '#FFFFFF',
    },
    // Style for the addContainer
    addContainer: {
        paddingBottom: 16,
        paddingVertical: 12,
        paddingHorizontal: 10,
    },
    // Style for the addButton
    addButton: {
        backgroundColor: '#8B4513',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    // Style for the addButtonText
    addButtonText: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: '800',
    },
    // Style for the scrollView
    scrollView: {
        flexGrow: 1,
        paddingBottom: 16,
        paddingVertical: 12,
        paddingHorizontal: 10,
    },
    // Style for the groupItem
    groupItem: {
        alignItems: 'center',
        padding: 12,
        marginBottom: 8,
        borderWidth: 2,
        borderRadius: 8,
        borderColor: '#8B4513',
        backgroundColor: '#F5F5DC',
    },
    // Style for the groupItemText
    groupItemText: {
        fontSize: 20,
        color: '#8B4513',
        fontWeight: '500',
    },
    // Style for the text
    text: {
        color: '#8B4513',
        fontSize: 20,
        fontWeight: '500',
    },
});

export default GroupsScreen;