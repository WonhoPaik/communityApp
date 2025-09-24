import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    Image,
    Modal,
    TextInput,
    ActivityIndicator,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { Post } from '../../types/types';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import ConfirmModal from '../../components/ConfirmModal.tsx';
import commonStyles from '../../styles/commonStyles.ts';

export default function PostListScreen({ navigation }: any) {
    const [posts, setPosts] = useState<Post[]>([]);
    const [nicknameModalVisible, setNicknameModalVisible] = useState(false);
    const [nickname, setNickname] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    // 로그인한 유저
    useEffect(() => {
        const uid = auth().currentUser?.uid;
        if (!uid) return;

        const userRef = firestore().collection('users').doc(uid);
        userRef.get().then(doc => {
            if (!doc.exists || !doc.data()?.nickname) {
                setNicknameModalVisible(true);
            }
        });
    }, []);

    // 게시글 리스트업
    useEffect(() => {
        const unsub = firestore()
            .collection('posts')
            .orderBy('createdAt', 'desc')
            .onSnapshot(
                async snapshot => {
                    try {
                        const postData = snapshot.docs.map(doc => ({
                            id: doc.id,
                            ...doc.data(),
                        }));

                        // 작성자 닉네임
                        const userIds = Array.from(
                            new Set(postData.map((p: any) => p.uid).filter(Boolean)),
                        );
                        const userDocs = await Promise.all(
                            userIds.map(uid =>
                                firestore().collection('users').doc(uid).get(),
                            ),
                        );
                        const userMap: Record<string, string> = {};
                        userDocs.forEach(doc => {
                            if (doc.exists()) userMap[doc.id] = doc.data()?.nickname || '';
                        });

                        const withAuthor = postData.map((p: any) => ({
                            ...p,
                            nickname: userMap[p.uid] || '',
                            commentCount: p.commentCount ?? 0,
                        }));

                        setPosts(withAuthor);
                    } catch (err) {
                        setError('데이터 로딩 중 오류가 발생했습니다.');
                    } finally {
                        setLoading(false);
                    }
                },
                () => {
                    setError('Firestore 연결 실패');
                    setLoading(false);
                },
            );

        return unsub;
    }, []);

    // 로그아웃
    const handleLogout = async () => {
        const user = auth().currentUser;
        const isGoogleUser = user?.providerData.some(
            p => p.providerId === 'google.com',
        );
        try {
            if (isGoogleUser) {
                await GoogleSignin.signOut();
            }
            await auth().signOut();
        } catch (err) {
            console.error('Logout Error:', err);
        } finally {
            setShowLogoutConfirm(false);
        }
    };

    // 닉네임 설정
    const handleSaveNickname = async () => {
        const uid = auth().currentUser?.uid;
        if (!uid || !nickname.trim()) return;

        await firestore().collection('users').doc(uid).set(
            {
                nickname: nickname.trim(),
                updatedAt: firestore.FieldValue.serverTimestamp(),
            },
            { merge: true },
        );

        setNicknameModalVisible(false);
    };

    // 게시글 렌더링
    const renderItem = ({ item }: { item: Post }) => {
        const createdAt = item.createdAt?.toDate
            ? item.createdAt.toDate().toLocaleString()
            : "";
        const updatedAt = item.updatedAt?.toDate
            ? item.updatedAt.toDate().toLocaleString()
            : null;

        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate("PostDetail", { postId: item.id })}
            >
                {/* 썸네일 */}
                {item.imageUrl ? (
                    <Image source={{ uri: item.imageUrl }} style={styles.thumbnail} />
                ) : (
                    <View style={styles.noImage}>
                        <Text>📄</Text>
                    </View>
                )}

                {/* 게시글 정보 */}
                <View style={styles.info}>
                    <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
                        {item.title}
                    </Text>
                    <Text style={styles.meta}>
                        {item.nickname} · 댓글 {item.commentCount ?? 0} · 조회수 {item.views ?? 0}
                    </Text>
                    <Text style={styles.meta}>
                        작성일 : {updatedAt ? `${updatedAt} (수정됨)` : createdAt}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };




    return (
        <View style={styles.container}>
            {/* 상단 버튼 */}
            <View style={styles.topButtons}>
                <TouchableOpacity
                    style={styles.primaryBtn}
                    onPress={() => navigation.navigate('PostCreate')}
                >
                    <Text style={styles.primaryBtnText}>글 작성</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.warnBtn}
                    onPress={() => setShowLogoutConfirm(true)}
                >
                    <Text style={styles.warnBtnText}>로그아웃</Text>
                </TouchableOpacity>
            </View>

            {/* 게시글 리스트 */}
            {loading ? (
                <ActivityIndicator style={{ marginTop: 20 }} />
            ) : error ? (
                <Text style={{ color: 'red', textAlign: 'center' }}>{error}</Text>
            ) : (
                <FlatList
                    data={posts}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
                />
            )}

            {/* 닉네임 설정 모달 */}
            <Modal visible={nicknameModalVisible} transparent animationType="fade">
                <View style={commonStyles.modalOverlay}>
                    <View style={commonStyles.modalBox}>
                        <Text style={commonStyles.modalTitle}>닉네임 설정</Text>
                        <TextInput
                            style={commonStyles.modalInput}
                            placeholder="닉네임을 입력하세요"
                            value={nickname}
                            onChangeText={setNickname}
                        />
                        <TouchableOpacity
                            style={commonStyles.modalBtn}
                            onPress={handleSaveNickname}
                        >
                            <Text style={commonStyles.modalBtnText}>저장</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* 로그아웃 확인 모달 */}
            <ConfirmModal
                visible={showLogoutConfirm}
                message="정말 로그아웃 하시겠습니까?"
                confirmText="로그아웃"
                cancelText="취소"
                onConfirm={handleLogout}
                onCancel={() => setShowLogoutConfirm(false)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    // 컨테이너
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 16,
    },

    // 상단 버튼 그룹
    topButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    primaryBtn: {
        backgroundColor: '#2c7dd1',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
    },
    primaryBtnText: { color: '#fff', fontWeight: '600' },
    warnBtn: {
        backgroundColor: '#e14c4c',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
    },
    warnBtnText: { color: '#fff', fontWeight: '600' },

    // 게시글 카드
    card: {
        flexDirection: 'row',
        backgroundColor: '#f9fbff',
        borderRadius: 10,
        padding: 10,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    thumbnail: {
        width: 60,
        height: 60,
        borderRadius: 6,
        marginRight: 10,
        backgroundColor: '#ddd',
    },
    noImage: {
        width: 60,
        height: 60,
        borderRadius: 6,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    info: { flex: 1 },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
        color: 'black',
    },
    meta: { fontSize: 12, color: '#666' },
});
