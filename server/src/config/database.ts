import { admin } from './firebase';

export const getFirestore = () => {
  return admin.firestore();
};
