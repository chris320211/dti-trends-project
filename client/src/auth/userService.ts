import { db } from "../firebase";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { User } from "firebase/auth";

export const createOrUpdateUser = async (user: User) => {
  try {
    console.log("Attempting to create/update user in Firestore:", user.uid);
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      console.log("User doesn't exist, creating new user document...");
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
        currentStreak: 0,
        questionsAnsweredToday: 0,
        questionsAnsweredTodayDate: null,
        lifetimeQuestionsAnswered: 0,
        uploadsToday: 0,
        lifetimeUploads: 0,
        dailyQuestionGoal: 5,
        dailyUploadGoal: 2,
        daysGoalsMet: 0,
        lastGoalMetDate: null,
        lastQuestionDate: null,
        uploadsTodayDate: null,
        noteIds: [],
      });
      console.log("✅ New user created in Firestore:", user.uid);
    } else {
      console.log("User exists, updating login info...");
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
      console.log("✅ User updated in Firestore:", user.uid);
    }
  } catch (error: any) {
    console.error("❌ Error creating/updating user:", error);
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);
    if (error.code === "permission-denied") {
      console.error("⚠️ Firestore permission denied! Check your security rules.");
    }
  }
};

