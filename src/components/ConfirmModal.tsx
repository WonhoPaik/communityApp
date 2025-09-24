import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface ConfirmModalProps {
    visible: boolean;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel?: () => void;
}

export default function ConfirmModal({
                                         visible,
                                         message,
                                         confirmText = '확인',
                                         cancelText,
                                         onConfirm,
                                         onCancel,
                                     }: ConfirmModalProps) {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onCancel}
        >
            <View style={styles.overlay}>
                <View style={styles.box}>
                    <Text style={styles.message}>{message}</Text>
                    <View style={styles.actions}>
                        {cancelText && onCancel && (
                            <TouchableOpacity onPress={onCancel} style={styles.cancelBtn}>
                                <Text style={styles.cancelText}>{cancelText}</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity onPress={onConfirm} style={styles.confirmBtn}>
                            <Text style={styles.confirmText}>{confirmText}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    // 오버레이
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "center",
        alignItems: "center",
    },

    // 모달박스
    box: {
        width: "75%",
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 24,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    message: {
        fontSize: 16,
        color: "#2c4a7d",
        marginBottom: 24,
        textAlign: "center",
        lineHeight: 22,
    },

    // 버튼영역
    actions: {
        flexDirection: "row",
        justifyContent: "flex-end",
    },

    // 취소버튼
    cancelBtn: {
        backgroundColor: "#f0f0f0",
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 8,
        marginRight: 10,
    },
    cancelText: {
        color: "#333",
        fontWeight: "600",
    },

    // 확인버튼
    confirmBtn: {
        backgroundColor: "#2c7dd1",
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 8,
    },
    confirmText: {
        color: "#fff",
        fontWeight: "600",
    },
});