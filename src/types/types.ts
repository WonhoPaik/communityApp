import {FirebaseFirestoreTypes} from "@react-native-firebase/firestore";

// 게시글(Post)
export interface Post {
    id: string;                                             // 게시글 ID
    postNumber: number;                                     // 게시글 번호
    title: string;                                          // 게시글 제목
    content: string;                                        // 게시글 내용
    imageUrl?: string;                                      // Firebase Storage 주소
    uid: string;                                            // 작성자 UID
    nickname?: string;                                      // 작성자 닉네임
    createdAt: FirebaseFirestoreTypes.Timestamp | null;     // 작성일
    updatedAt?: FirebaseFirestoreTypes.Timestamp | null;    // 수정일
    views?: number;                                         // 조회수
    commentCount: number;                                   // 댓글수
}

// 게시글 작성/수정 시 폼 데이터
export interface FormData {
    title: string;                                          // 게시글 제목
    content: string;                                        // 게시글 내용
    image: { uri: string; fileName?: string } | null;       // 이미지 주소
}

// 댓글(Comment)
export interface Comment {
    id: string;                                              // 댓글 ID
    text: string;                                            // 댓글 내용
    uid: string;                                             // 댓글 작성자 UID
    nickname?: string;                                       // 댓글 작성자 닉네임
    createdAt: FirebaseFirestoreTypes.Timestamp | null;      // 댓글 작성일
    updatedAt?: FirebaseFirestoreTypes.Timestamp | null;     // 댓글 수정일
    parentId: string | null;                                 // 부모 댓글 아이디(대댓용)
    isDeleted?: boolean;                                     // 삭제 여부
}

// 유저(User)
export interface UserProfile {
    uid: string;                                             // 유저 UID
    email: string;                                           // 유저 이메일
    nickname: string;                                        // 유저 닉네임
}
