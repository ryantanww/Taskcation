// Import dependencies and libraries used in Add Attachments
import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    TouchableWithoutFeedback,
    StyleSheet,
    Alert,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';

const AddAttachment = ({ attachments, onAttachmentsChange }) => {
    // State to control the add attachment modal
    const [addAttachmentModalVisible, setAddAttachmentModalVisible] = useState(false);

    // State to control the recording modal
    const [recordingModalVisible, setRecordingModalVisible] = useState(false);

    // State to store the current recording instance
    const [recording, setRecording] = useState(null);

    // State for tracking if recording is in progress
    const [isRecording, setIsRecording] = useState(false);

    // State for tracking if recording is paused
    const [isPaused, setIsPaused] = useState(false);

    // State for recording duration timer
    const [timer, setTimer] = useState(0);

    // Ref for managing the timer interval
    const intervalRef = useRef(null);

    // Function to format the dates into dd/mm/yyyy HH:MM:SS format
    const formatDate = (date) => {
        const formattedDate = new Date(date).toLocaleDateString('en-GB', 
        {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
        // Remove the comma between the date and time
        return formattedDate.replace(', ', '-');
    }

    // Function to add a new attachment to the current list and notify the parent component
    const addAttachment = (newAttachment) => {
        const updated = [...attachments, newAttachment];
        onAttachmentsChange(updated);
    };


    // Function to pick a file using the document picker and add it as an attachment
    const addFileAttachment = async () => {
        try {
            // Open document picker
            const result = await DocumentPicker.getDocumentAsync({
                copyToCacheDirectory: true
            });

            // If user did not cancel
            if (!result.canceled) {
                // Get the selected file
                const file = result.assets[0];
                // Store the file with the necessary information
                const newAttachment = {
                    uri: file.uri,
                    file_name: file.name,
                    file_type: file.mimeType,
                    size: file.size
                };
                // Add the file attachment as an attachment
                addAttachment(newAttachment);
            }
        } catch (error) {
            // Log any errors when picking document
            console.log('Error picking document:', error);
            // Alert error when picking document
            Alert.alert('File Error', 'Error picking document.');
        } finally {
            // Close the add attachment modal
            setAddAttachmentModalVisible(false);
        }
    };

    // Function to handle image capture using the cameraa
    const addCameraAttachment = async () => {
        try {
            // Request camera permissions
            const permission = await ImagePicker.requestCameraPermissionsAsync();
            // If permission is not granted
            if (!permission.granted) {
                // Alert error when permission is denied
                Alert.alert('Permission Error', 'Camera access is required.');
                return;
            }
            // Open the camera
            const result = await ImagePicker.launchCameraAsync();
            // If user did not cancel
            if (!result.canceled) {
                // Get the captured image
                const image = result.assets[0];
                // Store the image with the necessary information
                const newAttachment = {
                    uri: image.uri,
                    file_name: image.fileName,
                    file_type: image.mimeType,
                    size: image.size
                };
                // Add the image attachment as an attachment
                addAttachment(newAttachment);
            }
        } catch (error) {
            // Log any errors when opening camera
            console.log('Error opening camera:', error);
            // Alert error when opening camera
            Alert.alert('Camera Error', 'Error opening camera.');

        } finally {
            // Close the add attachment modal
            setAddAttachmentModalVisible(false);
        }
    };

    // Function to add image from the gallery
    const addGalleryAttachment = async () => {
        try {
            // Request gallery permissions
            const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
            // If permission is not granted
            if (!permission.granted) {
                // Alert error when permission is denied
                Alert.alert('Permission Error', 'Gallery access is required.');
                return;
            }
            // Launch the gallery
            const result = await ImagePicker.launchImageLibraryAsync();
            // If user did not cancel
            if (!result.canceled) {
                // Get the selected image
                const image = result.assets[0];
                // Store the image with the necessary information
                const newAttachment = {
                    uri: image.uri,
                    file_name: image.fileName,
                    file_type: image.mimeType,
                    size: image.size
                };
                // Add the image attachment as an attachment
                addAttachment(newAttachment);
            }
        } catch (error) {
            // Log any errors when opening gallery
            console.log('Error opening gallery:', error);
            // Alert error when opening gallery
            Alert.alert('Gallery Error', 'Error opening gallery.');

        } finally {
            // Close the add attachment modal
            setAddAttachmentModalVisible(false);
        }
    };

    // Function to start audio recording.
    const startRecording = async () => {
        // Request audio recording permissions
        const permission = await Audio.requestPermissionsAsync();
        // If permission is not granted
        if (!permission.granted) {
            // Alert error when permission is denied
            Alert.alert('Permission Error', 'Audio recording access is required.');
            return;
        }

        // Create recording with high quality settings
        const { recording } = await Audio.Recording.createAsync(
            Audio.RecordingOptionsPresets.HIGH_QUALITY
        );
        // Store the recording instance
        setRecording(recording);
        // Set recording state to true
        setIsRecording(true);
        // Set recording state as not paused
        setIsPaused(false);
        // Start the timer for recording duration
        startTimer();
    };

    // Function to pause the ongoing recording
    const pauseRecording = async () => {
        // If recording instance is true
        if (recording) {
            // Pause the recording
            await recording.pauseAsync();
            // Set recording state as paused
            setIsPaused(true);
            // Pause the timer
            pauseTimer();
        }
    };

    // Function to resume the paused recording
    const resumeRecording = async () => {
        // If recording instance is true
        if (recording) {
            // Resume the recording
            await recording.startAsync();
            // Set recording state as not paused
            setIsPaused(false);
            // Resume the timer for recording duration
            startTimer();
        }
    };

    // Function to stop recording and save it as an attachment
    const stopRecording = async () => {
        try {
            // If recording instance is true
            if (recording) {
                // Stop and unload the recording
                await recording.stopAndUnloadAsync();
                // Stop the timer
                stopTimer();

                // Get the URI of the recording
                const uri = recording.getURI();
                // Generate a file name using the current date and time
                const formattedName = `recording-${formatDate(new Date())}`;
                // Get the mime type of the recording
                const mimeType = getMimeTypeFromRecording(recording);
                // Get the recording duration
                const durationMillis = recording._finalDurationMillis;

                // Store the recording with the necessary information
                const newAttachment = {
                    uri,
                    file_name: formattedName,
                    file_type: mimeType,
                    durationMillis: durationMillis,
                };
                // Add the recording attachment as an attachment
                addAttachment(newAttachment);

                // Clear the recording instance
                setRecording(null);
                // Set recording state to false
                setIsRecording(false);
            }
        } catch (error) {
            // Log any errors when stopping recording
            console.error('Error stopping recording:', error);
            // Alert error when stopping recording
            Alert.alert('Recording Error', 'Error stopping recording.');
        } finally {
            // Close the recording modal
            setRecordingModalVisible(false);
        }
    };

    // Function to cancel an ongoing recording without saving it
    const cancelRecording = async () => {
        // If recording instance is true
        if (recording) {
            // Stop and unload the recording
            await recording.stopAndUnloadAsync();
        }
        // Stop the timer
        stopTimer();
        // Clear the recording instance
        setRecording(null);
        // Set recording state to false
        setIsRecording(false);
        // Close the recording modal
        setRecordingModalVisible(false);
    };

    // Function to start the timer for tracking recording duration
    const startTimer = () => {
        // Increase the timer by one second 
        intervalRef.current = setInterval(() => {
            setTimer((prev) => prev + 1);
        }, 1000);
    };

    // Function to stop the timer
    const stopTimer = () => {
        if (intervalRef.current) {
            // Clear the timer interval
            clearInterval(intervalRef.current);
            // Reset the interval reference
            intervalRef.current = null;
        }
        // Reset the timer
        setTimer(0);
    };

    // Function to pause the timer
    const pauseTimer = () => {
        if (intervalRef.current) {
            // Clear the timer interval
            clearInterval(intervalRef.current);
            // Reset the interval reference
            intervalRef.current = null;
        }
    };

    // Function to format the timer into MM:SS
    const formatTimer = () => {
        // Calculate and format the minutes
        const minutes = Math.floor(timer / 60).toString().padStart(2, '0');
        // Calculate and format the seconds
        const seconds = (timer % 60).toString().padStart(2, '0');
        return `${minutes}:${seconds}`;
    };

    // Function to get the MIME type of a recording based on its file extension
    const getMimeTypeFromRecording = (recording) => {
        // Get the URI of the recording
        const uri = recording.getURI();
        // Extract the file extension
        const fileExtension = uri.split('.').pop().toLowerCase();

        // Map of supported file extensions and their corresponding MIME types
        const mimeTypeMap = {
            m4a: 'audio/mp4',
            wav: 'audio/wav',
            mp3: 'audio/mpeg',
            aac: 'audio/aac',
            ogg: 'audio/ogg',
            webm: 'audio/webm',
        };
        
        // Return the corresponding MIME type or the default value 'application/octet-stream'
        return mimeTypeMap[fileExtension] || 'application/octet-stream';
    };
    
    return (
        <View style={styles.container}>
            {/* Insert Attachment button to open attachment modal */}
            <TouchableOpacity style={styles.insertButton} onPress={() => setAddAttachmentModalVisible(true)}>
                <Text style={styles.insertButtonText}>Insert Attachment</Text>
                <Ionicons name='attach' size={32} color='#8B4513' />
            </TouchableOpacity>

            {/* Modal for Attachment Options */}
            <Modal
                visible={addAttachmentModalVisible}
                transparent
                animationType='slide'
                onRequestClose={() => setAddAttachmentModalVisible(false)}
                testID='attachment-modal'
            >
                {/* TouchableWithoutFeedback to allow pressing outside of the overlay to close the modal */}
                <TouchableWithoutFeedback onPress={() => setAddAttachmentModalVisible(false)} testID='attachment-TouchableWithoutFeedback'>
                    <View style={styles.modalOverlay}>
                        {/* TouchableWithoutFeedback to not close the modal when pressing within the overlay */}
                        <TouchableWithoutFeedback>
                            {/* All the Attachment Options */}
                            <View style={styles.addAttachmentContainer}>
                                <TouchableOpacity style={styles.addAttachmentOption} onPress={addFileAttachment}>
                                    <Ionicons name='document-attach' size={36} color='#8B4513' />
                                    <Text style={styles.addAttachmentOptionText}>File</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.addAttachmentOption} onPress={addGalleryAttachment}>
                                    <Ionicons name='images' size={36} color='#8B4513' />
                                    <Text style={styles.addAttachmentOptionText}>Gallery</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.addAttachmentOption} onPress={addCameraAttachment}>
                                    <Ionicons name='camera' size={36} color='#8B4513' />
                                    <Text style={styles.addAttachmentOptionText}>Camera</Text>
                                </TouchableOpacity>
                                {/* Opens the recording audio modal */}
                                <TouchableOpacity
                                    style={styles.addAttachmentOption}
                                    onPress={() => {
                                        setAddAttachmentModalVisible(false);
                                        setRecordingModalVisible(true);
                                    }}
                                >
                                    <Ionicons name='mic' size={36} color='#8B4513' />
                                    <Text style={styles.addAttachmentOptionText}>Audio</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableWithoutFeedback>
                        {/* Button to close the add attachment modal */}
                        <TouchableOpacity
                            onPress={() => setAddAttachmentModalVisible(false)}
                            style={styles.closeButton}
                            testID='add-attachment-close'
                        >
                            <Ionicons name='close' size={32} color='#FFFFFF' />
                        </TouchableOpacity>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            {/* Modal for Audio Recording */}
            <Modal
                visible={recordingModalVisible}
                transparent
                animationType='slide'
                onRequestClose={() => setRecordingModalVisible(false)}
                testID='recording-modal'
            >
                {/* TouchableWithoutFeedback to allow pressing outside of the overlay to close the modal */}
                <TouchableWithoutFeedback onPress={cancelRecording} testID='recording-TouchableWithoutFeedback'>
                    <View style={styles.modalOverlay}>
                        {/* TouchableWithoutFeedback to not close the modal when pressing within the overlay */}
                        <TouchableWithoutFeedback>
                            <View style={styles.recordingModal}>
                                {isRecording ? (
                                    /* Shows the controls for recording after user clicks on 'Record' */
                                    <>
                                        {/* Timer text to show user how long they have been recording */}
                                        <Text style={styles.timerText}>{formatTimer()}</Text>
                                        <View style={styles.controlRow}>
                                            <View style={styles.emptySpace} />
                                            {/* Resume and Pause switches between each other when clicked  */}
                                            <View>
                                                <TouchableOpacity onPress={isPaused ? resumeRecording : pauseRecording} style={styles.iconContainer}>
                                                    <Ionicons name={isPaused ? 'play' : 'pause'} size={48} color='#8B4513' />
                                                </TouchableOpacity>
                                                <TouchableOpacity onPress={isPaused ? resumeRecording : pauseRecording}>
                                                    <Text style={styles.iconLabel}>{isPaused ? 'Resume' : 'Pause'}</Text>
                                                </TouchableOpacity>
                                                
                                            </View>
                                            {/* Stop button to stop recording */}
                                            <View>
                                                <TouchableOpacity onPress={stopRecording} style={styles.stopIconContainer}>
                                                    <Ionicons name='stop' size={32} color='#8B4513' />
                                                </TouchableOpacity>
                                                <TouchableOpacity onPress={stopRecording}>
                                                    <Text style={styles.iconLabel}>Stop</Text>
                                                </TouchableOpacity>

                                            </View>
                                        </View>
                                    </>
                                ) : (
                                    /* Shows the 'Record' button so that user can record audio */
                                    <View style={styles.recordContainer}>
                                        <View>
                                            <TouchableOpacity onPress={startRecording} style={styles.iconContainer}>
                                                <Ionicons name='mic' size={48} color='#8B4513' />
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={startRecording}>
                                                <Text style={styles.iconLabel}>Record</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                )}
                            </View>
                        </TouchableWithoutFeedback>
                        {/* Button to close the recording modal and cancel all recording if pressed */}
                        <TouchableOpacity onPress={cancelRecording} style={styles.closeButton} testID='recording-modal-close'>
                            <Ionicons name='close' size={32} color='#FFFFFF' />
                        </TouchableOpacity>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    // Style for the container
    container: {
        backgroundColor: '#F5F5DC',
    },
    // Style for the insertButton
    insertButton: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#8B4513',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 12,
        backgroundColor: '#F5F5DC',
        justifyContent: 'space-between',
    },
    // Style for the insertButtonText
    insertButtonText: {
        color: '#8B4513',
        fontSize: 20,
        fontWeight: '500',
    },
    // Style for the modalOverlay
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center'
    },
    // Style for the addAttachmentContainer
    addAttachmentContainer: {
        marginHorizontal: 32,
        backgroundColor: '#F5F5DC',
        borderRadius: 12,
        padding: 16,
        borderWidth: 2,
        borderColor: '#8B4513'
    },
    // Style for the addAttachmentOption
    addAttachmentOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderBottomWidth: 1,
        borderColor: '#5A3311',
    },
    // Style for the addAttachmentOptionText
    addAttachmentOptionText: { 
        marginLeft: 10, 
        color: '#8B4513', 
        fontSize: 20,
        fontWeight: '500' 
    },
    // Style for the closeButton
    closeButton: {
        marginTop: 20,
        bottom: 10,
        alignSelf: 'center',
        backgroundColor: '#8B4513',
        padding: 10,
        borderRadius: 16,
    },
    // Style for the recordingModal
    recordingModal: { 
        justifyContent: 'center', 
        alignItems: 'center',
        marginHorizontal: 32,
        backgroundColor: '#F5F5DC',
        borderRadius: 12,
        padding: 16,
    },
    // Style for the timerText
    timerText: {
        fontSize: 20,
        color: '#8B4513',
        fontWeight: '500',
        marginBottom: 5,
        textAlign: 'center',
    },
    // Style for the controlRow
    controlRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
        width: '100%',
    },
    // Style for the recordContainer
    recordContainer: {
        justifyContent: 'center', 
        alignItems: 'center',
        padding: 16,
        minWidth: '100%',
    },
    // Style for the iconContainer
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#F5F5DC',
        borderWidth: 3,
        borderColor: '#8B4513',
    },
    // Style for the stopIconContainer
    stopIconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 50,
        height: 50,
        marginTop: 10,
        borderRadius: 25,
        backgroundColor: '#F5F5DC',
        borderWidth: 3,
        borderColor: '#8B4513',
    },
    // Style for the iconLabel
    iconLabel: {
        marginTop: 5,
        color: '#8B4513',
        fontSize: 20,
        fontWeight: '500',
        textAlign: 'center',
    },
    // Style for the emptySpace
    emptySpace: {
        width: 50,
    },
});

export default AddAttachment;