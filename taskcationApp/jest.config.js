// jest.config.js for optimising Expo and React Native
/** @returns {Promise<import('jest').Config>} */
module.exports = async () => {
    return {
        verbose: true,
        roots: ['<rootDir>', '<rootDir>/src'],
        setupFilesAfterEnv: [
            '@testing-library/jest-native/extend-expect',
            '<rootDir>/jest.setup.js',
        ],
        moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
        transform: {
            '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { rootMode: 'upward' }],
        },
        projects: [
            {
                preset: 'jest-expo/ios',
                transformIgnorePatterns: [
                    'node_modules/(?!(@react-native|react-native|@react-native-community|@react-navigation|react-native-elements|react-native-size-matters|react-native-dropdown-picker|react-native-ratings|expo-constants|expo-web-browser|expo-asset|expo-font|expo-location|expo-intent-launcher|expo-file-system|expo-av|expo-document-picker|expo-image-picker|expo-modules-core|@expo-modules|expo(nent)?|@expo(nent)?/.*|@unimodules|unimodules|sentry-expo|native-base|react-navigation|@firebase|firebase)/)'
                ],
                setupFilesAfterEnv: [
                    '@testing-library/jest-native/extend-expect',
                    '<rootDir>/jest.setup.js',
                ],
            },
            {
                preset: 'jest-expo/android',
                transformIgnorePatterns: [
                    'node_modules/(?!(@react-native|react-native|@react-native-community|@react-navigation|react-native-elements|react-native-size-matters|react-native-dropdown-picker|react-native-ratings|expo-constants|expo-web-browser|expo-asset|expo-font|expo-location|expo-intent-launcher|expo-file-system|expo-av|expo-document-picker|expo-image-picker|expo-modules-core|@expo-modules|expo(nent)?|@expo(nent)?/.*|@unimodules|unimodules|sentry-expo|native-base|react-navigation|@firebase|firebase)/)'
                ],
                setupFilesAfterEnv: [
                    '@testing-library/jest-native/extend-expect',
                    '<rootDir>/jest.setup.js',
                ],
            }
        ],
    };
};