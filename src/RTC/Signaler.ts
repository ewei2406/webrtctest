import { doc, getDoc, onSnapshot, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../util/firebase";
import { Result } from "../util/result";

export interface Signaler {
	id: string;
	getOffer(targetId: string): Promise<Result<RTCSessionDescriptionInit>>;
	setOffer(targetId: string, offer: RTCSessionDescriptionInit): Promise<Result>;
	sendAnswer(
		targetId: string,
		answer: RTCSessionDescriptionInit
	): Promise<Result>;
	onAnswer(answer: RTCSessionDescriptionInit): void;
	listen(listenId: string): void;
}

class FBSignaler implements Signaler {
	public id = "";
	onAnswer: (answer: RTCSessionDescriptionInit) => void = () => {};

	listen(listenId: string) {
		const signalRef = doc(db, "signal", listenId);
		onSnapshot(signalRef, (doc) => {
			const data = doc.data();
			if (!data) return;
			if (data.answerSdp && data.answerId !== this.id) {
				this.onAnswer({
					type: "answer",
					sdp: data.answerSdp,
				});
			}
		});
	}

	async setOffer(
		targetId: string,
		offer: RTCSessionDescriptionInit
	): Promise<Result> {
		try {
			const signalRef = doc(db, "signal", targetId);
			await setDoc(signalRef, {
				offerId: this.id,
				offerSdp: offer.sdp,
			});
			return { variant: "ok" };
		} catch (error) {
			return { variant: "error", error: (error as Error).message };
		}
	}

	async sendAnswer(
		targetId: string,
		answer: RTCSessionDescriptionInit
	): Promise<Result> {
		try {
			const signalRef = doc(db, "signal", targetId);
			await updateDoc(signalRef, {
				answerId: this.id,
				answerSdp: answer.sdp,
			});
			return { variant: "ok" };
		} catch (error) {
			return { variant: "error", error: (error as Error).message };
		}
	}

	async getOffer(targetId: string): Promise<Result<RTCSessionDescriptionInit>> {
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
