import React, { useState } from "react";
import {
    View,
    TextInput,
    Image,
    Text,
    StyleSheet,
    TouchableOpacity,
} from "react-native";
import { Asset, launchImageLibrary } from "react-native-image-picker";
import { Post } from "../types/types";
import ConfirmModal from "./ConfirmModal.tsx";
import { useNavigation } from "@react-navigation/core";

interface PostFormProps {
    initialTitle?: string;
    initialContent?: string;
    initialImageUrl?: string;
    onSubmit: (
        data: Pick<Post, "title" | "content"> & { image: any | null }
    ) => Promise<void>;
    submitLabel?: string;
    loading?: boolean;
}

export default function PostForm({
                                     initialTitle = "",
                                     initialContent = "",
                                     initialImageUrl = "",
                                     onSubmit,
                                     submitLabel = "작성 완료",
                                     loading = false,
                                 }: PostFormProps) {
    const navigation = useNavigation<any>();
    const [title, setTitle] = useState(initialTitle);
    const [content, setContent] = useState(initialContent);
    const [image, setImage] = useState<Asset | null>(
        initialImageUrl ? { uri: initialImageUrl } as Asset : null
    );
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    // 이미지 피커
    const pickImage = async () => {
        const result = await launchImageLibrary({ mediaType: "photo" });
        if (result.assets?.length) {
            setImage(result.assets[0]);
        }
    };

    // 게시글 작성
    const handleSubmit = async () => {
        if (!title.trim() || !content.trim()) {
            setError("제목과 내용을 모두 입력해주세요.");
            return;
        }
        try {
            setError("");
            await onSubmit({ title, content, image });
            setSuccess(true);
        } catch (e) {
            console.error(e);
            setError("게시글 작성 중 오류가 발생했습니다. 다시 시도해주세요.");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>제목</Text>
            <TextInput
                placeholder="제목을 입력하세요 (필수)"
                value={title}
                onChangeText={setTitle}
                style={styles.input}
                placeholderTextColor="#9aa5b1"
                editable={!loading}
            />

            <Text style={styles.label}>내용</Text>
            <TextInput
                placeholder="내용을 입력하세요 (필수)"
                value={content}
                onChangeText={setContent}
                style={[styles.input, styles.contentInput]}
                multiline
                placeholderTextColor="#9aa5b1"
                editable={!loading}
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            {image && <Image source={{ uri: image.uri }} style={styles.preview} />}

            <TouchableOpacity style={styles.pickBtn} onPress={pickImage} disabled={loading}>
                <Text style={styles.pickBtnText}>이미지 선택</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.submitBtn, loading && styles.disabledBtn]}
                onPress={handleSubmit}
                disabled={loading}
            >
                <Text style={styles.submitBtnText}>
                    {loading ? "업로드 중..." : submitLabel}
                </Text>
            </TouchableOpacity>

            {/* 성공 모달 */}
            <ConfirmModal
                visible={success}
                message={`${submitLabel} 되었습니다.`}
                confirmText="확인"
                onConfirm={() => {
                    setSuccess(false);
                    navigation.goBack();
                }}
            />

            {/* 에러 모달 */}
            <ConfirmModal
                visible={!!error}
                message={error}
                confirmText="확인"
                onConfirm={() => setError("")}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff", padding: 20 },
    label: {
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 6,
        marginTop: 12,
        color: "#2c4a7d",
    },
    input: {
        borderWidth: 1,
        borderColor: "#d0d7e2",
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 15,
        marginBottom: 10,
        color: "#333",
        backgroundColor: "#f9fbff",
    },
    contentInput: { height: 120, textAlignVertical: "top" },
    preview: {
        width: "100%",
        height: 200,
        resizeMode: "cover",
        borderRadius: 10,
        marginVertical: 10,
    },
    pickBtn: {
        backgroundColor: "#e6f0fa",
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: "center",
        marginBottom: 12,
    },
    pickBtnText: { color: "#2c7dd1", fontWeight: "600", fontSize: 14 },
    submitBtn: {
        backgroundColor: "#2c7dd1",
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 10,
    },
    submitBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
    disabledBtn: {
        opacity: 0.6,
    },
    error: { color: "red", marginBottom: 10 },
});
