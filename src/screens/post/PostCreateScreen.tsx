import React, { useState } from 'react';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import auth from '@react-native-firebase/auth';
import PostForm from '../../components/PostForm';
import { ActivityIndicator, View } from 'react-native';
import ConfirmModal from '../../components/ConfirmModal.tsx';
import { FormData, Post } from '../../types/types';
import CommonStyles from '../../styles/commonStyles.ts';

export default function PostCreateScreen({}: any) {
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    // 게시글 작성
    const handleCreate = async ({ title, content, image }: FormData) => {
        setLoading(true);
        try {
            let imageUrl = '';
            if (image?.uri) {
                const filename = `${Date.now()}-${image.fileName ?? 'img'}`;
                const ref = storage().ref(`posts/${filename}`);
                await ref.putFile(image.uri);
                imageUrl = await ref.getDownloadURL();
            }

            await firestore().runTransaction(async transaction => {
                const counterRef = firestore().collection('meta').doc('counters');
                const counterDoc = await transaction.get(counterRef);

                const current = counterDoc.exists()
                    ? counterDoc.data()?.postCounter || 0
                    : 0;
                const newNumber = current + 1;

                transaction.set(
                    counterRef,
                    { postCounter: newNumber },
                    { merge: true },
                );

                const newPost: Omit<Post, 'id'> = {
                    postNumber: newNumber,
                    title,
                    content,
                    imageUrl,
                    uid: auth().currentUser?.uid || '',
                    createdAt: firestore.FieldValue.serverTimestamp() as any,
                    updatedAt: null,
                    views: 0,
                    commentCount: 0,
                };

                const postRef = firestore().collection('posts').doc();
                transaction.set(postRef, newPost);
            });
        } catch (err) {
            console.error('작성실패:', err);
            setErrorMsg('게시글 작성 중 오류가 발생했습니다. 다시 시도해주세요.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={{ flex: 1 }}>
            <PostForm
                onSubmit={handleCreate}
                submitLabel="작성 완료"
                loading={loading}
            />

            {/* 로딩 표시 */}
            {loading && (
                <View style={CommonStyles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#2c7dd1" />
                </View>
            )}

            {/* 에러 모달 */}
            <ConfirmModal
                visible={!!errorMsg}
                message={errorMsg}
                confirmText="확인"
                onConfirm={() => setErrorMsg('')}
            />
        </View>
    );
}
