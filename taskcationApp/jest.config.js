/** @returns {Promise<import('jest').Config>} */
module.exports = async () => {
    return {
        verbose: true,
        projects: [
            {
                preset: "jest-expo/ios"
            },
            {
                preset: "jest-expo/android"
            }
        ],
        setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
        roots: ['<rootDir>'],
        moduleFileExtensions: ["js"],
        transform: {
            '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { rootMode: 'upward' }],
        },
        transformIgnorePatterns: [
            "node_modules/(?!(@react-native|jest-)?@react-native|react-native|react-native-payfort-sdk|react-clone-referenced-element|@react-native-community|expo(nent)?|@expo(nent)?/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|@sentry/.*)"
        ]

    };
};