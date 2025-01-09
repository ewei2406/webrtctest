import { useCallback, useEffect, useState } from "react";
import { getUUID } from "../util/uuid";
import useSDPSignal, { SDPSignal } from "./useSDPSignal";
import useRTC from "./useRTC";

type UseCommunicationProps = {
	receptor: boolean;
	localOnly: boolean;
	onMessage: (message: string) => void;
};

const useCommunication = (props: UseCommunicationProps) => {
	const [id] = useState(getUUID());
	const [callerId, setCallerId] = useState<string | null>(null);

	const {
		connectionState,
		offer,
		answer,
		setRemoteDescription,
		sendMessage,
		closeConnection,
	} = useRTC({
		localOnly: props.localOnly,
		isOfferCreator: true,
		onRecieveMessage: props.onMessage,
		onSendMessage: props.onMessage,
	});

	const onSignal = useCallback(
		async (signal: SDPSignal) => {
			if (props.receptor && signal.answer) {
				setRemoteDescription({
					sdp: signal.answer,
					type: "answer",
				});
				return;
			}
			if (!props.receptor && signal.offer) {
				await setRemoteDescription({
					sdp: signal.offer,
					type: "offer",
				});
				return;
			}
		},
		[props.receptor, setRemoteDescription]
	);

	const { sendSignal, subToSignal, unsubToSignal } = useSDPSignal({
		id,
		onSignal,
	});

	useEffect(() => {
		if (props.receptor && offer && offer.sdp) {
			sendSignal({ targetId: id, signal: offer, listen: true });
		}

		return () => {
			unsubToSignal(id);
		};
	}, [offer, props.receptor, id, sendSignal, unsubToSignal]);

	useEffect(() => {
		if (!props.receptor && answer && answer.sdp) {
			sendSignal({ targetId: id, signal: answer });
		}
	}, [answer, props.receptor, id, sendSignal]);

	useEffect(() => {
		if (callerId) {
			subToSignal(callerId);
		}
		return () => {
			closeConnection();
			if (callerId) {
				unsubToSignal(callerId);
			}
		};
	}, [callerId, subToSignal, unsubToSignal]);

	const call = (targetId: string) => {
		setCallerId(targetId);
	};

	const endCall = () => {
		setCallerId(null);
	};

	return { connectionState, call, endCall, sendMessage };
};

export default useCommunication;
