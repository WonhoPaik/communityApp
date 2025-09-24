import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    FlatList,
    Image,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';
import { useNavigation } from '@react-navigation/core';
import { Post, Comment } from '../../types/types';
import ConfirmModal from '../../components/ConfirmModal';
import functions from '@react-native-firebase/functions';

export default function PostDetailScreen({ route }: any) {
    const navigation = useNavigation<any>();
    const { postId } = route.params;
    const [post, setPost] = useState<Post | null>(null);
    const [author, setAuthor] = useState<string>('');
    const [comments, setComments] = useState<Comment[]>([]);
    const [commentText, setCommentText] = useState('');
    const [showInput, setShowInput] = useState(false);
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editText, setEditText] = useState('');
    const [showDeletePost, setShowDeletePost] = useState(false);
    const [showDeleteComment, setShowDeleteComment] = useState<{
        visible: boolean;
        id?: string;
    }>({ visible: false });
    const [errorMessage, setErrorMessage] = useState('');

    // 게시글 정보 불러오기
    useEffect(() => {
        // 게시글 조회수 증가(Functions 사용)
        if (postId) {
            functions()
                .httpsCallable('incrementViews')({ postId })
                .catch(err => console.error('조회수 증가 실패:', err));
        }
        // 게시글 정보
        const unsubPost = firestore()
            .collection('posts')
            .doc(postId)
            .onSnapshot(async doc => {
                if (doc.exists()) {
                    const data = doc.data() as Post;
                    setPost(data);

                    if (data?.uid) {
                        const userDoc = await firestore()
                            .collection('users')
                            .doc(data.uid)
                            .get();
                        setAuthor(
                            userDoc.exists() ? userDoc.data()?.nickname : '알 수 없음',
                        );
                    }
                }
            });

        // 댓글 정보
        const unsubComments = firestore()
            .collection('posts')
            .doc(postId)
            .collection('comments')
            .orderBy('createdAt', 'asc')
            .onSnapshot(async snapshot => {
                const commentData = snapshot.docs.map(doc => ({
                    ...(doc.data() as Omit<Comment, 'id'>),
                    id: doc.id,
                }));

                // 작성자 닉네임 매핑
                const userIds = Array.from(
                    new Set(commentData.map((c: any) => c.uid).filter(Boolean)),
                );
                const userDocs = await Promise.all(
                    userIds.map(uid => firestore().collection('users').doc(uid).get()),
                );
                const userMap: Record<string, string> = {};
                userDocs.forEach(doc => {
                    if (doc.exists())
                        userMap[doc.id] = doc.data()?.nickname || '알 수 없음';
                });

                const withAuthor = commentData.map((c: any) => ({
                    ...c,
                    nickname: userMap[c.uid] || '알 수 없음',
                }));

                setComments(withAuthor);
            });

        return () => {
            unsubPost();
            unsubComments();
        };
    }, [postId]);
    // 댓글 작성
    const addComment = async () => {
        if (!commentText.trim()) return;
        try {
            await firestore()
                .collection('posts')
                .doc(postId)
                .collection('comments')
                .add({
                    text: commentText.trim(),
                    uid: auth().currentUser?.uid,
                    parentId: null,
                    createdAt: firestore.FieldValue.serverTimestamp(),
                    updatedAt: firestore.FieldValue.serverTimestamp(),
                });
            await firestore()
                .collection('posts')
                .doc(postId)
                .update({
                    commentCount: firestore.FieldValue.increment(1),
                });
            setCommentText('');
            setShowInput(false);
        } catch (err) {
            console.error('댓글 작성 오류:', err);
            setErrorMessage('댓글 작성 중 문제가 발생했습니다.');
        }
    };

    // 대댓글 작성
    const addReply = async (parentId: String) => {
        if (!replyText.trim()) return;
        try {
            await firestore()
                .collection('posts')
                .doc(postId)
                .collection('comments')
                .add({
                    text: replyText.trim(),
                    uid: auth().currentUser?.uid,
                    parentId,
                    createdAt: firestore.FieldValue.serverTimestamp(),
                    updatedAt: firestore.FieldValue.serverTimestamp(),
                });
            await firestore()
                .collection('posts')
                .doc(postId)
                .update({
                    commentCount: firestore.FieldValue.increment(1),
                });
            setReplyText('');
            setReplyingTo(null);
        } catch (err) {
            console.error('대댓글 작성 오류:', err);
            setErrorMessage('대댓글 작성 중 문제가 발생했습니다.');
        }
    };

    const startEdit = (id: string, text: string) => {
        setEditingId(id);
        setEditText(text);
    };
    // 수정
    const saveEdit = async (id: string) => {
        try {
            await firestore()
                .collection('posts')
                .doc(postId)
                .collection('comments')
                .doc(id)
                .update({
                    text: editText.trim(),
                    updatedAt: firestore.FieldValue.serverTimestamp(),
                });
            setEditingId(null);
            setEditText('');
        } catch (err) {
            console.error('댓글 수정 오류:', err);
            setErrorMessage('댓글 수정 중 문제가 발생했습니다.');
        }
    };

    // 게시글 삭제
    const handleDeletePost = async () => {
        try {
            const postRef = firestore().collection('posts').doc(postId);

            if (post?.imageUrl) {
                const ref = storage().refFromURL(post.imageUrl);
                await ref.delete().catch(err => console.warn('이미지 삭제 실패:', err));
            }

            const commentsSnap = await postRef.collection('comments').get();
            const batch = firestore().batch();
            commentsSnap.forEach(doc => {
                batch.delete(doc.ref);
            });
            batch.delete(postRef);
            await batch.commit();

            navigation.goBack();
        } catch (err) {
            console.error('게시글 삭제 오류:', err);
            setErrorMessage('게시글 삭제 중 문제가 발생했습니다.');
        } finally {
            setShowDeletePost(false);
        }
    };

    // 댓글 삭제
    const handleDeleteComment = async (id: string) => {
        try {
            const commentRef = firestore()
                .collection("posts")
                .doc(postId)
                .collection("comments")
                .doc(id);

            await commentRef.update({
                isDeleted: true,
                updatedAt: firestore.FieldValue.serverTimestamp(),
            });

            await firestore()
                .collection("posts")
                .doc(postId)
                .update({
                    commentCount: firestore.FieldValue.increment(-1),
                });
        } catch (err) {
            console.error('댓글 삭제 오류:', err);
            setErrorMessage('댓글 삭제 중 문제가 발생했습니다.');
        } finally {
            setShowDeleteComment({ visible: false });
        }
    };
    //원댓글 + 대댓글 그룹
    const groupedComments = comments
        .filter(c => !c.parentId)
        .map(parent => ({
            ...parent,
            replies: comments.filter(c => c.parentId === parent.id),
        }));

    return (
        <View style={styles.container}>
            {post && (
                <View style={styles.postBox}>
                    {/* 제목 + 수정/삭제 */}
                    <View style={styles.postHeader}>
                        <Text style={styles.title}>{post.title}</Text>
                        {post.uid === auth().currentUser?.uid && (
                            <View style={styles.postActions}>
                                <TouchableOpacity
                                    onPress={() => navigation.navigate('PostEdit', { postId })}
                                >
                                    <Text style={styles.actionText}>수정</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setShowDeletePost(true)}>
                                    <Text style={[styles.actionText, { color: 'red' }]}>
                                        삭제
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                    {/* 작성자 + 작성일 + 내용 */}
                    <View style={styles.metaRow}>
                        <Text style={styles.metaLeft}>
                            작성자: {author}
                            {"\n"}
                            {post.updatedAt &&
                            post.updatedAt?.toDate &&
                            post.updatedAt.toDate().getTime() !==
                            post.createdAt?.toDate()?.getTime()
                                ? `작성일: ${post.updatedAt.toDate().toLocaleString()} (수정됨)`
                                : `작성일: ${
                                    post.createdAt?.toDate
                                        ? post.createdAt.toDate().toLocaleString()
                                        : "로딩중..."
                                }`}
                        </Text>
                        <Text style={styles.metaRight}>조회수 {post.views ?? 0}</Text>
                    </View>
                    {post.imageUrl ? (
                        <Image source={{ uri: post.imageUrl }} style={styles.image} />
                    ) : null}
                    <Text style={styles.content}>{post.content}</Text>
                </View>
            )}

            {/* 댓글 헤더 + 작성 */}
            <View style={styles.commentHeaderBox}>
                <Text style={styles.commentHeader}>댓글 ({post?.commentCount ?? 0})</Text>
                <TouchableOpacity onPress={() => setShowInput(!showInput)}>
                    <Text style={styles.commentBtn}>작성</Text>
                </TouchableOpacity>
            </View>

            {/* 댓글 입력창 (토글 방식) */}
            {showInput && (
                <View style={styles.commentInputBox}>
                    <TextInput
                        placeholder="댓글 입력"
                        value={commentText}
                        onChangeText={setCommentText}
                        style={styles.commentInput}
                    />
                    <TouchableOpacity onPress={addComment} style={styles.submitBtn}>
                        <Text style={styles.submitText}>저장</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* 댓글 리스트 */}
            <FlatList
                data={groupedComments}
                keyExtractor={item => item.id}
                renderItem={({ item }) => {
                    const isMine = item.uid === auth().currentUser?.uid;
                    const isEditing = editingId === item.id;

                    return (
                        <View style={styles.commentRow}>
                            {/* 댓글 */}
                            {item.isDeleted ? (
                                <Text style={[styles.deletedText]}>삭제된 댓글입니다.</Text>
                            ) : (
                                <>
                                    <View style={styles.commentContentRow}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.commentMeta}>
                                                {item.nickname} ·{' '}
                                                {item.updatedAt?.toDate
                                                    ? item.updatedAt.toDate().toLocaleString()
                                                    : '로딩중...'}
                                                {item.updatedAt &&
                                                item.updatedAt.toDate()?.getTime() !==
                                                item.createdAt?.toDate()?.getTime()
                                                    ? ' (수정됨)'
                                                    : ''}
                                            </Text>
                                            {isEditing ? (
                                                <View style={styles.editBox}>
                                                    <TextInput
                                                        value={editText}
                                                        onChangeText={setEditText}
                                                        style={styles.editInput}
                                                    />
                                                    <TouchableOpacity
                                                        onPress={() => saveEdit(item.id)}
                                                        style={styles.saveBtn}
                                                    >
                                                        <Text style={styles.saveText}>저장</Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity
                                                        onPress={() => setEditingId(null)}
                                                        style={styles.cancelBtn}
                                                    >
                                                        <Text style={styles.cancelText}>취소</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            ) : (
                                                <Text style={styles.commentText}>{item.text}</Text>
                                            )}
                                        </View>

                                        {/* 수정/삭제/답글 버튼 */}
                                        {!isEditing && (
                                            <View style={styles.actionTextRow}>
                                                {isMine && (
                                                    <>
                                                        <TouchableOpacity
                                                            onPress={() => startEdit(item.id, item.text)}
                                                        >
                                                            <Text style={styles.actionText}>수정</Text>
                                                        </TouchableOpacity>
                                                        <TouchableOpacity
                                                            onPress={() =>
                                                                setShowDeleteComment({
                                                                    visible: true,
                                                                    id: item.id,
                                                                })
                                                            }
                                                        >
                                                            <Text
                                                                style={[styles.actionText, { color: 'red' }]}
                                                            >
                                                                삭제
                                                            </Text>
                                                        </TouchableOpacity>
                                                    </>
                                                )}
                                                <TouchableOpacity
                                                    onPress={() =>
                                                        setReplyingTo(
                                                            replyingTo === item.id ? null : item.id,
                                                        )
                                                    }
                                                >
                                                    <Text style={styles.actionText}>답글</Text>
                                                </TouchableOpacity>
                                            </View>
                                        )}
                                    </View>
                                </>
                            )}
                            {/* 대댓글 입력창 */}
                            {replyingTo === item.id && (
                                <View style={styles.replyInputRow}>
                                    <TextInput
                                        placeholder="답글 입력"
                                        value={replyText}
                                        onChangeText={setReplyText}
                                        style={styles.replyInput}
                                    />
                                    <TouchableOpacity
                                        onPress={() => addReply(item.id)}
                                        style={styles.replySubmitBtn}
                                    >
                                        <Text style={styles.replySubmitText}>등록</Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            {/* 대댓글 리스트 */}
                            {item.replies.map(reply => {
                                const isReplyMine = reply.uid === auth().currentUser?.uid;
                                const isReplyEditing = editingId === reply.id;

                                return (
                                    <View key={reply.id} style={styles.replyRow}>
                                        <View style={styles.commentContentRow}>
                                            <View style={{ flex: 1 }}>
                                                {reply.isDeleted ? (
                                                    <Text style={styles.deletedText}>
                                                        삭제된 댓글입니다.
                                                    </Text>
                                                ) : (
                                                    <>
                                                        <Text style={styles.replyMeta}>
                                                            ↳ {reply.nickname} ·{' '}
                                                            {reply.updatedAt?.toDate
                                                                ? reply.updatedAt.toDate().toLocaleString()
                                                                : '로딩중...'}
                                                            {reply.updatedAt &&
                                                            reply.updatedAt.toDate()?.getTime() !==
                                                            reply.createdAt?.toDate()?.getTime()
                                                                ? ' (수정됨)'
                                                                : ''}
                                                        </Text>

                                                        {isReplyEditing ? (
                                                            <View style={styles.editBox}>
                                                                <TextInput
                                                                    value={editText}
                                                                    onChangeText={setEditText}
                                                                    style={styles.editInput}
                                                                />
                                                                <TouchableOpacity
                                                                    onPress={() => saveEdit(reply.id)}
                                                                    style={styles.saveBtn}
                                                                >
                                                                    <Text style={styles.saveText}>저장</Text>
                                                                </TouchableOpacity>
                                                                <TouchableOpacity
                                                                    onPress={() => setEditingId(null)}
                                                                    style={styles.cancelBtn}
                                                                >
                                                                    <Text style={styles.cancelText}>취소</Text>
                                                                </TouchableOpacity>
                                                            </View>
                                                        ) : (
                                                            <Text style={styles.replyText}>{reply.text}</Text>
                                                        )}
                                                    </>
                                                )}
                                            </View>

                                            {/* 수정/삭제 버튼 */}
                                            {!reply.isDeleted && isReplyMine && !isReplyEditing && (
                                                <View style={styles.actionTextRow}>
                                                    <TouchableOpacity
                                                        onPress={() => startEdit(reply.id, reply.text)}
                                                    >
                                                        <Text style={styles.actionText}>수정</Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity
                                                        onPress={() =>
                                                            setShowDeleteComment({
                                                                visible: true,
                                                                id: reply.id,
                                                            })
                                                        }
                                                    >
                                                        <Text style={[styles.actionText, { color: 'red' }]}>
                                                            삭제
                                                        </Text>
                                                    </TouchableOpacity>
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    );
                }}
            />

            {/* 게시글 삭제 모달 */}
            <ConfirmModal
                visible={showDeletePost}
                message="이 게시글을 삭제하시겠습니까?"
                confirmText="삭제"
                cancelText="취소"
                onConfirm={handleDeletePost}
                onCancel={() => setShowDeletePost(false)}
            />

            {/* 댓글 삭제 모달 */}
            <ConfirmModal
                visible={showDeleteComment.visible}
                message="정말 삭제하시겠습니까?"
                confirmText="삭제"
                cancelText="취소"
                onConfirm={() =>
                    showDeleteComment.id && handleDeleteComment(showDeleteComment.id)
                }
                onCancel={() => setShowDeleteComment({ visible: false })}
            />

            {/* 에러 모달 */}
            <ConfirmModal
                visible={!!errorMessage}
                message={errorMessage}
                confirmText="확인"
                onConfirm={() => setErrorMessage('')}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    // 컨테이너
    container: {
        flex: 1,
        backgroundColor: "#fff",
        padding: 20,
    },

    // 게시글
    postBox: {
        marginBottom: 20,
        borderBottomWidth: 1,
        borderColor: "#e6e6e6",
        paddingBottom: 15,
    },
    postHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    postActions: { flexDirection: "row", gap: 12 },
    title: {
        fontSize: 20,
        fontWeight: "700",
        marginBottom: 8,
        color: "black",
    },
    metaRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },
    metaLeft: {
        fontSize: 12,
        color: "#777",
        lineHeight: 18,
        flex: 1,
    },
    metaRight: {
        fontSize: 12,
        color: "#777",
        fontWeight: "400",
        marginLeft: 10,
    },
    content: {
        fontSize: 15,
        marginBottom: 10,
        color: "#333",
        lineHeight: 22,
    },
    image: {
        width: "100%",
        height: 200,
        resizeMode: "cover",
        borderRadius: 10,
        marginBottom: 10,
    },

    // 댓글 헤더 + 입력
    commentHeaderBox: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },
    commentHeader: { fontSize: 16, fontWeight: "700", color: "black" },
    commentBtn: { fontSize: 14, fontWeight: "600", color: "black" },
    commentInputBox: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    commentInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#d0d7e2",
        padding: 10,
        borderRadius: 8,
        backgroundColor: "#f9fbff",
    },
    submitBtn: {
        marginLeft: 8,
        backgroundColor: "#2c7dd1",
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 8,
    },
    submitText: { color: "white", fontWeight: "600", fontSize: 13 },

    // 댓글 리스트
    commentRow: {
        marginBottom: 14,
        borderBottomWidth: 1,
        borderColor: "#f0f0f0",
        paddingBottom: 10,
    },
    commentMeta: { fontSize: 11, color: "#666", marginBottom: 3 },
    commentText: { fontSize: 14, color: "#333", lineHeight: 20 },
    commentContentRow: {
        flexDirection: "row",
        alignItems: "center",
    },

    // 댓글 대댓글 수정칸
    editBox: { flexDirection: "row", alignItems: "center", marginTop: 4 },
    editInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#d0d7e2",
        padding: 8,
        borderRadius: 6,
        backgroundColor: "#fff",
    },
    saveBtn: {
        marginLeft: 8,
        backgroundColor: "#2c7dd1",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 6,
    },
    saveText: { color: "white", fontWeight: "600", fontSize: 12 },
    cancelBtn: { marginLeft: 6, paddingHorizontal: 10, paddingVertical: 8 },
    cancelText: { color: "#999", fontSize: 12 },

    // 댓글 대댓글 수정 삭제버튼
    actionTextRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginTop: 4,
        marginLeft: "auto",
    },
    actionText: {
        fontSize: 12,
        color: "#2c7dd1",
        fontWeight: "600",
        marginHorizontal: 4,
    },

    // 대댓글
    replyRow: {
        marginLeft: 20,
        marginTop: 6,
        borderLeftWidth: 2,
        borderLeftColor: "#eee",
        paddingLeft: 10,
    },
    replyMeta: { fontSize: 11, color: "#666", marginBottom: 3 },
    replyText: { fontSize: 13, color: "#444", lineHeight: 18 },
    replyInputRow: {
        flexDirection: "row",
        alignItems: "center",
        marginLeft: 20,
        marginTop: 6,
    },
    replyInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#ddd",
        padding: 8,
        borderRadius: 6,
        backgroundColor: "#fff",
    },
    replySubmitBtn: {
        marginLeft: 6,
        backgroundColor: "#2c7dd1",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 6,
    },
    replySubmitText: { color: "#fff", fontWeight: "600", fontSize: 12 },

    // 삭제 표시
    deletedText: {
        fontSize: 13,
        color: "#aaa",
        marginVertical: 4,
    },
});
