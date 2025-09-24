import React, { useState } from 'react';
import {
    View,
    TextInput,
    Text,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import commonStyles from '../../styles/commonStyles.ts';

export default function RegisterScreen({ navigation }: any) {
    const [email, setEmail] = useState('');
    const [pw, setPw] = useState('');
    const [error, setError] = useState('');

    // 회원가입
    const handleRegister = async () => {
        const trimmedEmail = email.trim();
        const trimmedPw = pw.trim();

        if (!trimmedEmail || !trimmedPw) {
            setError('이메일과 비밀번호를 모두 입력해주세요.');
            return;
        }

        try {
            setError('');

            // 계정 생성
            const userCredential = await auth().createUserWithEmailAndPassword(
                trimmedEmail,
                trimmedPw,
            );
            const uid = userCredential.user.uid;

            // 유저 정보 저장
            await firestore().collection('users').doc(uid).set({
                email: trimmedEmail,
                createdAt: firestore.FieldValue.serverTimestamp(),
            });
        } catch (err: any) {
            console.error('Register Error:', err);

            switch (err.code) {
                case 'auth/email-already-in-use':
                    setError('이미 사용 중인 이메일입니다.');
                    break;
                case 'auth/invalid-email':
                    setError('올바른 이메일 형식이 아닙니다.');
                    break;
                case 'auth/weak-password':
                    setError('비밀번호는 6자리 이상이어야 합니다.');
                    break;
                default:
                    setError('회원가입 중 오류가 발생했습니다. 다시 시도해주세요.');
            }
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Community</Text>
            <Text style={styles.subtitle}>회원가입</Text>

            <TextInput
                style={commonStyles.input}
                placeholder="이메일"
                placeholderTextColor="#9aa5b1"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
            />
            <TextInput
                style={commonStyles.input}
                placeholder="비밀번호"
                placeholderTextColor="#9aa5b1"
                secureTextEntry
                value={pw}
                onChangeText={setPw}
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TouchableOpacity
                style={commonStyles.primaryBtn}
                onPress={handleRegister}
            >
                <Text style={commonStyles.primaryBtnText}>가입하기</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={commonStyles.navBtn}
                onPress={() => navigation.navigate('Login')}
            >
                <Text style={commonStyles.navText}>로그인 화면으로</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    // 컨테이너
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        padding: 24,
        paddingTop: 80,
    },

    // 제목 / 에러
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#2c4a7d',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 18,
        color: '#5a6c8b',
        marginBottom: 30,
    },
    error: {
        color: 'red',
        marginBottom: 10,
    },
});
