import React, { useEffect, useState } from "react";
import {ActivityIndicator, StyleSheet, View} from "react-native";
import firestore from "@react-native-firebase/firestore";
import PostForm from "../../components/PostForm";
import storage from "@react-native-firebase/storage";
import {Post} from "../../types/types.ts";
import ConfirmModal from "../../components/ConfirmModal";
interface EditData {
    title: string;
    content: string;
    image: { uri: string; fileName?: string } | null;
}

export default function PostEditScreen({ route }: any) {
    const { postId } = route.params;
    const [post, setPost] = useState<Post | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // 게시글 데이터 fetch
    useEffect(() => {
        const fetchPost = async () => {
            try {
                const doc = await firestore().collection("posts").doc(postId).get();
                if (doc.exists()) {
                    setPost(doc.data() as Post);
                }
            } catch (err) {
                console.error("Post fetch error:", err);
                setErrorMessage("게시글을 불러오는 중 문제가 발생했습니다.");
            }
        };
        fetchPost();
    }, [postId]);

    // 수정 저장 (기존 이미지 삭제)
    const handleSave = async (data: EditData) => {
        setLoading(true);
        try {
            let imageUrl = post?.imageUrl || "";

            const isNewImage = data.image && data.image.uri && data.image.uri !== post?.imageUrl;

            if (isNewImage) {
                if (post?.imageUrl) {
                    try {
                        const oldRef = storage().refFromURL(post.imageUrl);
                        await oldRef.delete();
                    } catch (err) {
                        console.warn("기존 이미지 삭제 실패:", err);
                    }
                }

                if (data.image?.uri) {
                    const fileName = data.image.fileName || `image-${Date.now()}.jpg`;
                    const ref = storage().ref(`posts/${Date.now()}-${fileName}`);
                    await ref.putFile(data.image.uri);
                    imageUrl = await ref.getDownloadURL();
                }
            }

            await firestore().collection("posts").doc(postId).update({
                title: data.title,
                content: data.content,
                imageUrl,
                updatedAt: firestore.FieldValue.serverTimestamp(),
            });
        } catch (err) {
            console.error(err);
            setErrorMessage("게시글 수정 중 문제가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };


    if (!post) return <ActivityIndicator style={{ flex: 1 }} />;

    return (
        <>
            {/* 작성 폼 */}
            <PostForm
                initialTitle={post.title}
                initialContent={post.content}
                initialImageUrl={post.imageUrl}
                onSubmit={handleSave}
                submitLabel="수정 완료"
                loading={loading}
            />
            {/* 로딩 표시 */}
            {loading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#2c7dd1" />
                </View>
            )}
            {/* 에러 모달 */}
            <ConfirmModal
                visible={!!errorMessage}
                message={errorMessage || ""}
                confirmText="확인"
                onConfirm={() => setErrorMessage(null)}
            />
        </>
    );
}
const styles = StyleSheet.create({
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.2)",
    },
});
