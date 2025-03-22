// Import dependencies and libraries used in View File
import { Alert, Platform, Linking, Share } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';

const ViewFile = async (originalUri, fileName, mimeType = '*/*') => {
    try {
        // Store original URI
        let localUri = originalUri;
        
        // Handle Android specific URI that starts with 'content://'
        if (Platform.OS == 'android' && localUri.startsWith('content://')) {
            try {
                // Define the path to copy the file
                const copyPath = FileSystem.documentDirectory + fileName;
                await FileSystem.StorageAccessFramework.copyAsync({
                    from: localUri,
                    to: copyPath,
                });
                // Update the URI to the copied file
                localUri = copyPath;
            } catch (error) {
                // Log any errors when copying files from Storage Access Framework
                console.error('Error copying file via Storage Access Framework:', error);
                // Alert error when copying files from Storage Access Framework
                Alert.alert('Error', 'Unable to copy file from Storage Access Framework.');
                return;
            }
            
        }
    
        // Ensure that localUri is valid or not empty
        if (!localUri || localUri.trim() === '') {
            // Alert error when localUri is invalid or empty
            Alert.alert('Error', 'Failed to resolve the file for viewing.');
            return;
        }


        // Handle file opening for Android
        if (Platform.OS === 'android') {
            // Get the content URI for the file
            const contentUri = await FileSystem.getContentUriAsync(localUri);
            /**
                Start an intent to view the file using an external app.
                Referenced from: https://blog.bitsrc.io/displaying-files-with-expo-addressing-the-headers-challenge-5e34f58029a0
             */
            await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
                data: contentUri,
                flags: 1,
                type: mimeType,
            });
        } else {// Handle file opening for iOS
            // Checks if the URL can be opened
            const canOpen = await Linking.canOpenURL(localUri);
            if (canOpen) {
                // Open the file using the default app
                await Linking.openURL(localUri);
            } else {
                // Fallback to sharing if opening fails
                await Share.share({ url: localUri, title: fileName || 'Open File' });
            }
        }
    } catch (error) {
        // Log any errors when opening files
        console.error('Error opening file:', error);
        // Alert error when opening files
        Alert.alert('Error', 'Failed to open the file. Ensure you have a compatible viewer installed.');
    }
};

export default ViewFile;