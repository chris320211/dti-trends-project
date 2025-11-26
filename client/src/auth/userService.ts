import { db } from "../firebase";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { User } from "firebase/auth";

export const createOrUpdateUser = async (user: User) => {
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      firebaseUid: user.uid,
      email: user.email || "",
      displayName: user.displayName || "",
      photoURL: user.photoURL || "",
      provider: user.providerData[0]?.providerId === "google.com" ? "google" : "email",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
      loginCount: 1,
      streak: 0,
      questionsAnsweredToday: 0,
      dailyGoal: 5,
      lastQuestionDate: null,
      noteIds: [],
    });
  } else {
    const currentData = userSnap.data();
    await setDoc(
      userRef,
      {
        lastLoginAt: serverTimestamp(),
        loginCount: (currentData.loginCount || 0) + 1,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  }
};

