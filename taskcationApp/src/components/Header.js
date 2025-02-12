import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Header = () => {
    // Hook for navigating to other screens
    const navigation = useNavigation();

    return (
        <SafeAreaView>
            {/* Header container */}
            <View style={styles.header}>
                {/* App title navigates to Home on press */}
                <TouchableOpacity onPress={() => navigation.navigate('Home')}>
                    <Text style={styles.headerTitle}>Taskcation</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    // Style for header
    header: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 10,
        backgroundColor: '#8B4513',
    },
    // Style for logo
    logo: {
        width: 50, 
        height: 50, 
    },
    // Style for the header title
    headerTitle: {
        fontSize: 48,
        fontWeight: '800',
        color: '#F5F5DC',
        textAlign: 'center',
    },
    // Style for settings
    settings: {
        fontSize: 20,
        color: '#9b59b6',
    },
});

export default Header;
