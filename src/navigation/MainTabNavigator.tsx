import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, View, TouchableOpacity, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LayoutDashboard, Wallet, TrendingUp, Scan, User } from 'lucide-react-native';
import { theme } from '../constants/theme';

// Screens
import DashboardScreen from '../screens/DashboardScreen';
import VaultsScreen from '../screens/VaultsScreen';
import MarketScreen from '../screens/MarketScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ScannerScreen from '../screens/ScannerScreen';

const Tab = createBottomTabNavigator();

const CustomTabBar = ({ state, descriptors, navigation }: any) => {
    return (
        <BlurView intensity={80} tint="dark" style={styles.tabBar}>
            {state.routes.map((route: any, index: number) => {
                const { options } = descriptors[route.key];
                const isFocused = state.index === index;

                const onPress = () => {
                    const event = navigation.emit({
                        type: 'tabPress',
                        target: route.key,
                        canPreventDefault: true,
                    });

                    if (!isFocused && !event.defaultPrevented) {
                        navigation.navigate(route.name);
                    }
                };

                let Icon = LayoutDashboard;
                if (route.name === 'Dashboard') Icon = LayoutDashboard;
                else if (route.name === 'Vaults') Icon = Wallet;
                else if (route.name === 'Market') Icon = TrendingUp;
                else if (route.name === 'Profile') Icon = User;

                // Center FAB for Scanner
                if (route.name === 'Scanner') {
                    return (
                        <TouchableOpacity
                            key={route.key}
                            onPress={onPress}
                            style={styles.fabContainer}
                            activeOpacity={0.7}
                        >
                            <View style={styles.fab}>
                                <Scan color="white" size={32} />
                            </View>
                        </TouchableOpacity>
                    );
                }

                return (
                    <TouchableOpacity
                        key={route.key}
                        onPress={onPress}
                        style={styles.tabItem}
                        activeOpacity={0.7}
                    >
                        <Icon
                            size={24}
                            color={isFocused ? theme.colors.primary : theme.colors.textSecondary}
                            strokeWidth={isFocused ? 2.5 : 2}
                        />
                    </TouchableOpacity>
                );
            })}
        </BlurView>
    );
};

export const MainTabNavigator = () => {
    return (
        <Tab.Navigator
            tabBar={(props) => <CustomTabBar {...props} />}
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: false,
            }}
        >
            <Tab.Screen name="Dashboard" component={DashboardScreen} />
            <Tab.Screen name="Vaults" component={VaultsScreen} />
            <Tab.Screen name="Scanner" component={ScannerScreen} />
            <Tab.Screen name="Market" component={MarketScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
};

const styles = StyleSheet.create({
    tabBar: {
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 30 : 20,
        left: 20,
        right: 20,
        height: 70,
        borderRadius: 35,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingHorizontal: 10,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
    },
    fabContainer: {
        top: -25,
        justifyContent: 'center',
        alignItems: 'center',
        width: 70,
        height: 70,
    },
    fab: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 10,
    },
});
