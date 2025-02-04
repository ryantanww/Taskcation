// jest.setup.js
jest.mock('@react-native-async-storage/async-storage', () =>
    require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual('@react-navigation/native');
    return {
        ...actualNav,
        useIsFocused: jest.fn(() => true),
    };
});

jest.mock('expo-font', () => ({
    loadAsync: jest.fn().mockResolvedValue(undefined),
    isLoaded: jest.fn().mockReturnValue(true),
}));

jest.mock('./firebaseConfig', () => ({
    db: {
        collection: jest.fn().mockReturnValue({
            doc: jest.fn().mockReturnValue({
                set: jest.fn(),
                get: jest.fn().mockResolvedValue({ exists: true, data: () => ({ username: 'test_user' }) }),
            }),
        }),
    },
}));

jest.mock('./src/services/userService', () => ({
    createUser: jest.fn(),
}));

jest.mock('./src/services/groupsService', () => ({
    createGroup: jest.fn(),
    getGroupsByCreator: jest.fn().mockResolvedValue([]), 
    deleteGroup: jest.fn(),
    updateGroup: jest.fn(),
    getGroupByID: jest.fn(),
}));

jest.mock('./src/services/priorityLevelsService', () => ({
    getAllPriorities: jest.fn().mockResolvedValue([]),
    getPriorityByID: jest.fn(),
}));

jest.mock('./src/services/gradesService', () => ({
    getGradeByID: jest.fn(),
}));

// Mock Firestore Timestamp
const Timestamp = {
    fromDate: (date) => ({
        seconds: Math.floor(date.getTime() / 1000),
        nanoseconds: (date.getTime() % 1000) * 1e6,
        toDate: () => date,
        toMillis: () => date.getTime(),
    }),
};

jest.mock('./src/services/taskService', () => ({
    getTaskByID: jest.fn(),
    getTasksByCreator: jest.fn().mockResolvedValue([
        { id: '1', task_name: 'Task 1', status: false, end_date: Timestamp.fromDate(new Date('2025-01-20T03:05:00Z')), },
        { id: '2', task_name: 'Task 2', status: true, end_date: Timestamp.fromDate(new Date('2025-01-21T01:20:30Z')), },
    ]), 
    updateTask: jest.fn(),
    createTask: jest.fn(),
    deleteTask: jest.fn(),
}));

jest.mock('./src/services/subtaskService', () => ({
    getSubtasksByTaskID: jest.fn().mockResolvedValue([
        { id: '1', subtask_name: 'Task 1', status: false, end_date: Timestamp.fromDate(new Date('2025-01-20T03:05:00Z')), },
        { id: '2', subtask_name: 'Task 2', status: true, end_date: Timestamp.fromDate(new Date('2025-01-21T01:20:30Z')), },
    ]), 
    updateSubtask: jest.fn(),
    createSubtask: jest.fn(),
    deleteSubtask: jest.fn(),
}));

jest.mock('./src/services/attachmentService', () => ({
    createAttachment: jest.fn(),
    getAttachmentsByTaskID: jest.fn().mockResolvedValue([
        { id: '1', uri: 'https://test.com/image1.jpg', file_name: 'Image 1', file_type: 'image/png' },
        { id: '2', uri: 'https://test.com/audio1.mp3', file_name: 'Audio 1', file_type: 'audio/mp3' },
        { id: '3', uri: 'https://test.com/document1.pdf', file_name: 'Document 1', file_type: 'application/pdf' },
    ]),
    getAttachmentsBySubtaskID: jest.fn().mockResolvedValue([
        { id: '1', uri: 'https://test.com/image1.jpg', file_name: 'Image 1', file_type: 'image/png' },
        { id: '2', uri: 'https://test.com/audio1.mp3', file_name: 'Audio 1', file_type: 'audio/mp3' },
        { id: '3', uri: 'https://test.com/document1.pdf', file_name: 'Document 1', file_type: 'application/pdf' },
    ]),
    deleteAttachment: jest.fn(),
}));



jest.mock('@react-native-community/datetimepicker', () => {
    const React = require('react');
    const { View, TouchableOpacity, Text } = require('react-native');
    return jest.fn(({ testID, onChange }) => (
        <TouchableOpacity testID={testID} onPress={() => { /* Do nothing */ }}>
            <Text>DateTimePicker</Text>
        </TouchableOpacity>
    ));
});

jest.mock('react-native-dropdown-picker', () => {
    const React = require('react');
    const { TouchableOpacity, Text, View } = require('react-native');
    return function MockDropDownPicker({ placeholder, open, setOpen, value, setValue, items }) {
        return (
            <View>
                {open && items.map((item) => (
                        <TouchableOpacity
                            key={item.value}
                            onPress={() => {
                            setValue(item.value);
                            setOpen(false);
                            }}
                        >
                            <Text>{item.label}</Text>
                        </TouchableOpacity>
                    ))
                }
                <TouchableOpacity
                    testID={`${placeholder}-button`}
                    onPress={() => setOpen(!open)}
                >
                    <Text>{placeholder}</Text>
                </TouchableOpacity>
            </View>
        );
    };
});

jest.mock('react-native-gesture-handler', () => {
    const View = require('react-native').View;
    return {
        GestureHandlerRootView: View,
        Swipeable: View,
        DrawerLayout: View,
        State: {},
        PanGestureHandler: View,
        TapGestureHandler: View,
        FlingGestureHandler: View,
        LongPressGestureHandler: View,
        PinchGestureHandler: View,
        RotationGestureHandler: View,
        ScrollView: View,
        Slider: View,
        Switch: View,
        TextInput: View,
        ToolbarAndroid: View,
        ViewPagerAndroid: View,
        DrawerLayoutAndroid: View,
        WebView: View,
        NativeViewGestureHandler: View,
        BorderlessButton: View,
        BaseButton: View,
        RectButton: View,
        FlatList: View,
        gestureHandlerRootHOC: (Component) => Component,
        Directions: {},
    };
});

jest.mock('expo-file-system', () => ({
    documentDirectory: 'mock/document/directory/',
    StorageAccessFramework: {
        copyAsync: jest.fn(),
    },
    getContentUriAsync: jest.fn(() => Promise.resolve('mock-content-uri')),
}));

jest.mock('expo-intent-launcher', () => ({
    startActivityAsync: jest.fn(),
    ACTION_MANAGE_OVERLAY_PERMISSION: 'ACTION_MANAGE_OVERLAY_PERMISSION',
}));

jest.mock('expo-document-picker', () => ({
    getDocumentAsync: jest.fn(),
}));

jest.mock('expo-image-picker', () => ({
    requestCameraPermissionsAsync: jest.fn(),
    requestMediaLibraryPermissionsAsync: jest.fn(),
    launchCameraAsync: jest.fn(),
    launchImageLibraryAsync: jest.fn(),
}));

jest.mock('expo-av', () => ({
    Audio: {
        requestPermissionsAsync: jest.fn(),
        Recording: {
            createAsync: jest.fn(),
        },
        RecordingOptionsPresets: {
            HIGH_QUALITY: {},
        },
        Sound: jest.fn(() => ({
            loadAsync: jest.fn(),
            playAsync: jest.fn(),
            pauseAsync: jest.fn(),
            stopAsync: jest.fn(),
            unloadAsync: jest.fn(),
            setPositionAsync: jest.fn(),
            setOnPlaybackStatusUpdate: jest.fn(),
        })),
        
    },
}));

jest.mock('react-native/Libraries/Linking/Linking', () => ({
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    openURL: jest.fn(),
    canOpenURL: jest.fn(() => Promise.resolve(true)),
    getInitialURL: jest.fn().mockResolvedValue(null),
}));


jest.spyOn(console, 'log').mockImplementation(() => {});
jest.spyOn(console, 'error').mockImplementation(() => {});
jest.spyOn(console, 'warn').mockImplementation(() => {});