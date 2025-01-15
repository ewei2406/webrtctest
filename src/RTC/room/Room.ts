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
import { DEFAULT_RTC_CONFIG } from "../../util/constants";

const config = DEFAULT_RTC_CONFIG;

export const createRoom = async (): Promise<
	Result<{
		pc: RTCPeerConnection;
		roomId: string;
		dcMap: Map<string, RTCDataChannel>;
		dc: RTCDataChannel;
	}>
> => {
	const collectionRef = collection(db, "rooms");
	const roomRef = await addDoc(collectionRef, {});

	const pc = new RTCPeerConnection(config);
	const dcMap = new Map<string, RTCDataChannel>();
	const dc = pc.createDataChannel("chat");
	dc.onmessage = (ev) => {
		console.log("Got message: ", ev.data);
	};
	// pc.ondatachannel = (ev) => {
	// 	const dc = ev.channel;
	// 	dcMap.set(dc.label, dc);
	// 	console.log("Data channel created by remote peer: ", dc.label);
	// };

	const callerCandidatesRef = collection(roomRef, "callerCandidates");
	pc.onicecandidate = async (ev) => {
		if (ev.candidate) {
			console.log("Got new local ICE candidate: ", ev.candidate);
			const candidate = ev.candidate;
			await addDoc(callerCandidatesRef, candidate.toJSON());
		}
	};

	const offer = await pc.createOffer();
	await pc.setLocalDescription(offer);
	await setDoc(roomRef, { offer: offer });
	console.log(`New room created with SDP offer. Room ID: ${roomRef.id}`);

	onSnapshot(roomRef, async (doc) => {
		const data = doc.data();
		if (!pc.remoteDescription && data && data.answer) {
			console.log("Got remote description: ", data.answer);
			await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
		}
	});

	const calleeCandidatesRef = collection(roomRef, "calleeCandidates");
	onSnapshot(calleeCandidatesRef, async (snapshot) => {
		snapshot.docChanges().forEach(async (change) => {
			if (change.type === "added") {
				const candidate = change.doc.data();
				console.log(`Got new remote ICE candidate: `, candidate);
				await pc.addIceCandidate(new RTCIceCandidate(candidate));
			}
		});
	});

	return { variant: "ok", value: { pc, roomId: roomRef.id, dcMap, dc } };
};

export const joinRoom = async (
	roomId: string
): Promise<
	Result<{
		pc: RTCPeerConnection;
		dcMap: Map<string, RTCDataChannel>;
	}>
> => {
	const roomRef = doc(db, "rooms", roomId);
	const roomSnapshot = await getDoc(roomRef);
	if (!roomSnapshot.exists) {
		console.error("Room not found!");
		return { variant: "error", error: "Room not found!" };
	}

	const pc = new RTCPeerConnection(config);
	const dcMap = new Map<string, RTCDataChannel>();
	// const dc = pc.createDataChannel("chat");
	// dc.onmessage = (ev) => {
	// 	console.log("Got message: ", ev.data);
	// };
	pc.ondatachannel = (ev) => {
		const dc = ev.channel;
		dc.onmessage = (ev) => {
			console.log("Got message: ", ev.data);
		};
		dcMap.set(dc.label, dc);
		console.log("Data channel created by remote peer: ", dc.label);
	};

	const calleeCandidatesRef = collection(roomRef, "calleeCandidates");
	pc.onicecandidate = async (ev) => {
		if (ev.candidate) {
			console.log("Got new local ICE candidate: ", ev.candidate);
			const candidate = ev.candidate;
			await addDoc(calleeCandidatesRef, candidate.toJSON());
		}
	};

	const offer = roomSnapshot.data()?.offer;
	console.log("Got offer:", offer);
	await pc.setRemoteDescription(new RTCSessionDescription(offer));
	const answer = await pc.createAnswer();
	console.log("Created answer:", answer);
	await pc.setLocalDescription(answer);

	await updateDoc(roomRef, { answer: answer });

	const callerCandidatesRef = collection(roomRef, "callerCandidates");
	onSnapshot(callerCandidatesRef, async (snapshot) => {
		snapshot.docChanges().forEach(async (change) => {
			if (change.type === "added") {
				const candidate = change.doc.data();
				console.log(`Got new remote ICE candidate: `, candidate);
				await pc.addIceCandidate(new RTCIceCandidate(candidate));
			}
		});
	});

	return { variant: "ok", value: { pc, dcMap } };
};
