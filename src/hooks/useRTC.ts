import { useCallback, useEffect, useRef, useState } from "react";
import { Result } from "../util/result";

type UseRTCProps = {
	onMessage: (message: MessageEvent) => void;
};

const useRTC = (props: UseRTCProps) => {
	const dataChannelRef = useRef<RTCDataChannel>();
	const peerConnectionRef = useRef<RTCPeerConnection>();
	const [connectionState, setConnectionState] = useState<
		RTCIceConnectionState | undefined
	>("disconnected");

	const [offer, setOffer] = useState<RTCSessionDescriptionInit | undefined>();
	const [answer, setAnswer] = useState<RTCSessionDescriptionInit | undefined>();

	const initializeConnection = useCallback(() => {
		if (peerConnectionRef.current) {
			return;
		}

		const initializeDataChannel = (channel: RTCDataChannel) => {
			dataChannelRef.current = channel;
			dataChannelRef.current.onopen = () => console.log("Channel opened");
			dataChannelRef.current.onmessage = (event) => {
				props.onMessage(event);
			};
		};

		const server = { urls: "stun:stun.l.google.com:19302" };
		peerConnectionRef.current = new RTCPeerConnection({ iceServers: [server] });
		peerConnectionRef.current.ondatachannel = (event) =>
			initializeDataChannel(event.channel);
		peerConnectionRef.current.oniceconnectionstatechange = () => {
			setConnectionState(peerConnectionRef.current?.iceConnectionState);
			console.log(peerConnectionRef.current?.iceConnectionState);
		};
		const newDataChannel = peerConnectionRef.current.createDataChannel("chat");
		initializeDataChannel(newDataChannel);
		return { variant: "ok", value: true };
	}, [props]);

	const closeConnection = useCallback((): Result<boolean> => {
		if (!peerConnectionRef.current) {
			return { variant: "ok", value: true };
		}
		peerConnectionRef.current.close();
		return { variant: "ok", value: true };
	}, []);

	const setRemoteDescription = async (
		description: RTCSessionDescriptionInit
	): Promise<Result<boolean>> => {
		if (!peerConnectionRef.current) {
			return { variant: "error", error: "Peer connection not ready." };
		}

		try {
			console.log("here");
			await peerConnectionRef.current.setRemoteDescription(description);
			// catch the operationError
		} catch (e) {
			return { variant: "error", error: (e as Error).message };
		}

		// If the description is an answer, we are done
		if (description.type === "answer") {
			setAnswer(description);
			if (!peerConnectionRef.current.localDescription) {
				return { variant: "error", error: "Local description not found." };
			}
			return {
				variant: "ok",
				value: true,
			};
		}

		// If the description is an offer, create an answer
		const answer = await peerConnectionRef.current.createAnswer();
		if (!answer.sdp) {
			return { variant: "error", error: "Failed to create answer SDP." };
		}
		await peerConnectionRef.current.setLocalDescription(answer);

		peerConnectionRef.current.onicecandidate = (event) => {
			if (event.candidate) return;
			if (!peerConnectionRef.current) return;
			if (peerConnectionRef.current.localDescription) {
				setAnswer(peerConnectionRef.current.localDescription);
			}
		};
		return { variant: "ok", value: true };
	};

	const createOffer = useCallback(async (): Promise<Result<string>> => {
		if (!peerConnectionRef.current) {
			return { variant: "error", error: "Peer connection not ready." };
		}
		const offer = await peerConnectionRef.current.createOffer();
		if (!offer.sdp) {
			return { variant: "error", error: "Failed to create offer SDP." };
		}
		await peerConnectionRef.current.setLocalDescription(offer);
		setOffer(offer);
		return { variant: "ok", value: offer.sdp };
	}, []);

	const sendMessage = (data: string): Result<boolean> => {
		if (!dataChannelRef.current) {
			return { variant: "error", error: "Data channel not ready." };
		}
		if (dataChannelRef.current.readyState !== "open") {
			return { variant: "error", error: "Data channel not open." };
		}
		dataChannelRef.current.send(data);
		return { variant: "ok", value: true };
	};

	useEffect(() => {
		initializeConnection();

		return () => {
			closeConnection();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return {
		connectionState,
		offer,
		createOffer,
		answer,
		setRemoteDescription,
		sendMessage,
	};
};

export default useRTC;
