import { useRef } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "../util/firebase";
import { Result } from "../util/result";

type UseSDPSignalProps<T> = {
	id: string;
	onSignal: (signal: T) => void;
};

export type SDPSignal = {
	offerId: string;
	offer: string;
	answerId: string;
	answer: string;
};

const useSDPSignal = <T = SDPSignal>(props: UseSDPSignalProps<T>) => {
	const unsubMap = useRef(new Map<string, () => void>());

	const sendSignal = (signalProps: {
		targetId: string;
		type: "offer" | "answer";
		sdp?: string;
		listen?: boolean;
		merge?: boolean;
	}): Result => {
		try {
			const signalRef = doc(db, "sdp", signalProps.targetId);
			setDoc(
				signalRef,
				{
					[signalProps.type + "Id"]: props.id,
					[signalProps.type]: signalProps.sdp || "",
				},
				{ merge: signalProps.merge }
			);
			if (signalProps.listen) {
				subToSignal(signalProps.targetId);
			}
			return { variant: "ok" };
		} catch (e) {
			return { variant: "error", error: (e as Error).message };
		}
	};

	const subToSignal = (targetId: string) => {
		const signalRef = doc(db, "sdp", targetId);
		const unsub = onSnapshot(signalRef, (doc) => {
			const data = doc.data();
			if (data) {
				props.onSignal(data as T);
			}
		});
		unsubMap.current.set(targetId, unsub);
	};

	const unsubToSignal = (targetId: string) => {
		const unsub = unsubMap.current.get(targetId);
		unsub?.();
		unsubMap.current.delete(targetId);
	};

	return { sendSignal, subToSignal, unsubToSignal };
};

export default useSDPSignal;
