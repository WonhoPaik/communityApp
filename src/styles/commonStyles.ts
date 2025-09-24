import { StyleSheet } from "react-native";

const commonStyles = StyleSheet.create({

    // 인풋박스
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

    // 버튼 - 기본/네비/경고
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
    warnBtn: {
        backgroundColor: "#e14c4c",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
    },
    warnBtnText: {
        color: "#fff",
        fontWeight: "600",
    },
    navBtn: {
        marginTop: 16,
    },
    navText: {
        color: "#2c7dd1",
        fontSize: 14,
    },

    // 공통 작성 모달
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalBox: {
        width: "80%",
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#2c4a7d",
        marginBottom: 12,
        textAlign: "center",
    },
    modalInput: {
        borderWidth: 1,
        borderColor: "#d0d7e2",
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 15,
        marginBottom: 12,
        backgroundColor: "#f9fbff",
    },
    modalBtn: {
        backgroundColor: "#2c7dd1",
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: "center",
    },
    modalBtnText: {
        color: "#fff",
        fontWeight: "600",
    },

    // 오버레이
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.2)",
    },
});

export default commonStyles;
