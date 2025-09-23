import { useEffect, useState } from "react";
import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";

export function useAuth() {
    const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
    const [initializing, setInitializing] = useState(true);

    useEffect(() => {
        const unsub = auth().onAuthStateChanged((usr) => {
            setUser(usr);
            if (initializing) setInitializing(false);
        });
        return unsub;
    }, [initializing]);

    return { user, initializing };
}
