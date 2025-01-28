// Import dependencies and libraries used in View Attachments
import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    Image,
    StyleSheet,
    Alert,
    Modal,
    TouchableWithoutFeedback,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Slider from '@react-native-community/slider';
import ViewFile from '../utils/ViewFile';
import { Audio } from 'expo-av';

const ViewAttachment = ({ attachments, onDeleteAttachment }) => {
    // State to control the image modal
    const [imageModalVisible, setImageModalVisible] = useState(false);

    // State for storing the URI of the current image
    const [currentImageUri, setCurrentImageUri] = useState(null);

    // State to control the playback modal
    const [playbackModalVisible, setPlaybackModalVisible] = useState(false);

    // State for storing the audio playback object
    const [audioPlayback, setAudioPlayback] = useState(null);

    // State for tracking if audio is playing
    const [isAudioPlaying, setIsAudioPlaying] = useState(false);

    // State for storing the URI of the current audio
    const [currentAudioUri, setCurrentAudioUri] = useState(null);

    // State for toggling the playback UI
    const [showPlayback, setShowPlayback] = useState(false);

    // State for storing the total duration of the current audio file
    const [currentAudioDuration, setCurrentAudioDuration] = useState(0);

    // State for storing the current position in the audio playback
    const [currentPosition, setCurrentPosition] = useState(0);

    // State for the current formatted playback time
    const [formattedDuration, setFormattedDuration] = useState("00:00");

    // Function to handle deletion of an attachment with a confirmation alert
    const handleDelete = (attachment) => {
        Alert.alert(
            'Delete Attachment',
            'Are you sure you want to delete this attachment?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => onDeleteAttachment(attachment),
                },
            ]
            );
    };

    // Function to convert milliseconds to a MM:SS format for audio playback
    const formatMillis = (millis) => {
        // Convert milliseconds to seconds
        const totalSeconds = Math.floor(millis / 1000);
        // Convert seconds to minutes
        const minutes = Math.floor(totalSeconds / 60);
        // Calculate the remaining seconds
        const seconds = totalSeconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    // Function to handle playing audio from the provided URI
    const playAudio = async (uri) => {
        // Stop other audio playback if playAudio is called
        if (audioPlayback) {
            await stopAudio();
        }
        // Create a new sound instance
        const playback = new Audio.Sound();
        try {
            // Load the audio file and start playback
            await playback.loadAsync(
                { uri },
                {
                    shouldPlay: true,
                    isLooping: false,
                    progressUpdateIntervalMillis: 500,
                }
            );
            // Start playing the audio
            await playback.playAsync();
            // Set the playback instance
            setAudioPlayback(playback);
            // Set audio playing state to true
            setIsAudioPlaying(true);
            // Show playback controls
            setShowPlayback(true);

            // Track the last updated timestamp
            let lastUpdate = 0;

            // Update the playback status periodically
            playback.setOnPlaybackStatusUpdate((status) => {
                // If the playback status is loaded
                if (status.isLoaded) {
                    // Date and time now
                    const now = Date.now();
                    // Only update every 500 ms
                    if (now - lastUpdate >= 500) {
                        // Update current position of the playback
                        setCurrentPosition(status.positionMillis || 0);
                        // Update the formatted time
                        setFormattedDuration(formatMillis(status.positionMillis || 0));
                        lastUpdate = now;
                    }
    
                    // If playback has finished, restart it
                    if (status.didJustFinish) {
                        // Replay the audio
                        playback.replayAsync();
                        // Reset the current position of the playback
                        setCurrentPosition(0)
                        // Reset the formatted time of the playback
                        setFormattedDuration("00:00");
                    }
                } else if (status.error) {
                    // Log any errors during playback
                    console.error(`Playback error: ${status.error}`);
                    // Alert error when playing recording on loop
                    Alert.alert('Playback Error', 'Error playing recording on loop.');
                    // Close the playback modal
                    setPlaybackModalVisible(false);
                    return;
                }
            });

        } catch (error) {
            // Log any errors when playing audio
            console.error('Error playing audio:', error);
            // Alert error when playing audio
            Alert.alert('Playing Audio Error', 'Error playing audio.');
            // Close the playback modal
            setPlaybackModalVisible(false);
        }
    };
        
    // Function to pause the current audio playback
    const pauseAudio = async () => {
        if (audioPlayback && isAudioPlaying) {
            await audioPlayback.pauseAsync();
            // Set audio playing state to false
            setIsAudioPlaying(false);
        }
    };
    
    // Function to resume the current audio playback
    const resumeAudio = async () => {
        if (audioPlayback && !isAudioPlaying) {
            await audioPlayback.playAsync();
            // Set audio playing state to true
            setIsAudioPlaying(true);
        }
    };
    
    // Function to stop the current audio playback
    const stopAudio = async () => {
        if (audioPlayback) {
            await audioPlayback.stopAsync();
            await audioPlayback.unloadAsync();
        }
        // Set the playback instance to null
        setAudioPlayback(null);
        // Set audio playing state to false
        setIsAudioPlaying(false);
        // Don't show playback controls
        setShowPlayback(false);
        // Close the playback modal
        setPlaybackModalVisible(false);
    };
    
    // Function to render each attachment item in the list
    const renderAttachments = ({ item }) => {
        // Check if attachment is an image
        const isImage = item.file_type?.includes('image');
        // Check if attachment is an audio
        const isAudio = item.file_type?.includes('audio');
    
        // Function 
        const viewAttachment = async () => {
            if (isImage) {
                // Set the image URI
                setCurrentImageUri(item.uri);
                // Open image modal
                setImageModalVisible(true);
            } else if (isAudio) {
                // Set the audio URI
                setCurrentAudioUri(item.uri);
                // Set the audio duration
                setCurrentAudioDuration(item.durationMillis);
                // Open playback modal
                setPlaybackModalVisible(true);
            } else {
                // View file
                ViewFile(item.uri, item.file_name, item.file_type);
            }
        }
        return (
            // Renders each attachment depending on the attachment type
            <View style={styles.attachmentItem}>
                {/* Render icon based on file type */}
                <TouchableOpacity style={styles.attachmentIconContainer} onPress={viewAttachment}>
                    {isImage ? (
                        <Image source={{ uri: item.uri }} style={styles.attachmentImage} />
                    ) : isAudio ? (
                        <Ionicons name="musical-notes" size={36} color="#8B4513" />
                    ) : (
                        <Ionicons name="document" size={36} color="#8B4513" />
                    )}
                </TouchableOpacity>
                
                {/* Display file name e */}
                <TouchableOpacity style={styles.attachmentNameContainer} onPress={viewAttachment}>
                    <Text style={styles.attachmentName} numberOfLines={1} ellipsizeMode="tail">{item.file_name}</Text>
                </TouchableOpacity>

                {/* Display delete attachment button */}
                <TouchableOpacity onPress={() => handleDelete(item)} style={styles.deleteButton} testID={`delete-${item.id}`}>
                    <Ionicons name="trash" size={24} color="#FFFFFF" />
                </TouchableOpacity>
            </View>
        );
    };
    
    return (
        <View style={styles.container}>
            {/* Render the list of attachments */}
            <FlatList
                data={attachments}
                keyExtractor={(item, index) => `${item.uri}-${index}`}
                renderItem={renderAttachments}
                contentContainerStyle={styles.listContainer}
            />

            {/* Modal for displaying images */}
            <Modal 
                visible={imageModalVisible}
                transparent
                animationType='fade' 
                onRequestClose={() => setImageModalVisible(false)}
                testID='image-modal'
            >
                {/* TouchableWithoutFeedback to allow pressing outside of the overlay to close the modal */}
                <TouchableWithoutFeedback onPress={() => setImageModalVisible(false)} testID='image-TouchableWithoutFeedback'>
                    <View style={styles.modalOverlay} >
                        {/* TouchableWithoutFeedback to not close the modal when pressing within the overlay */}
                        <TouchableWithoutFeedback>
                            {/* Display the selected image */}
                            <View>
                                <Image source={{ uri: currentImageUri }} style={styles.imagePreview} testID='image-preview'/>
                                {/* Button to close the image modal */}
                                <TouchableOpacity onPress={() => setImageModalVisible(false)} style={styles.closeButton} testID='image-close'>
                                    <Ionicons name='close' size={32} color='#FFFFFF' />
                                </TouchableOpacity>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
                
            </Modal>

            {/* Modal for playing audio playback */}
            <Modal
                visible={playbackModalVisible}
                transparent
                animationType='slide'
                onRequestClose={() => setPlaybackModalVisible(false)}
                testID='audio-modal'
            >
                {/* TouchableWithoutFeedback to allow pressing outside of the overlay to close the modal */}
                <TouchableWithoutFeedback onPress={stopAudio} testID='audio-TouchableWithoutFeedback'>
                    <View style={styles.modalOverlay}>
                        {/* TouchableWithoutFeedback to not close the modal when pressing within the overlay */}
                        <TouchableWithoutFeedback>
                            <View style={styles.playbackModal}>
                                {showPlayback ? (
                                    /* Shows the controls for playing audio after user clicks on 'Play' */
                                    <>
                                        <View style={styles.controlRow}>
                                            {/* Timer text to show user the duration of the playback */}
                                            <Text style={styles.timerText}>{formattedDuration}</Text>
                                            {/* Slider for controlling the playback position */}
                                            <Slider
                                                testID="audio-slider"
                                                style={styles.slider}
                                                minimumValue={0}
                                                maximumValue={currentAudioDuration}
                                                value={currentPosition}
                                                onValueChange={(value) => {
                                                    setFormattedDuration(formatMillis(value));
                                                }}
                                                onSlidingComplete={(value) => {
                                                    
                                                    if (audioPlayback) {
                                                        audioPlayback.setPositionAsync(value);
                                                    }
                                                }}
                                                
                                                minimumTrackTintColor="#8B4513"
                                                maximumTrackTintColor="#000000"
                                                thumbTintColor="#8B4513"
                                            />
                                        </View>
                                        {/* Pause and Resume switches between each other when clicked  */}
                                        <View>
                                            <TouchableOpacity onPress={isAudioPlaying ? pauseAudio : resumeAudio} style={styles.iconContainer}>
                                                <Ionicons name={isAudioPlaying ? 'pause' : 'play'} size={48} color='#8B4513'/>
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={isAudioPlaying ? pauseAudio : resumeAudio}>
                                                <Text style={styles.iconLabel}>{isAudioPlaying ? 'Pause' : 'Resume'}</Text>
                                            </TouchableOpacity>
                                        </View>

                                    </>
                                ) : (
                                    /* Shows the 'Play' button so that user can play their selected audio */
                                    <View style={styles.playContainer}>
                                        <View>
                                            <TouchableOpacity onPress={() => playAudio(currentAudioUri)} style={styles.iconContainer}>
                                                <Ionicons name="play" size={48} color="#8B4513" />
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => playAudio(currentAudioUri)}>
                                                <Text style={styles.iconLabel}>Play</Text>
                                            </TouchableOpacity>
                                            
                                        </View>
                                    </View>
                                )}
                            </View>
                        </TouchableWithoutFeedback>
                        {/* Button to close the audio modal and stop all audio playing when pressed*/}
                        <TouchableOpacity onPress={stopAudio} style={styles.closeButton} testID='audio-close'>
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
        flex: 1,
        marginTop: 10,
    },
    // Style for the listContainer
    listContainer: {
        paddingBottom: 20,
    },
    // Style for the attachmentItem
    attachmentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderWidth: 2,
        borderColor: '#8B4513',
        borderRadius: 8,
        marginBottom: 10,
        backgroundColor: '#FFF8DC',
    },
    // Style for the attachmentIconContainer
    attachmentIconContainer: {
        marginRight: 10,
    },
    // Style for the attachmentImage
    attachmentImage: {
        width: 50,
        height: 50,
        borderRadius: 8,
    },
    // Style for the attachmentNameContainer
    attachmentNameContainer: {
        flex: 1,
        marginLeft: 10,
        justifyContent: 'center',
        
    },
    // Style for the attachmentName
    attachmentName: {
        flex: 1,
        fontSize: 16,
        color: '#8B4513',
        textAlignVertical: 'center',
    },
    // Style for the deleteButton
    deleteButton: {
        backgroundColor: '#8B4513',
        borderRadius: 8,
        padding: 6,
    },
    // Style for the modalOverlay
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderWidth: 2,
        borderColor: '#8B4513'
    },
    // Style for the imagePreview
    imagePreview: {
        width: '90%',
        height: '70%',
        resizeMode: 'contain',
    },
    // Style for the closeButton
    closeButton: {
        marginTop: 20,
        bottom: 10,
        backgroundColor: '#8B4513',
        padding: 10,
        borderRadius: 16,
    },
    // Style for the playbackModal
    playbackModal: {
        justifyContent: 'center', 
        alignItems: 'center',
        marginHorizontal: 32,
        backgroundColor: '#F5F5DC',
        borderRadius: 12,
        padding: 16,
        borderWidth: 2,
        borderColor: '#8B4513'
    },
    // Style for the playContainer
    playContainer: {
        justifyContent: 'center', 
        alignItems: 'center',
        padding: 16,
        minWidth: '100%',
    },
    // Style for the controlRow
    controlRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 16,
        width: '100%',
    },
    // Style for the iconContainer
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#FFF8DC',
        borderWidth: 3,
        borderColor: '#8B4513',
        marginHorizontal: 10,
    },
    // Style for the iconLabel
    iconLabel: {
        marginTop: 5,
        color: '#8B4513',
        fontSize: 20,
        fontWeight: '500',
        textAlign: 'center',
    },
    // Style for the slider
    slider: {
        width: '90%', 
        height: 40,
        flex: 1,
        marginHorizontal: 5,
    },
    // Style for the timerText
    timerText: {
        fontSize: 18,
        color: '#8B4513',
        fontWeight: '500',
        marginHorizontal: 10,
    },
});

export default ViewAttachment;