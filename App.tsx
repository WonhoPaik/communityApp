import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import AuthStack from "./src/navigation/AuthStack";
import AppStack from "./src/navigation/AppStack";
import { useAuth } from "./src/hooks/useAuth";
import { enableScreens } from 'react-native-screens';
import {ActivityIndicator, View} from "react-native";
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { WEB_CLIENT_ID } from '@env';
enableScreens(true);

GoogleSignin.configure({
    webClientId: WEB_CLIENT_ID,
});

export default function App() {
    const { user, initializing } = useAuth();

    if (initializing) {
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
