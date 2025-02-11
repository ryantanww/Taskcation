// Import dependencies and libraries used for testing View File
import ViewFile from '../utils/ViewFile';
import * as FileSystem from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';
import { Alert, Platform, Linking, Share } from 'react-native';

describe('ViewFile', () => {
    // Clear all mocks before each test
    beforeEach(() => {
        jest.clearAllMocks();
        // Spy on Alert.alert to verify alerts
        jest.spyOn(Alert, 'alert').mockImplementation(() => {});
        // Mock Linking and Share to simulate returning success
        jest.spyOn(Linking, 'canOpenURL').mockResolvedValue(true);
        jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
        jest.spyOn(Share, 'share').mockResolvedValue(undefined); 
    });

    // Test to check if the file is copied to a local path when the URI starts with 'content://'
    it('should copy the file to a local path if the URI starts with "content://" on Android', async () => {
        // Mock Android platform
        Platform.OS = 'android';
        // Mock the file URI with 'content://'
        const mockUri = 'content://mock/file/uri';
        // Mock the file name
        const mockFileName = 'test.pdf';

        // Mock FileSystem's copyAsync method to simulate success
        FileSystem.StorageAccessFramework.copyAsync.mockResolvedValueOnce(
            FileSystem.documentDirectory + mockFileName
        );

        // Call ViewFile with the mock data
        await ViewFile(mockUri, mockFileName);

        // Verify that the copyAsync was called with the correct parameters
        expect(FileSystem.StorageAccessFramework.copyAsync).toHaveBeenCalledWith({
            from: mockUri,
            to: `${FileSystem.documentDirectory}${mockFileName}`,
        });
    });

    // Test to check if the file opens using IntentLauncher on Android
    it('should open the file using IntentLauncher on Android', async () => {
        // Mock Android platform
        Platform.OS = 'android';
        // Mock the file path
        const mockUri = 'mock/document/directory/test.pdf';
        // Mock the file name
        const mockFileName = 'test.pdf';
        // Mock the content URI for the file
        const mockContentUri = 'mock-content-uri';

        // Mock the FileSystem's getContentUriAsync  to return a content URI
        FileSystem.getContentUriAsync.mockResolvedValueOnce(mockContentUri);

        // Call ViewFile with the mock data
        await ViewFile(mockUri, mockFileName);

        // Verify that the IntentLauncher was called with the correct parameters
        expect(IntentLauncher.startActivityAsync).toHaveBeenCalledWith('android.intent.action.VIEW', {
            data: mockContentUri,
            flags: 1,
            type: '*/*',
        });
    });

    // Test to check if the file opens using Linking on iOS if it can be opened
    it('should open the file using Linking on iOS if it can be opened', async () => {
        // Mock iOS platform
        Platform.OS = 'ios';
        // Mock the file path
        const mockUri = 'mock/document/directory/test.pdf';
        // Mock the file name
        const mockFileName = 'test.pdf';

        // Call ViewFile with the mock data
        await ViewFile(mockUri, mockFileName);

        // Verify that the Linking.canOpenURL and Linking.openURL were called with the correct parameters
        expect(Linking.canOpenURL).toHaveBeenCalledWith(mockUri);
        expect(Linking.openURL).toHaveBeenCalledWith(mockUri);
    });

    // Test to check if the file shares if it cannot be opened via Linking
    it('should share the file on iOS if it cannot be opened via Linking', async () => {
        // Mock iOS platform
        Platform.OS = 'ios';
        // Mock the file path
        const mockUri = 'mock/document/directory/test.pdf';
        // Mock the file name
        const mockFileName = 'test.pdf';

        // Mock Linking.canOpenURL to return false.
        jest.spyOn(Linking, 'canOpenURL').mockResolvedValueOnce(false);

        // Call ViewFile with the mock data
        await ViewFile(mockUri, mockFileName);

        // Verify that Share.share was called with the correct parameters
        expect(Share.share).toHaveBeenCalledWith({ url: mockUri, title: mockFileName });
    });

    // Test to handle error when copying the files fails on Android
    it('should show an alert if copying the file fails on Android', async () => {
        // Mock Android platform
        Platform.OS = 'android';
        // Mock the file URI with 'content://'
        const mockUri = 'content://mock/file/uri';
        // Mock the file name
        const mockFileName = 'test.pdf';

        // Mock FileSystem's copyAsync method to simulate error
        FileSystem.StorageAccessFramework.copyAsync.mockRejectedValueOnce(new Error('Copy failed'));

        // Call ViewFile with the mock data
        await ViewFile(mockUri, mockFileName);

        // Verify that an error alert is shown to the user when unable to copy file from Storage Access Framework
        expect(Alert.alert).toHaveBeenCalledWith('Error', 'Unable to copy file from Storage Access Framework.');
    });

    // Test to handle error when file URI is invalid on Android
    it('should show an alert if the file URI is invalid', async () => {
        // Mock Android platform
        Platform.OS = 'android';
        // Invalid / empty URI
        const mockUri = '';
        // Mock the file name
        const mockFileName = 'test.pdf';

        // Call ViewFile with the mock data
        await ViewFile(mockUri, mockFileName);

        // Verify that an error alert is shown to the user for an invalid URI
        expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to resolve the file for viewing.');
    });

    // Test to handle error 
    it('should show an alert if opening the file fails', async () => {
        // Mock iOS platform
        Platform.OS = 'ios';
        // Mock the file path
        const mockUri = 'mock/document/directory/test.pdf';
        // Mock the file name
        const mockFileName = 'test.pdf';

        // Mock Linking.canOpenURL to return error.
        jest.spyOn(Linking, 'canOpenURL').mockRejectedValueOnce(new Error('Failed to open file'));

        // Call ViewFile with the mock data
        await ViewFile(mockUri, mockFileName);

        // Verify that an error alert is shown to the user when they cannot open file
        expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to open the file. Ensure you have a compatible viewer installed.');
    });
});
