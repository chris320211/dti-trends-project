import { auth } from "../firebase";
import { signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

const provider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    return { user };
  } catch (err: any) {
    const code = err.code;
    const message = err.message;
    console.log(`Error ${code}: ${message}`);
    return null;
  }
};

export const signUpWithEmail = async (email: string, password: string) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const user = result.user;
    return { user };
  } catch (err: any) {
    const code = err.code;
    const message = err.message;
    console.log(`Error ${code}: ${message}`);
    return null;
  }
};

export const signInWithEmail = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const user = result.user;
    return { user };
  } catch (err: any) {
    const code = err.code;
    const message = err.message;
    console.log(`Error ${code}: ${message}`);
    return null;
  }
};

export const signOut = async () => {
  await auth.signOut();
};

export const getAuthToken = async () => {
  const user = auth.currentUser;
  if (user) {
    return await user.getIdToken();
  }
  return null;
};

