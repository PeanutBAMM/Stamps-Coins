module.exports = {
    preset: "jest-expo",
    transformIgnorePatterns: [
        "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|lucide-react-native|react-native-reanimated|react-native-gesture-handler)"
    ],
    testPathIgnorePatterns: [
        "/node_modules/",
        "/__tests__/fixtures/"
    ],
    setupFilesAfterEnv: ["<rootDir>/jest.setup.js"]
};
