import {
	deleteDoc,
	doc,
	getDoc,
	onSnapshot,
	setDoc,
	updateDoc,
} from "firebase/firestore";
import { db } from "../util/firebase";
import { Result } from "../util/result";

class FBSignaler {
	static listen(
		listenId: string,
		onAnswer: (answer: RTCSessionDescriptionInit) => void
	) {
		const signalRef = doc(db, "signal", listenId);
		const unsub = onSnapshot(signalRef, (doc) => {
			const data = doc.data();
			if (!data) return;
			if (data.answerSdp && data.answerId !== listenId) {
				onAnswer({
					type: "answer",
					sdp: data.answerSdp,
				});
			}
		});
		return unsub;
	}

	static async setOffer(
		targetId: string,
		offer: RTCSessionDescriptionInit
	): Promise<Result> {
		try {
			const signalRef = doc(db, "signal", targetId);
			await setDoc(signalRef, {
				offerId: targetId,
				offerSdp: offer.sdp,
			});
			return { variant: "ok" };
		} catch (error) {
			return { variant: "error", error: (error as Error).message };
		}
	}

	static async closeOffer(targetId: string): Promise<Result> {
		try {
			const signalRef = doc(db, "signal", targetId);
			await deleteDoc(signalRef);
			return { variant: "ok" };
		} catch (error) {
			return { variant: "error", error: (error as Error).message };
		}
	}

	static async sendAnswer(
		thisId: string,
		targetId: string,
		answer: RTCSessionDescriptionInit
	): Promise<Result> {
		try {
			const signalRef = doc(db, "signal", targetId);
			await updateDoc(signalRef, {
				answerId: thisId,
				answerSdp: answer.sdp,
			});
			return { variant: "ok" };
		} catch (error) {
			return { variant: "error", error: (error as Error).message };
		}
	}

	static async getOffer(
		targetId: string
	): Promise<Result<RTCSessionDescriptionInit>> {
		const signalRef = doc(db, "signal", targetId);
		const docRef = await getDoc(signalRef);
		const data = docRef.data();
		if (!data || !data.offerSdp) {
			return { variant: "error", error: "No offer found" };
		}
		return {
			variant: "ok",
			value: { type: "offer", sdp: data.offerSdp },
		};
	}
}

export default FBSignaler;
