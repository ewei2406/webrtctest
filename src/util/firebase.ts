import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
	apiKey: "AIzaSyBHL66_E0e5BUplWK0GJi7uc8uhZw80kRE",
	authDomain: "webrtctest-794b4.firebaseapp.com",
	projectId: "webrtctest-794b4",
	storageBucket: "webrtctest-794b4.firebasestorage.app",
	messagingSenderId: "684422711160",
	appId: "1:684422711160:web:342d37551c22ac2c3eaa8d",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
