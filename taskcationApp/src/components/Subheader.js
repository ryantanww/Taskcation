// Import dependencies and libraries used in Subheader
import React, { useState } from 'react';
import { 
    View, 
    Text, 
    TouchableOpacity, 
    StyleSheet, 
    Modal, 
    Alert,
    TouchableWithoutFeedback,
} from 'react-native';
import { useNavigation } from '@react-navigation/native'; 
import Ionicons from '@expo/vector-icons/Ionicons';
import { deleteTask } from '../services/taskService';
import { deleteGroup } from '../services/groupsService';
import { deleteSubtask } from '../services/subtaskService';
import { db } from '../../firebaseConfig';

const Subheader = ({ title, hasKebab = false, itemID, itemType }) => {
    // Access the navigation object
    const navigation = useNavigation();
    
    // State to control the kebab menu modal
    const [menuVisible, setMenuVisible] = useState(false);

    // Function to handle editing the component
    const handleEdit = () => {
        // Close the kebab menu
        setMenuVisible(false);

        // Navigate to corresponding edit screen
        if (itemType === 'Task') {
            navigation.navigate('EditTaskScreen', { taskID: itemID });
        } else if (itemType === 'Subtask') {
            navigation.navigate('EditSubtaskScreen', { subtaskID: itemID });
        } else if (itemType === 'Group') {
            navigation.navigate('EditGroupScreen', { groupID: itemID });
        }
    };

    // Function to handle deleting item with a confirmation alert
    const handleDelete = async () => {
        // Close the kebab menu
        setMenuVisible(false);
        
        Alert.alert(
            'Confirm Delete',
            `Are you sure you want to delete '${title}'?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Delete', 
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            // Delete the corresponding item from database
                            if (itemType === 'Task') {
                                await deleteTask(db, itemID);
                            } else if (itemType === 'Subtask') {
                                await deleteSubtask(db, itemID);
                            } else if (itemType === 'Group') {
                                await deleteGroup(db, itemID);
                            }
                            // Log the successful deletion
                            console.log(`${itemType} with ID ${itemID} deleted successfully`);
                            // Navigate back to the previous screen
                            navigation.goBack();
                        } catch (error) {
                            // Log error in deleting item
                            console.error('Error deleting item:', error);
                            // Alert error when failed to delete item
                            Alert.alert('Error', 'Failed to delete the item.');
                        }
                    }
                }
            ]
        );
    };

    return (
        // Subheader component
        <View style={styles.container}>
            {/* Back button */}
            <TouchableOpacity onPress={() => navigation.goBack()} testID='back-button'>
                <Ionicons name='arrow-back' size={32} color='#F5F5DC' />
            </TouchableOpacity>

            {/* Title text, truncated if too long */}  
            <Text style={styles.title} numberOfLines={1} ellipsizeMode='tail'>{title}</Text>

            {/* Kebab menu button, shown only if hasKebab is true */}
            {hasKebab ? (
                <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.kebabIcon} testID='kebab-button'>
                    <Ionicons name='ellipsis-vertical' size={24} color='#F5F5DC' />
                </TouchableOpacity>
            ) : (
                <View style={styles.emptySpace} />
            )}

            {/* Kebab Menu Modal */}
            <Modal
                visible={menuVisible}
                transparent
                animationType='fade'
                onRequestClose={() => setMenuVisible(false)}
                testID='kebab-modal'
            >
                {/* TouchableWithoutFeedback to allow pressing outside of the overlay to close the modal */}
                <TouchableWithoutFeedback onPress={() => setMenuVisible(false)} testID='kebab-TouchableWithoutFeedback'>
                    <View style={styles.modalOverlay}>
                        {/* TouchableWithoutFeedback to not close the modal when pressing within the overlay */}
                        <TouchableWithoutFeedback>
                            <View style={styles.menuContainer}>
                                {/* Edit button */}
                                <TouchableOpacity style={styles.menuItem} onPress={handleEdit} testID='edit-button'>
                                    <Text style={styles.menuText}>Edit</Text>
                                    <Ionicons name='pencil' size={22} color='#8B4513' />
                                </TouchableOpacity>
                                {/* Divider Line */}
                                <View style={styles.line} />
                                {/* Delete button */}
                                <TouchableOpacity style={styles.menuItem} onPress={handleDelete} testID='delete-button'>
                                    <Text style={[styles.menuText, { color: 'red' }]}>Delete</Text>
                                    <Ionicons name='trash' size={22} color='red' />
                                </TouchableOpacity>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    // Style for the container
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#8B4513',
        padding: 16,
    },
    // Style for the title
    title: {
        flex: 1,
        fontSize: 32,
        fontWeight: '800',
        color: '#F5F5DC',
        textAlign: 'center',
    },
    // Style for the kebabIcon
    kebabIcon: {
        padding: 8,
    },
    // Style for the modalOverlay
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Style for the menuContainer
    menuContainer: {
        position: 'absolute',
        top: 0,
        right: 0, 
        backgroundColor: '#F5F5DC',
        padding: 12,
        borderRadius: 8,
        width: 150,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#8B4513'
    },
    // Style for the menuItem
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        width: '100%',
        borderRadius: 8,
    },
    // Style for the menuText
    menuText: {
        fontSize: 24,
        color: '#8B4513',
        fontWeight: '500',
    },
    // Style for the emptySpace
    emptySpace: {
        width: 50,
    },
    // Style for the line
    line: {
        height: 2,
        width: '100%',
        backgroundColor: '#8B4513',
        marginVertical: 8,
    }
});

export default Subheader;
