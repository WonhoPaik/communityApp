import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";

const Stack = createNativeStackNavigator();

export default function AuthStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen name="Login" component={LoginScreen} options={{ title: "로그인" }}/>
            <Stack.Screen name="Register" component={RegisterScreen} options={{ title: "회원가입" }}/>
        </Stack.Navigator>
    );
}
