import '@testing-library/jest-native/extend-expect';

// Mock Env Vars for Supabase
process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://mock.supabase.co';
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'mock-key';

// Mock Async Storage
jest.mock('@react-native-async-storage/async-storage', () =>
    require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock Lucide Icons (return simple strings or View)
jest.mock('lucide-react-native', () => ({
    Search: () => 'Search',
    Filter: () => 'Filter',
    Grid: () => 'Grid',
    List: () => 'List',
    ArrowLeft: () => 'ArrowLeft',
    Trash2: () => 'Trash2',
    Edit2: () => 'Edit2',
    FolderInput: () => 'FolderInput',
    // Add others as needed
}));

// Mock Reanimated
// Mock Reanimated
jest.mock('react-native-reanimated', () => ({
    default: {
        call: () => { },
        createAnimatedComponent: (c) => c,
        View: 'View',
    },
    useSharedValue: (v) => ({ value: v }),
    useAnimatedStyle: () => ({}),
}));

// Mock Gesture Handler
jest.mock('react-native-gesture-handler', () => {
    const View = require('react-native').View;
    return {
        Swipeable: View,
        GestureHandlerRootView: View,
        State: {},
        Directions: {},
    };
});
