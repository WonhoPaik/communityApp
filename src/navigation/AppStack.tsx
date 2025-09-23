import { createNativeStackNavigator } from "@react-navigation/native-stack";
import PostListScreen from "../screens/post/PostListScreen";
import PostCreateScreen from "../screens/post/PostCreateScreen";
import PostDetailScreen from "../screens/post/PostDetailScreen";
import PostEditScreen from "../screens/post/PostEditScreen.tsx";

const Stack = createNativeStackNavigator();

export default function AppStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen name="PostList" component={PostListScreen} options={{ title: "게시판" }} />
            <Stack.Screen name="PostCreate" component={PostCreateScreen} options={{ title: "게시글 작성하기" }} />
            <Stack.Screen name="PostDetail" component={PostDetailScreen} options={{ title: "게시글 상세보기" }} />
            <Stack.Screen name="PostEdit" component={PostEditScreen} options={{ title: "게시글 수정하기" }}/>
        </Stack.Navigator>
    );
}
