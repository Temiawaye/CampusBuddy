// import { useRouter } from 'expo-router';
// import { addDoc, collection } from 'firebase/firestore';

// const router = useRouter();

// const handleSubmit = async () => {
//   if (!user) return;

//   try {
//     await addDoc(collection(db, 'users', user.uid, 'classes'), {
//       ...classData,
//       createdAt: new Date(),
//     });
//     router.replace({
//       pathname: '/(tabs)/tasks',
//       params: { filter: 'classes' }
//     });
//   } catch (error) {
//     console.error('Error adding class:', error);
//   }
// }; 