import { User } from "firebase/auth";
import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import { auth } from "../firebase";
import { createOrUpdateUser } from "./userService";

type AuthData = {
  user?: User | null;
};

const AuthUserContext = createContext<AuthData>({ user: null});

export default function AuthUserProvider({
  children,
}: {
  readonly children: ReactNode;
}) {
  const [user, setUser] = useState<AuthData>({ user: null});

  useEffect(() => {
    auth.onAuthStateChanged(async (userAuth) => {
      if (userAuth) {
        console.log("Auth state changed - user logged in:", userAuth.uid);
        try {
          await createOrUpdateUser(userAuth);
        } catch (error) {
          console.error("Error creating/updating user:", error);
        }
        setUser({ user: userAuth});
      } else {
        console.log("Auth state changed - user logged out");
        setUser({ user: null});
      }
    });
  }, []);

  return <AuthUserContext.Provider value={user}>{children}</AuthUserContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthUserContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthUserProvider");
  }
  return context;
};
