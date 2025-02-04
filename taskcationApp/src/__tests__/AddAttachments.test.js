// Import dependencies and libraries used for testing Add Attachments
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AddAttachments from '../components/AddAttachments';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import { Alert } from 'react-native';

// Mock function for simulating onAttachmentsChangeMock prop
let onAttachmentsChangeMock;

describe('AddAttachments', () => {
    // Clear all mocks before each test
    beforeEach(() => {
        jest.clearAllMocks();
        // Mock onAttachmentsChangeMock prop
        onAttachmentsChangeMock = jest.fn();
        // Spy on Alert.alert to verify alerts
        jest.spyOn(Alert, 'alert');
    });

    // Test to check if the attachment modal opens when Insert Attachment is pressed
    it('should open the attachment modal when Insert Attachment button is pressed', () => {
        // Renders the AddAttachments component
        const { getByText, getByTestId } = render(
            <AddAttachments attachments={[]} onAttachmentsChange={onAttachmentsChangeMock} />
        );

        // Verify that the Insert Attachment is displayed
        expect(getByText('Insert Attachment')).toBeTruthy();
        // Press the  Insert Attachment  button
        fireEvent.press(getByText('Insert Attachment'));

        // Verifies that the attachment modal is opened with all the correct options
        expect(getByTestId('attachment-modal')).toBeTruthy();
        expect(getByText('File')).toBeTruthy();
        expect(getByText('Gallery')).toBeTruthy();
        expect(getByText('Camera')).toBeTruthy();
        expect(getByText('Audio')).toBeTruthy();
    });

    // Test to check file attachment can be added
    it('should add a file attachment when file is selected', async () => {
        // Mock the DocumentPicker.getDocumentAsync
        DocumentPicker.getDocumentAsync.mockResolvedValueOnce({
            assets: [{ uri: 'file://test.pdf', name: 'test.pdf', mimeType: 'application/pdf', size: 1234 }],
        });

        // Renders the AddAttachments component
        const { getByText } = render(
            <AddAttachments attachments={[]} onAttachmentsChange={onAttachmentsChangeMock} />
        );

        // Verify that the Insert Attachment is displayed
        expect(getByText('Insert Attachment')).toBeTruthy();
        // Press the Insert Attachment button
        fireEvent.press(getByText('Insert Attachment'));

        // Verify that the File option is displayed
        expect(getByText('File')).toBeTruthy();
        // Press the File option
        fireEvent.press(getByText('File'));

        // Wait for the attachment to be added and verify the mock function is called with the correct mock data
        await waitFor(() => {
            expect(onAttachmentsChangeMock).toHaveBeenCalledWith([
                {
                    uri: 'file://test.pdf',
                    file_name: 'test.pdf',
                    file_type: 'application/pdf',
                    size: 1234,
                },
            ]);
        });
    });

    // Test to check camera attachment can be added
    it('should add a camera attachment when photo is taken', async () => {
        // Mock ImagePicker.requestCameraPermissionsAsync permission to be true
        ImagePicker.requestCameraPermissionsAsync.mockResolvedValueOnce({ granted: true });
        // Mock the ImagePicker.launchCameraAsync
        ImagePicker.launchCameraAsync.mockResolvedValueOnce({
            assets: [{ uri: 'file://photo.jpg', fileName: 'photo.jpg', mimeType: 'image/jpeg', size: 1234 }],
        });

        // Renders the AddAttachments component
        const { getByText } = render(
            <AddAttachments attachments={[]} onAttachmentsChange={onAttachmentsChangeMock} />
        );

        // Verify that the Insert Attachment is displayed
        expect(getByText('Insert Attachment')).toBeTruthy();
        // Press the Insert Attachment button
        fireEvent.press(getByText('Insert Attachment'));

        // Verify that the Camera option is displayed
        expect(getByText('Camera')).toBeTruthy();
        // Press the Camera option
        fireEvent.press(getByText('Camera'));

        // Wait for the attachment to be added and verify the mock function is called with the correct mock data
        await waitFor(() => {
            expect(onAttachmentsChangeMock).toHaveBeenCalledWith([
                {
                    uri: 'file://photo.jpg',
                    file_name: 'photo.jpg',
                    file_type: 'image/jpeg',
                    size: 1234,
                },
            ]);
        });
    });

    // Test to check gallery attachment can be added
    it('should add a gallery attachment when an image is selected', async () => {
        // Mock ImagePicker.requestMediaLibraryPermissionsAsync permission to be true
        ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValueOnce({ granted: true });
        // Mock the ImagePicker.launchImageLibraryAsync
        ImagePicker.launchImageLibraryAsync.mockResolvedValueOnce({
            assets: [{ uri: 'file://image.png', fileName: 'image.png', mimeType: 'image/png', size: 1234 }],
        });

        // Renders the AddAttachments component
        const { getByText } = render(
            <AddAttachments attachments={[]} onAttachmentsChange={onAttachmentsChangeMock} />
        );

        // Verify that the Insert Attachment is displayed
        expect(getByText('Insert Attachment')).toBeTruthy();
        // Press the Insert Attachment button
        fireEvent.press(getByText('Insert Attachment'));

        // Verify that the Gallery option is displayed
        expect(getByText('Gallery')).toBeTruthy();
        // Press the Gallery option
        fireEvent.press(getByText('Gallery'));

        // Wait for the attachment to be added and verify the mock function is called with the correct mock data
        await waitFor(() => {
            expect(onAttachmentsChangeMock).toHaveBeenCalledWith([
                {
                    uri: 'file://image.png',
                    file_name: 'image.png',
                    file_type: 'image/png',
                    size: 1234,
                },
            ]);
        });
    });

    // Test to check audio recording attachment can be added
    it('should add an audio recording as an attachment', async () => {
        // Mock Audio.requestPermissionsAsync permission to be true
        Audio.requestPermissionsAsync.mockResolvedValueOnce({ granted: true });
        // Mock the Audio.Recording.createAsync
        Audio.Recording.createAsync.mockResolvedValueOnce({
            recording: {
                getURI: () => 'file://recording.m4a',
                _finalDurationMillis: 15000,
                stopAndUnloadAsync: jest.fn(),
            },
        });

        // Renders the AddAttachments component
        const { getByText, getByTestId } = render(
            <AddAttachments attachments={[]} onAttachmentsChange={onAttachmentsChangeMock} />
        );

        // Verify that the Insert Attachment is displayed
        expect(getByText('Insert Attachment')).toBeTruthy();
        // Press the Insert Attachment button
        fireEvent.press(getByText('Insert Attachment'));

        // Verify that the Audio option is displayed
        expect(getByText('Audio')).toBeTruthy();
        // Press the Audio option
        fireEvent.press(getByText('Audio'));

        await waitFor(() => {
            // Wait for the recording modal to open and verify that it is displayed with the test ID
            expect(getByTestId('recording-modal')).toBeTruthy();
            //  Verify that the Record option is displayed
            expect(getByText('Record')).toBeTruthy();
        });

        // Press Record 
        fireEvent.press(getByText('Record'));

        await waitFor(() => {
            // Wait for the Stop to be displayed
            expect(getByText('Stop')).toBeTruthy();
        });

        // Press Stop 
        fireEvent.press(getByText('Stop'));

        // Wait for the attachment to be added and verify the mock function is called with the correct mock data
        await waitFor(() => {
            expect(onAttachmentsChangeMock).toHaveBeenCalledWith([
                {
                    uri: 'file://recording.m4a',
                    file_name: expect.stringContaining('recording-'),
                    file_type: 'audio/mp4',
                    durationMillis: 15000,
                },
            ]);
        });
    });

    // Test to close the attachment modal when the close button is pressed
    it('should close the add attachment modal when the close button is pressed', () => {
        // Renders the AddAttachments component
        const { getByText, getByTestId, queryByTestId } = render(
            <AddAttachments attachments={[]} onAttachmentsChange={onAttachmentsChangeMock} />
        );

        // Verify that the Insert Attachment is displayed
        expect(getByText('Insert Attachment')).toBeTruthy();
        // Press the Insert Attachment button
        fireEvent.press(getByText('Insert Attachment'));

        // Verifies that the attachment modal is opened with all the correct options
        expect(getByTestId('attachment-modal')).toBeTruthy();
        expect(getByText('File')).toBeTruthy();
        expect(getByText('Gallery')).toBeTruthy();
        expect(getByText('Camera')).toBeTruthy();
        expect(getByText('Audio')).toBeTruthy();

        // Press the add attachment modal close button
        fireEvent.press(getByTestId('add-attachment-close'));

        // Verify that the modal is closed
        expect(queryByTestId('attachment-modal')).toBeNull();
        // Ensure that not changes were made to attachments
        expect(onAttachmentsChangeMock).not.toHaveBeenCalled();
    });

    // Test to close the attachment modal when the overlay is pressed
    it('should close the add attachment modal when the overlay is pressed', () => {
        // Renders the AddAttachments component
        const { getByText, getByTestId, queryByTestId } = render(
            <AddAttachments attachments={[]} onAttachmentsChange={onAttachmentsChangeMock} />
        );

        // Verify that the Insert Attachment is displayed
        expect(getByText('Insert Attachment')).toBeTruthy();
        // Press the Insert Attachment button
        fireEvent.press(getByText('Insert Attachment'));

        // Verifies that the attachment modal is opened with all the correct options
        expect(getByTestId('attachment-modal')).toBeTruthy();
        expect(getByText('File')).toBeTruthy();
        expect(getByText('Gallery')).toBeTruthy();
        expect(getByText('Camera')).toBeTruthy();
        expect(getByText('Audio')).toBeTruthy();

        // Press the add attachment modal overlay
        fireEvent.press(getByTestId('attachment-TouchableWithoutFeedback'));

        // Verify that the modal is closed
        expect(queryByTestId('attachment-modal')).toBeNull();
        // Ensure that not changes were made to attachments
        expect(onAttachmentsChangeMock).not.toHaveBeenCalled();
    });

    // Test to close the recording modal when the close button is pressed
    it('should close the recording modal when the close button is pressed', async () => {
        // Renders the AddAttachments component
        const { getByText, getByTestId, queryByTestId } = render(
            <AddAttachments attachments={[]} onAttachmentsChange={onAttachmentsChangeMock} />
        );

        // Verify that the Insert Attachment is displayed
        expect(getByText('Insert Attachment')).toBeTruthy();
        // Press the Insert Attachment button
        fireEvent.press(getByText('Insert Attachment'));
        
        // Verify that the Audio option is displayed
        expect(getByText('Audio')).toBeTruthy();
        // Press the Audio option
        fireEvent.press(getByText('Audio'));

        await waitFor(() => {
            // Wait for the recording modal to open and verify that it is displayed with the test ID
            expect(getByTestId('recording-modal')).toBeTruthy();
            //  Verify that the Record option is displayed
            expect(getByText('Record')).toBeTruthy();
        });

        // Press the recording modal close button
        fireEvent.press(getByTestId('recording-modal-close'));
        
        // Verify that the attachment modal is closed
        expect(queryByTestId('attachment-modal')).toBeNull();
        // Verify that the recording modal is closed
        expect(queryByTestId('recording-modal')).toBeNull();
        // Ensure that not changes were made to attachments
        expect(onAttachmentsChangeMock).not.toHaveBeenCalled();
    });

    // Test to close the recording modal when the overlay is pressed
    it('should close the recording modal when the overlay is pressed', async () => {
        // Renders the AddAttachments component
        const { getByText, getByTestId, queryByTestId } = render(
            <AddAttachments attachments={[]} onAttachmentsChange={onAttachmentsChangeMock} />
        );

        // Verify that the Insert Attachment is displayed
        expect(getByText('Insert Attachment')).toBeTruthy();
        // Press the Insert Attachment button
        fireEvent.press(getByText('Insert Attachment'));

        // Verify that the Audio option is displayed
        expect(getByText('Audio')).toBeTruthy();
        // Press the Audio option
        fireEvent.press(getByText('Audio'));

        await waitFor(() => {
            // Wait for the recording modal to open and verify that it is displayed with the test ID
            expect(getByTestId('recording-modal')).toBeTruthy();
            //  Verify that the Record option is displayed
            expect(getByText('Record')).toBeTruthy();
        });

        // Press the recording modal overlay
        fireEvent.press(getByTestId('recording-TouchableWithoutFeedback'));
        
        // Verify that the attachment modal is closed
        expect(queryByTestId('attachment-modal')).toBeNull();
        // Verify that the recording modal is closed
        expect(queryByTestId('recording-modal')).toBeNull();
        // Ensure that not changes were made to attachments
        expect(onAttachmentsChangeMock).not.toHaveBeenCalled();
    });

    // Test to show an alert when the user denies camera permission
    it('should show an alert if the user denies camera permission', async () => {
        // Mock ImagePicker.requestCameraPermissionsAsync permission to be false
        ImagePicker.requestCameraPermissionsAsync.mockResolvedValueOnce({ granted: false });

        // Renders the AddAttachments component
        const { getByText } = render(
            <AddAttachments attachments={[]} onAttachmentsChange={onAttachmentsChangeMock} />
        );

        // Verify that the Insert Attachment is displayed
        expect(getByText('Insert Attachment')).toBeTruthy();
        // Press the Insert Attachment button
        fireEvent.press(getByText('Insert Attachment'));

        // Verify that the Camera option is displayed
        expect(getByText('Camera')).toBeTruthy();
        // Press the Camera option
        fireEvent.press(getByText('Camera'));

        await waitFor(() => {
            // Verify that an error alert is shown to the user when they deny camera access
            expect(Alert.alert).toHaveBeenCalledWith('Permission Error', 'Camera access is required.');
        });
    });

    // Test to show an alert when the user denies gallery permission
    it('should show an alert if the user denies gallery permission', async () => {
        // Mock ImagePicker.requestMediaLibraryPermissionsAsync permission to be false
        ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValueOnce({ granted: false });

        // Renders the AddAttachments component
        const { getByText } = render(
            <AddAttachments attachments={[]} onAttachmentsChange={onAttachmentsChangeMock} />
        );

        // Verify that the Insert Attachment is displayed
        expect(getByText('Insert Attachment')).toBeTruthy();
        // Press the Insert Attachment button
        fireEvent.press(getByText('Insert Attachment'));

        // Verify that the Gallery option is displayed
        expect(getByText('Gallery')).toBeTruthy();
        // Press the Gallery option
        fireEvent.press(getByText('Gallery'));

        await waitFor(() => {
            // Verify that an error alert is shown to the user when they deny gallery access
            expect(Alert.alert).toHaveBeenCalledWith('Permission Error', 'Gallery access is required.');
        });
    });

    // Test to show an alert when the user denies audio recording permission
    it('should show an alert if the user denies audio recording permission', async () => {
        // Mock Audio.requestPermissionsAsync permission to be false
        Audio.requestPermissionsAsync.mockResolvedValueOnce({ granted: false });

        // Renders the AddAttachments component
        const { getByText, getByTestId } = render(
            <AddAttachments attachments={[]} onAttachmentsChange={onAttachmentsChangeMock} />
        );

        // Verify that the Insert Attachment is displayed
        expect(getByText('Insert Attachment')).toBeTruthy();
        // Press the Insert Attachment button
        fireEvent.press(getByText('Insert Attachment'));

        // Verify that the Audio option is displayed
        expect(getByText('Audio')).toBeTruthy();
        // Press the Audio option
        fireEvent.press(getByText('Audio'));

        await waitFor(() => {
            // Wait for the recording modal to open and verify that it is displayed with the test ID
            expect(getByTestId('recording-modal')).toBeTruthy();
            //  Verify that the Record option is displayed
            expect(getByText('Record')).toBeTruthy();
        });

        // Press Record 
        fireEvent.press(getByText('Record'));

        await waitFor(() => {
            // Verify that an error alert is shown to the user when they deny audio recording access
            expect(Alert.alert).toHaveBeenCalledWith('Permission Error', 'Audio recording access is required.');
        });
    });

    // Test to show an alert when the file picking fails
    it('should show an alert if picking a file fails', async () => {
        // Mock the DocumentPicker.getDocumentAsync to throw an error
        DocumentPicker.getDocumentAsync.mockImplementationOnce(() => {
            throw new Error('Unexpected File Picker Error');
        });
    
        // Renders the AddAttachments component
        const { getByText } = render(
            <AddAttachments attachments={[]} onAttachmentsChange={onAttachmentsChangeMock} />
        );
    
        // Verify that the Insert Attachment is displayed
        expect(getByText('Insert Attachment')).toBeTruthy();
        // Press the Insert Attachment button
        fireEvent.press(getByText('Insert Attachment'));
    
        // Verify that the File option is displayed
        expect(getByText('File')).toBeTruthy();
        // Press the File option
        fireEvent.press(getByText('File'));
    
        await waitFor(() => {
            // Verify that an error alert is shown to the user when there is an error picking documents
            expect(Alert.alert).toHaveBeenCalledWith('File Error', 'Error picking document.');
        });
    });
    
    // Test to show an alert when opening the camera fails
    it('should show an alert if opening the camera fails', async () => {
        // Mock ImagePicker.requestCameraPermissionsAsync permission to be true
        ImagePicker.requestCameraPermissionsAsync.mockResolvedValueOnce({ granted: true });
        // Mock the ImagePicker.launchCameraAsync to throw an error
        ImagePicker.launchCameraAsync.mockImplementationOnce(() => {
            throw new Error('Unexpected Camera Error');
        });

        // Renders the AddAttachments component
        const { getByText } = render(
            <AddAttachments attachments={[]} onAttachmentsChange={onAttachmentsChangeMock} />
        );
    
        // Verify that the Insert Attachment is displayed
        expect(getByText('Insert Attachment')).toBeTruthy();
        // Press the Insert Attachment button
        fireEvent.press(getByText('Insert Attachment'));
    
        // Verify that the Camera option is displayed
        expect(getByText('Camera')).toBeTruthy();
        // Press the Camera option
        fireEvent.press(getByText('Camera'));
    
        await waitFor(() => {
            // Verify that an error alert is shown to the user when there is an error opening camera
            expect(Alert.alert).toHaveBeenCalledWith('Camera Error', 'Error opening camera.');
        });

    });

    // Test to show an alert when opening the gallery fails
    it('should show an alert if opening the gallery fails', async () => {
        // Mock ImagePicker.requestMediaLibraryPermissionsAsync permission to be true
        ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValueOnce({ granted: true });
        // Mock the ImagePicker.launchImageLibraryAsync to throw an error
        ImagePicker.launchImageLibraryAsync.mockImplementationOnce(() => {
            throw new Error('Unexpected Gallery Error');
        });
    
    
        // Renders the AddAttachments component
        const { getByText } = render(
            <AddAttachments attachments={[]} onAttachmentsChange={onAttachmentsChangeMock} />
        );
    
        // Verify that the Insert Attachment is displayed
        expect(getByText('Insert Attachment')).toBeTruthy();
        // Press the Insert Attachment button
        fireEvent.press(getByText('Insert Attachment'));
    
        // Verify that the Gallery option is displayed
        expect(getByText('Gallery')).toBeTruthy();
        // Press the Gallery option
        fireEvent.press(getByText('Gallery'));
    
        await waitFor(() => {
            // Verify that an error alert is shown to the user when there is an error opening gallery
            expect(Alert.alert).toHaveBeenCalledWith('Gallery Error', 'Error opening gallery.');
        });
    
    });
    
    // Test to show an alert when stopping the recording fails
    it('should show an alert if stopping the recording fails', async () => {
        // Mock the recording data with error
        const mockRecording = {
            getURI: () => 'file://recording.m4a',
            _finalDurationMillis: 15000,
            stopAndUnloadAsync: jest.fn().mockRejectedValueOnce(new Error('Unexpected Recording Stop Error')),
        };
        // Mock Audio.requestPermissionsAsync permission to be true
        Audio.requestPermissionsAsync.mockResolvedValueOnce({ granted: true });
        // Mock Audio.requestPermissionsAsync permission to be true
        Audio.Recording.createAsync.mockResolvedValueOnce({ recording: mockRecording });
    
        // Renders the AddAttachments component
        const { getByText, getByTestId } = render(
            <AddAttachments attachments={[]} onAttachmentsChange={onAttachmentsChangeMock} />
        );
    
        // Verify that the Insert Attachment is displayed
        expect(getByText('Insert Attachment')).toBeTruthy();
        // Press the Insert Attachment button
        fireEvent.press(getByText('Insert Attachment'));
        
        // Verify that the Audio option is displayed
        expect(getByText('Audio')).toBeTruthy();
        // Press the Audio option
        fireEvent.press(getByText('Audio'));

        await waitFor(() => {
            // Wait for the recording modal to open and verify that it is displayed with the test ID
            expect(getByTestId('recording-modal')).toBeTruthy();
            //  Verify that the Record option is displayed
            expect(getByText('Record')).toBeTruthy();
        });

        // Press Record 
        fireEvent.press(getByText('Record'));
    
        await waitFor(() => {
            // Wait for the Stop to be displayed
            expect(getByText('Stop')).toBeTruthy();
        });

        // Press Stop 
        fireEvent.press(getByText('Stop'));
    
        await waitFor(() => {
            // Verify that an error alert is shown to the user when there is an error stopping recording
            expect(Alert.alert).toHaveBeenCalledWith('Recording Error', 'Error stopping recording.');
        });
    });

    // Snapshot test for AddAttachments
    it('should match the snapshot', () => {
        // Renders the AddAttachments component
        const { toJSON } = render(
            <AddAttachments attachments={[]} onAttachmentsChange={onAttachmentsChangeMock} />
        );
    
        // Verify snapshot matches
        expect(toJSON()).toMatchSnapshot();
    });
});