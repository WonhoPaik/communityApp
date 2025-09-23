import React, { useState } from "react";
import {
    View,
    TextInput,
    Text,
    StyleSheet,
    TouchableOpacity, Image,
} from "react-native";
import auth from "@react-native-firebase/auth";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import firestore from "@react-native-firebase/firestore";
import ConfirmModal from "../../components/ConfirmModal";

export default function LoginScreen({ navigation }: any) {
    const [email, setEmail] = useState("");
    const [pw, setPw] = useState("");
    const [error, setError] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    // 구글 로그인
    const signInWithGoogle = async () => {
        try {
            const userInfo = await GoogleSignin.signIn();

            const { idToken } = await GoogleSignin.getTokens();
            if (!idToken) throw new Error("Google 로그인 실패: idToken 없음");

            const googleCredential = auth.GoogleAuthProvider.credential(idToken);
            const result = await auth().signInWithCredential(googleCredential);

            if (result.user) {
                const uid = result.user.uid;
                const userDoc = firestore().collection("users").doc(uid);
                const snapshot = await userDoc.get();

                if (!snapshot.exists) {
                    await userDoc.set({
                        email: result.user.email,
                        createdAt: firestore.FieldValue.serverTimestamp(),
                    });
                }
            }

            return result;
        } catch (error) {
            console.error("Google 로그인 오류:", error);
            setErrorMessage("Google 로그인 중 오류가 발생했습니다.");
        }
    };


    // 이메일 로그인
    const handleLogin = async () => {
        try {
            await auth().signInWithEmailAndPassword(email.trim(), pw.trim());
        } catch (err: any) {
            console.log("Login Error:", err.code, err.message);

            let msg = "로그인 중 오류가 발생했습니다.";

            switch (err.code) {
                case "auth/invalid-email":
                    msg = "올바른 이메일 형식이 아닙니다.";
                    break;
                case "auth/user-not-found":
                    msg = "가입되지 않은 이메일입니다.";
                    break;
                case "auth/wrong-password":
                    msg = "비밀번호가 올바르지 않습니다.";
                    break;
                case "auth/too-many-requests":
                    msg = "로그인 시도가 너무 많습니다. 잠시 후 다시 시도하세요.";
                    break;
                default:
                    msg = "알 수 없는 오류가 발생했습니다.";
            }

            setError(msg);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Community</Text>
            <Text style={styles.subtitle}>로그인</Text>

            <TouchableOpacity style={styles.googleBtn} onPress={signInWithGoogle}>
                <Image
                    source={{ uri: 'https://developers.google.com/identity/images/g-logo.png' }}
                    style={{ width: 20, height: 20, marginRight: 5 }}
                />
                <Text style={styles.googleBtnText}>Google로 로그인</Text>
            </TouchableOpacity>

            <View style={styles.dividerBox}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>또는</Text>
                <View style={styles.divider} />
            </View>

            <TextInput
                style={styles.input}
                placeholder="이메일"
                placeholderTextColor="#9aa5b1"
                value={email}
                onChangeText={setEmail}
            />
            <TextInput
                style={styles.input}
                placeholder="비밀번호"
                placeholderTextColor="#9aa5b1"
                secureTextEntry
                value={pw}
                onChangeText={setPw}
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
                <Text style={styles.loginBtnText}>로그인</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.linkBtn}
                onPress={() => navigation.navigate("Register")}
            >
                <Text style={styles.linkText}>회원가입</Text>
            </TouchableOpacity>

            <ConfirmModal
                visible={!!errorMessage}
                message={errorMessage}
                confirmText="확인"
                onConfirm={() => setErrorMessage("")}
                onCancel={() => setErrorMessage("")}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "flex-start",
        alignItems: "center",
        backgroundColor: "#ffffff",
        padding: 24,
        paddingTop: 80,
    },
    title: {
        fontSize: 28,
        fontWeight: "700",
        color: "#2c4a7d",
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 18,
        color: "#5a6c8b",
        marginBottom: 15,
    },
    input: {
        width: "100%",
        borderWidth: 1,
        borderColor: "#d0d7e2",
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 16,
        marginBottom: 12,
        color: "#333",
        backgroundColor: "#f9fbff",
    },
    error: {
        color: "red",
        marginBottom: 10,
    },
    loginBtn: {
        width: "100%",
        backgroundColor: "#2c7dd1",
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 8,
    },
    loginBtnText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    linkBtn: {
        marginTop: 16,
    },
    linkText: {
        color: "#2c7dd1",
        fontSize: 14,
    },
    googleBtn: {
        marginTop: 12,
        width: "100%",
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#ddd",
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
    },
    googleBtnText: {
        fontSize: 15,
        fontWeight: "600",
        color: "#333",
        marginLeft: 8,
    },
    dividerBox: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 20,
        width: "100%",
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: "#ddd",
    },
    dividerText: {
        marginHorizontal: 8,
        fontSize: 14,
        color: "#999",
    },

});
