import {
	addDoc,
	collection,
	doc,
	getDoc,
	onSnapshot,
	setDoc,
	updateDoc,
} from "firebase/firestore";
import { db } from "../../util/firebase";
import { Result } from "../../util/result";

type RoomId = string;
type CandidateType = "caller" | "callee";
type Unsubscribe = () => void;

const createRoom = async (): Promise<Result<RoomId>> => {
	try {
		const collectionRef = collection(db, "rooms");
		const roomRef = await addDoc(collectionRef, {});
		return { variant: "ok", value: roomRef.id };
	} catch (error) {
		return { variant: "error", error: (error as Error).message };
	}
};

const setRoomOffer = async (
	roomId: RoomId,
	offer: RTCSessionDescriptionInit
): Promise<Result> => {
	try {
		const roomRef = doc(db, "rooms", roomId);
		await setDoc(roomRef, { offer: offer });
		return { variant: "ok" };
	} catch (error) {
		return { variant: "error", error: (error as Error).message };
	}
};

const getRoomOffer = async (
	roomId: RoomId
): Promise<Result<RTCSessionDescriptionInit>> => {
	try {
		const roomRef = doc(db, "rooms", roomId);
		const roomSnapshot = await getDoc(roomRef);
		if (!roomSnapshot.exists) {
			console.error("Room not found!");
			return { variant: "error", error: "Room not found!" };
		}
		const data = roomSnapshot.data();
		if (!data?.offer) {
			return { variant: "error", error: "Offer not found!" };
		}
		return { variant: "ok", value: data.offer };
	} catch (error) {
		return { variant: "error", error: (error as Error).message };
	}
};

const setRoomAnswer = async (
	roomId: RoomId,
	answer: RTCSessionDescriptionInit
): Promise<Result> => {
	try {
		const roomRef = doc(db, "rooms", roomId);
		await updateDoc(roomRef, { answer: answer });
		return { variant: "ok" };
	} catch (error) {
		return { variant: "error", error: (error as Error).message };
	}
};

const onRoomAnswer = (
	roomId: RoomId,
	callback: (answer: RTCSessionDescriptionInit) => void
): Result<Unsubscribe> => {
	try {
		const roomRef = doc(db, "rooms", roomId);
		const unsub = onSnapshot(roomRef, async (doc) => {
			const data = doc.data();
			if (data && data.answer) {
				return callback(data.answer);
			}
		});
		return { variant: "ok", value: unsub };
	} catch (error) {
		return { variant: "error", error: (error as Error).message };
	}
};

const sendCandidate = async (
	variant: CandidateType,
	roomId: RoomId,
	candidate: RTCIceCandidateInit
): Promise<Result> => {
	try {
		console.log("here");
		const roomRef = doc(db, "rooms", roomId);
		const candidatesRef = collection(roomRef, variant);
		await addDoc(candidatesRef, candidate);
		return { variant: "ok" };
	} catch (error) {
		return { variant: "error", error: (error as Error).message };
	}
};

const sendCallerICECandidate = async (
	roomId: RoomId,
	candidate: RTCIceCandidateInit
): Promise<Result> => {
	return sendCandidate("caller", roomId, candidate);
};

const sendCalleeICECandidate = async (
	roomId: RoomId,
	candidate: RTCIceCandidateInit
): Promise<Result> => {
	return sendCandidate("callee", roomId, candidate);
};

const onCandidate = (
	variant: CandidateType,
	roomId: RoomId,
	callback: (candidate: RTCIceCandidateInit) => void
): Result<Unsubscribe> => {
	try {
		const roomRef = doc(db, "rooms", roomId);
		const candidatesRef = collection(roomRef, variant);
		const unsub = onSnapshot(candidatesRef, async (snapshot) => {
			snapshot.docChanges().forEach(async (change) => {
				if (change.type === "added") {
					const candidate = change.doc.data();
					callback(candidate);
				}
			});
		});
		return { variant: "ok", value: unsub };
	} catch (error) {
		return { variant: "error", error: (error as Error).message };
	}
};

const onCallerICECandidate = (
	roomId: RoomId,
	callback: (candidate: RTCIceCandidateInit) => void
): Result<Unsubscribe> => {
	return onCandidate("caller", roomId, callback);
};

const onCalleeICECandidate = (
	roomId: RoomId,
	callback: (candidate: RTCIceCandidateInit) => void
): Result<Unsubscribe> => {
	return onCandidate("callee", roomId, callback);
};

const Signalling = {
	createRoom,
	setRoomOffer,
	getRoomOffer,
	setRoomAnswer,
	onRoomAnswer,
	sendCallerICECandidate,
	sendCalleeICECandidate,
	onCallerICECandidate,
	onCalleeICECandidate,
};

export default Signalling;
