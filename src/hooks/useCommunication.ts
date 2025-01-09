import { useCallback, useEffect, useState } from "react";
import useSDPSignal, { SDPSignal } from "./useSDPSignal";
import useRTC from "./useRTC";
import { Result } from "../util/result";

type UseCommunicationProps = {
	id: string;
	receptor: boolean;
	localOnly: boolean;
	onMessage: (message: string) => void;
};

const useCommunication = (props: UseCommunicationProps) => {
	const [status, setStatus] = useState<Result>({ variant: "ok" });
	const [callerId, setCallerId] = useState<string>();

	const { connectionState, offer, answer, setRemoteDescription, sendMessage } =
		useRTC({
			localOnly: props.localOnly,
			isOfferCreator: props.receptor,
			onRecieveMessage: props.onMessage,
			onSendMessage: props.onMessage,
		});

	const onSignal = useCallback(
		async (signal: SDPSignal) => {
			if (props.receptor && signal.answer) {
				const result = await setRemoteDescription({
					sdp: signal.answer,
					type: "answer",
				});
				setStatus(result);
				return;
			}
			if (!props.receptor && signal.offer) {
				const result = await setRemoteDescription({
					sdp: signal.offer,
					type: "offer",
				});
				setStatus(result);
				return;
			}
		},
		[props.receptor, setRemoteDescription]
	);

	const { sendSignal, subToSignal, unsubToSignal } = useSDPSignal({
		id: props.id,
		onSignal,
	});

	useEffect(() => {
		if (props.receptor) {
			const result = sendSignal({
				targetId: props.id,
				type: "offer",
				sdp: offer?.sdp,
				listen: true,
			});
			setStatus(result);
		}

		return () => {
			unsubToSignal(props.id);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [offer, props.receptor]);

	useEffect(() => {
		if (callerId && !props.receptor) {
			const result = sendSignal({
				targetId: callerId,
				type: "answer",
				sdp: answer?.sdp,
				merge: true,
			});
			setStatus(result);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [answer, props.receptor]);

	useEffect(() => {
		if (callerId) {
			subToSignal(callerId);
		}
		return () => {
			if (callerId) {
				unsubToSignal(callerId);
			}
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [callerId]);

	const call = (targetId: string) => {
		setCallerId(targetId);
	};

	const endCall = () => {
		setCallerId(undefined);
	};

	return { connectionState, call, endCall, sendMessage, status };
};

export default useCommunication;
