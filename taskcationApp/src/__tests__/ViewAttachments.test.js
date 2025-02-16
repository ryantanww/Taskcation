// Import dependencies and libraries used for testing View Attachments
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert, } from 'react-native';
import ViewAttachments from '../components/ViewAttachments';
import * as viewFileModule from '../utils/ViewFile';
import { Audio } from 'expo-av';

// Array of mock attachments
const mockAttachments = [
    { id: '1', uri: 'https://test.com/image1.jpg', file_name: 'Image 1', file_type: 'image/png' },
    { id: '2', uri: 'https://test.com/audio1.mp3', file_name: 'Audio 1', file_type: 'audio/mp3' },
    { id: '3', uri: 'https://test.com/document1.pdf', file_name: 'Document 1', file_type: 'application/pdf' },
];


// Mock function for simulating 'onDeleteAttachment' prop
const mockOnDeleteAttachment = jest.fn();

describe('ViewAttachments', () => {
    // Clear all mocks before each test
    beforeEach(() => {
        jest.clearAllMocks();
        // Spy on the ViewFile function
        jest.spyOn(viewFileModule, 'default');
        // Spy on Alert.alert to verify alerts
        jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    });

    // Test to render attachments correctly
    it('should render attachments correctly', () => {
        // Renders the ViewAttachments component
        const { getByText } = render(
            <ViewAttachments attachments={mockAttachments} onDeleteAttachment={mockOnDeleteAttachment} />
        );
        
        // Verifies that the attachments are correctly rendered with correct file name
        expect(getByText('Image 1')).toBeTruthy();
        expect(getByText('Audio 1')).toBeTruthy();
        expect(getByText('Document 1')).toBeTruthy();
    });

    // Test to check if image modal opens when image is pressed
    it('should open the image modal when an image is pressed', async () => {
        // Renders the ViewAttachments component
        const { getByText, getByTestId } = render(
            <ViewAttachments attachments={mockAttachments} onDeleteAttachment={mockOnDeleteAttachment} />
        );
        
        // Verify that Image 1 is displayed
        expect(getByText('Image 1')).toBeTruthy();
        // Press Image 1
        fireEvent.press(getByText('Image 1'));
    
        await waitFor(() => {
            // Wait for the image modal to open and verify that it is displayed with the test ID
            expect(getByTestId('image-modal')).toBeTruthy();
            // Verify that the image is displayed
            expect(getByTestId('image-preview')).toBeTruthy();
        });
    });

    // Test to check if ViewFile is called when documents is pressed
    it('should call ViewFile for documents when pressed', async () => {
        // Renders the ViewAttachments component
        const { getByText } = render(
            <ViewAttachments attachments={mockAttachments} onDeleteAttachment={mockOnDeleteAttachment} />
        );
    
        // Verify that Document 1 is displayed
        expect(getByText('Document 1')).toBeTruthy();
        // Press Document 1
        fireEvent.press(getByText('Document 1'));
    
        await waitFor(() => {
            // Verify that the ViewFile function is called
            expect(viewFileModule.default).toHaveBeenCalled();
        });
    });

    // Test to check if audio playback modal opens when audio file is pressed
    it('should open the audio playback modal when an audio file is pressed', async () => {
        // Renders the ViewAttachments component
        const { getByText, getByTestId } = render(
            <ViewAttachments attachments={mockAttachments} onDeleteAttachment={mockOnDeleteAttachment} />
        );
    
        // Verify that Audio 1 is displayed
        expect(getByText('Audio 1')).toBeTruthy();
        // Press Audio 1
        fireEvent.press(getByText('Audio 1'));
    
        await waitFor(() => {
            // Wait for the audio modal to open and verify that it is displayed with the test ID
            expect(getByTestId('audio-modal')).toBeTruthy();
            //  Verify that the Play option is displayed
            expect(getByText('Play')).toBeTruthy();
        });

        // Press Play
        fireEvent.press(getByText('Play'));

        await waitFor(() => {
            //  Verify that the 00:00 is displayed
            expect(getByText('00:00')).toBeTruthy();
            //  Verify that the Pause is displayed
            expect(getByText('Pause')).toBeTruthy();
        });

        // Press Pause
        fireEvent.press(getByText('Pause'));

        await waitFor(() => {
            //  Verify that the Resume is displayed
            expect(getByText('Resume')).toBeTruthy();
        });
    });

    // Test to seek to a new position in the audio using the slider
    it('should seek to a new position when user drags the slider', async () => {
        // Mock position of playback
        const mockSetPositionAsync = jest.fn();
        // Spy On expo-av library to mock it
        jest.spyOn(require('expo-av').Audio, 'Sound').mockImplementation(() => {
            return {
                loadAsync: jest.fn(),
                playAsync: jest.fn(),
                pauseAsync: jest.fn(),
                stopAsync: jest.fn(),
                unloadAsync: jest.fn(),
                setOnPlaybackStatusUpdate: jest.fn(),
                setPositionAsync: mockSetPositionAsync,
            };
        });
        
        // Renders the ViewAttachments component
        const { getByText, getByTestId } = render(
            <ViewAttachments attachments={mockAttachments} onDeleteAttachment={mockOnDeleteAttachment} />
        );
        
        // Verify that Audio 1 is displayed
        expect(getByText('Audio 1')).toBeTruthy();
        // Press Audio 1
        fireEvent.press(getByText('Audio 1'));
    
        await waitFor(() => {
            // Wait for the audio modal to open and verify that it is displayed with the test ID
            expect(getByTestId('audio-modal')).toBeTruthy();
            //  Verify that the Play is displayed
            expect(getByText('Play')).toBeTruthy();
        });

        // Press Play
        fireEvent.press(getByText('Play'));

        await waitFor(() => {
            //  Verify that the Pause is displayed
            expect(getByText('Pause')).toBeTruthy();
        });
    
        // Get the slider component
        const slider = getByTestId('audio-slider');
        // Simulate the dragging of the slider to 60 seconds
        fireEvent(slider, 'onSlidingComplete', 60000);
    
        // Verify that the playback position was updated
        expect(mockSetPositionAsync).toHaveBeenCalledWith(60000);
    });

    // Test to call onDeleteAttachment when delete is confirmed
    it('should call onDeleteAttachment when delete is confirmed', async () => {
        // Mock alert to find the destructive button and press the delete button
        Alert.alert.mockImplementationOnce((title, message, buttons) => {
            const destructiveButton = buttons.find(b => b.style === 'destructive');
            destructiveButton?.onPress?.();
        });

        // Renders the ViewAttachments component
        const { getByText, getByTestId } = render(
            <ViewAttachments attachments={mockAttachments} onDeleteAttachment={mockOnDeleteAttachment} />
        );
    
        // Verify that Image 1 is displayed
        expect(getByText('Image 1')).toBeTruthy();
        // Press the delete button for the first attachment
        fireEvent.press(getByTestId('delete-1')); 
    
        // Verify the delete function was called with the correct attachment
        expect(mockOnDeleteAttachment).toHaveBeenCalledWith(expect.objectContaining({ id: '1' }));
    });

    // Test to not call onDeleteAttachment if delete alert is cancelled 
    it('should not call onDeleteAttachment when deletion is cancelled', async () => {
        // Mock alert to find the cancel button and press the cancel button
        Alert.alert.mockImplementationOnce((title, message, buttons) => {
            const cancelButton = buttons.find(b => b.style === 'cancel');
            cancelButton?.onPress?.();
        });

        // Renders the ViewAttachments component
        const { getByText, getByTestId } = render(
            <ViewAttachments attachments={mockAttachments} onDeleteAttachment={mockOnDeleteAttachment} />
        );

        // Verify that Image 1 is displayed
        expect(getByText('Image 1')).toBeTruthy();
        // Press the delete button for the first attachment
        fireEvent.press(getByTestId('delete-1')); 

        // Verify that the delete function was not called
        expect(mockOnDeleteAttachment).not.toHaveBeenCalled();
    });

    // Test to close the image modal when the close button is pressed
    it('should close the image modal when the close button is pressed', async () => {
        // Renders the ViewAttachments component
        const { getByText, getByTestId, queryByTestId } = render(
            <ViewAttachments attachments={mockAttachments} onDeleteAttachment={mockOnDeleteAttachment} />
        );
    
        // Verify that Image 1 is displayed
        expect(getByText('Image 1')).toBeTruthy();
        // Press Image 1
        fireEvent.press(getByText('Image 1'));
    
        await waitFor(() => {
            // Wait for the image modal to open and verify that it is displayed with the test ID
            expect(getByTestId('image-modal')).toBeTruthy();
            // Verify that the image is displayed
            expect(getByTestId('image-preview')).toBeTruthy();
        });

        // Press the close button for image modal
        fireEvent.press(getByTestId('image-close'));

        await waitFor(() => {
            // Verify that the modal is closed
            expect(queryByTestId('image-modal')).toBeNull();
            // Verify that the image is not displayed
            expect(queryByTestId('image-preview')).toBeNull();
        });
    });

    // Test to close the image modal when the overlay is pressed
    it('should close the image modal when the overlay is pressed', async () => {
        // Renders the ViewAttachments component
        const { getByText, getByTestId, queryByTestId } = render(
            <ViewAttachments attachments={mockAttachments} onDeleteAttachment={mockOnDeleteAttachment} />
        );
    
        // Verify that Image 1 is displayed
        expect(getByText('Image 1')).toBeTruthy();
        // Press Image 1
        fireEvent.press(getByText('Image 1'));
    
        await waitFor(() => {
            // Wait for the image modal to open and verify that it is displayed with the test ID
            expect(getByTestId('image-modal')).toBeTruthy();
            // Verify that the image is displayed
            expect(getByTestId('image-preview')).toBeTruthy(); 
        });

        // Press the image modal overlay
        fireEvent.press(getByTestId('image-TouchableWithoutFeedback'));

        await waitFor(() => {
            // Verify that the image modal is closed
            expect(queryByTestId('image-modal')).toBeNull();
            // Verify that the image is not displayed
            expect(queryByTestId('image-preview')).toBeNull();
        });
    });

    // Test to close the audio playback modal when the close button is pressed
    it('should close the audio playback modal when the close button is pressed', async () => {
        // Renders the ViewAttachments component
        const { getByText, getByTestId, queryByText, queryByTestId } = render(
            <ViewAttachments attachments={mockAttachments} onDeleteAttachment={mockOnDeleteAttachment} />
        );
    
        // Verify that Audio 1 is displayed
        expect(getByText('Audio 1')).toBeTruthy();
        // Press Audio 1
        fireEvent.press(getByText('Audio 1'));
    
        await waitFor(() => {
            // Wait for the audio modal to open and verify that it is displayed with the test ID
            expect(getByTestId('audio-modal')).toBeTruthy();
            //  Verify that the Play is displayed
            expect(getByText('Play')).toBeTruthy();
        });

        // Press Play
        fireEvent.press(getByText('Play'));

        await waitFor(() => {
            //  Verify that the 00:00 is displayed
            expect(getByText('00:00')).toBeTruthy();
            //  Verify that the Pause is displayed
            expect(getByText('Pause')).toBeTruthy();
        });

        // Press the close button for audio modal
        fireEvent.press(getByTestId('audio-close'));

        await waitFor(() => {
            // Verify that the audio modal is closed
            expect(queryByTestId('audio-modal')).toBeNull();
            // Verify that Play is not displayed
            expect(queryByText('Play')).toBeNull();
        });

    });

    // Test to close the audio playback modal when the overlay is pressed
    it('should close the audio playback modal when the overlay is pressed', async () => {
        // Renders the ViewAttachments component
        const { getByText, getByTestId, queryByText, queryByTestId } = render(
            <ViewAttachments attachments={mockAttachments} onDeleteAttachment={mockOnDeleteAttachment} />
        );
    
        // Verify that Audio 1 is displayed
        expect(getByText('Audio 1')).toBeTruthy();
        // Press Audio 1
        fireEvent.press(getByText('Audio 1'));
    
        await waitFor(() => {
            // Wait for the audio modal to open and verify that it is displayed with the test ID
            expect(getByTestId('audio-modal')).toBeTruthy();
            //  Verify that the Play is displayed
            expect(getByText('Play')).toBeTruthy();
        });

        // Press Play
        fireEvent.press(getByText('Play'));

        await waitFor(() => {
            //  Verify that the 00:00 is displayed
            expect(getByText('00:00')).toBeTruthy();
            //  Verify that the Pause is displayed
            expect(getByText('Pause')).toBeTruthy();
        });

        // Press the audio modal overlay
        fireEvent.press(getByTestId('audio-TouchableWithoutFeedback'));

        await waitFor(() => {
            // Verify that the modal is closed
            expect(queryByTestId('audio-modal')).toBeNull();
            // Verify that Play is not displayed
            expect(queryByText('Play')).toBeNull();
        });

    });

    // Test to show an alert if playback encounters an error while looping
    it('should show an alert if playback encounters an error while looping', async () => {
        // Store the playback status update callback
        let playbackStatusUpdateCallback;
        // Mock sound instance
        const MockSoundInstance = {
            loadAsync: jest.fn(),
            playAsync: jest.fn(),
            pauseAsync: jest.fn(),
            stopAsync: jest.fn(),
            unloadAsync: jest.fn(),
            setOnPlaybackStatusUpdate: jest.fn((callback) => {
                playbackStatusUpdateCallback = callback;
            }),
            setPositionAsync: jest.fn(),
        };
        // Mock the Audio.Sound instance
        Audio.Sound.mockImplementation(() => MockSoundInstance);

        // Renders the ViewAttachments component
        const { getByText, getByTestId } = render(
            <ViewAttachments attachments={mockAttachments} onDeleteAttachment={mockOnDeleteAttachment} />
        );

        // Verify that Audio 1 is displayed
        expect(getByText('Audio 1')).toBeTruthy();
        // Press Audio 1
        fireEvent.press(getByText('Audio 1'));
    
        await waitFor(() => {
            // Wait for the audio modal to open and verify that it is displayed with the test ID
            expect(getByTestId('audio-modal')).toBeTruthy();
            //  Verify that the Play is displayed
            expect(getByText('Play')).toBeTruthy();
        });

        // Press Play
        fireEvent.press(getByText('Play'));

        await waitFor(() => {
            //  Verify that the 00:00 is displayed
            expect(getByText('00:00')).toBeTruthy();
            //  Verify that the Pause is displayed
            expect(getByText('Pause')).toBeTruthy();
        });

        await waitFor(() => {
            // Mock an error during playback
            playbackStatusUpdateCallback({ isLoaded: false, error: 'Playback failed.' });
        });
        
        await waitFor(() => {
            // Verify that an error alert is shown to the user when there is an error playing recording on loop
            expect(Alert.alert).toHaveBeenCalledWith('Playback Error', 'Error playing recording on loop.');
        });
    });

    // Test to show an alert if initialising audio playback fails
    it('should show an alert if initialising audio playback fails', async () => {
        // Mock sound instance with an error
        const mockSoundInstance = {
            loadAsync: jest.fn().mockRejectedValueOnce(new Error('initialisation failed')),
            playAsync: jest.fn(),
            pauseAsync: jest.fn(),
            stopAsync: jest.fn(),
            unloadAsync: jest.fn(),
            setOnPlaybackStatusUpdate: jest.fn(),
            setPositionAsync: jest.fn(),
        };
        // Mock the Audio.Sound instance
        Audio.Sound.mockImplementation(() => mockSoundInstance);

        // Renders the ViewAttachments component
        const { getByText, getByTestId } = render(
            <ViewAttachments attachments={mockAttachments} onDeleteAttachment={mockOnDeleteAttachment} />
        );

        // Verify that Audio 1 is displayed
        expect(getByText('Audio 1')).toBeTruthy();
        // Press Audio 1
        fireEvent.press(getByText('Audio 1'));
    
        await waitFor(() => {
            // Wait for the audio modal to open and verify that it is displayed with the test ID
            expect(getByTestId('audio-modal')).toBeTruthy();
            //  Verify that the Play is displayed
            expect(getByText('Play')).toBeTruthy();
        });

        // Press Play
        fireEvent.press(getByText('Play'));

        await waitFor(() => {
            // Verify that an error alert is shown to the user when there is an error playing audio
            expect(Alert.alert).toHaveBeenCalledWith('Playing Audio Error', 'Error playing audio.');
        });
    });

    

    // Snapshot test for ViewAttachments
    it('should match the snapshot', () => {
        // Renders the ViewAttachments component
        const { toJSON } = render(
            <ViewAttachments attachments={mockAttachments} onDeleteAttachment={mockOnDeleteAttachment} />
        );
    
        // Verify snapshot matches
        expect(toJSON()).toMatchSnapshot();
    });
});