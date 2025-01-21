// jest.setup.js
jest.mock('@react-native-async-storage/async-storage', () =>
    require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

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
    
}));

jest.mock('./src/services/taskService', () => ({
    getTasksByCreator: jest.fn().mockResolvedValue([]), 
    updateTask: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@react-native-community/datetimepicker', () => {
    const mockDateTimePicker = ({ value, onChange }) => {
        return (
            <input
                type="date"
                value={value}
                onChange={(event) => onChange({ nativeEvent: { timestamp: event.target.value } })}
            />
        );
    };
    return {
        __esModule: true,
        default: mockDateTimePicker,
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


jest.spyOn(console, 'log').mockImplementation(() => {});
jest.spyOn(console, 'error').mockImplementation(() => {});