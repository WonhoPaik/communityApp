import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import AuthStack from "./src/navigation/AuthStack";
import AppStack from "./src/navigation/AppStack";
import { useAuth } from "./src/hooks/useAuth";
import { enableScreens } from 'react-native-screens';
import {ActivityIndicator, View} from "react-native";
import { GoogleSignin } from '@react-native-google-signin/google-signin';
enableScreens(true);

GoogleSignin.configure({
    webClientId: '36219996357-jqj9qh8f2mmf3cir8ft7q0jg7734s35k.apps.googleusercontent.com',
});

export default function App() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            {user ? <AppStack /> : <AuthStack />}
        </NavigationContainer>
    );
}
