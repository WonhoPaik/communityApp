import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const db = admin.firestore();

interface IncrementViewsData {
  postId: string;
}

// 조회수 증가
// eslint-disable-next-line max-len
export const incrementViews = functions.https.onCall<IncrementViewsData>(async (request, context) => {
  const {postId} = request.data;
  if (!postId) {
    throw new functions.https.HttpsError("invalid-argument", "postId가 필요합니다.");
  }

  await db.collection("posts").doc(postId).update({
    views: admin.firestore.FieldValue.increment(1),
  });

  return {success: true};
});
