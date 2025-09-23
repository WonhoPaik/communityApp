import React, { useState } from "react";
import {
    View,
    TextInput,
    Text,
    StyleSheet,
    TouchableOpacity,
} from "react-native";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";

export default function RegisterScreen({ navigation }: any) {
    const [email, setEmail] = useState("");
    const [pw, setPw] = useState("");
    const [error, setError] = useState("");

    // 회원가입
    const handleRegister = async () => {
        const trimmedEmail = email.trim();
        const trimmedPw = pw.trim();

        if (!trimmedEmail || !trimmedPw) {
            setError("이메일과 비밀번호를 모두 입력해주세요.");
            return;
        }

        try {
            setError("");

            // 계정 생성
            const userCredential = await auth().createUserWithEmailAndPassword(trimmedEmail, trimmedPw);
            const uid = userCredential.user.uid;

            // 유저 정보 저장
            await firestore().collection("users").doc(uid).set({
                email: trimmedEmail,
                createdAt: firestore.FieldValue.serverTimestamp(),
            });
        } catch (err: any) {
            console.error("Register Error:", err);

            switch (err.code) {
                case "auth/email-already-in-use":
                    setError("이미 사용 중인 이메일입니다.");
                    break;
                case "auth/invalid-email":
                    setError("올바른 이메일 형식이 아닙니다.");
                    break;
                case "auth/weak-password":
                    setError("비밀번호는 6자리 이상이어야 합니다.");
                    break;
                default:
                    setError("회원가입 중 오류가 발생했습니다. 다시 시도해주세요.");
            }
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Community</Text>
            <Text style={styles.subtitle}>회원가입</Text>

            <TextInput
                style={styles.input}
                placeholder="이메일"
                placeholderTextColor="#9aa5b1"
                autoCapitalize="none"
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

            <TouchableOpacity style={styles.primaryBtn} onPress={handleRegister}>
                <Text style={styles.primaryBtnText}>가입하기</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.linkBtn}
                onPress={() => navigation.navigate("Login")}
            >
                <Text style={styles.linkText}>로그인 화면으로</Text>
            </TouchableOpacity>
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
        marginBottom: 30,
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
    primaryBtn: {
        width: "100%",
        backgroundColor: "#2c7dd1",
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 8,
    },
    primaryBtnText: {
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
});
