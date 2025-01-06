import { useRef, useState } from "react";
import { Result } from "../util/result";

const useRTC = () => {
	const dataChannelRef = useRef<RTCDataChannel>();
	const peerConnectionRef = useRef<RTCPeerConnection>();
	const [connectionState, setConnectionState] = useState<
		RTCIceConnectionState | undefined
	>("disconnected");

	const initializeDataChannel = (channel: RTCDataChannel) => {
		dataChannelRef.current = channel;
		dataChannelRef.current.onopen = () => console.log("Channel opened");
		dataChannelRef.current.onmessage = (event) => console.log("event", event);
	};

	const createDataChannel = (label: string): Result<boolean> => {
		if (!peerConnectionRef.current) {
			return { variant: "error", error: "Peer connection not ready." };
		}
		const newDataChannel = peerConnectionRef.current.createDataChannel(label);
		initializeDataChannel(newDataChannel);
		return { variant: "ok", value: true };
	};

	// Initialize the connection object
	const initializeConnection = () => {
		const server = { urls: "stun:stun.l.google.com:19302" };
		peerConnectionRef.current = new RTCPeerConnection({ iceServers: [server] });
		peerConnectionRef.current.ondatachannel = (event) =>
			initializeDataChannel(event.channel);
		peerConnectionRef.current.oniceconnectionstatechange = () => {
			setConnectionState(peerConnectionRef.current?.iceConnectionState);
			console.log(peerConnectionRef.current?.iceConnectionState);
		};
	};

	const setRemoteOffer = async (
		remoteOfferSDP: string
	): Promise<Result<string>> => {
		if (!peerConnectionRef.current) {
			return { variant: "error", error: "Peer connection not ready." };
		}
		const description = new RTCSessionDescription({
			type: "offer",
			sdp: remoteOfferSDP,
		});
		await peerConnectionRef.current.setRemoteDescription(description);

		// Set the local description
		const answer = await peerConnectionRef.current.createAnswer();
		if (!answer.sdp) {
			return { variant: "error", error: "Failed to create answer SDP." };
		}
		await peerConnectionRef.current.setLocalDescription(answer);
		return { variant: "ok", value: answer.sdp };
	};

	const createOffer = async (): Promise<Result<string>> => {
		if (!peerConnectionRef.current) {
			return { variant: "error", error: "Peer connection not ready." };
		}
		const offer = await peerConnectionRef.current.createOffer();
		if (!offer.sdp) {
			return { variant: "error", error: "Failed to create offer SDP." };
		}
		await peerConnectionRef.current.setLocalDescription(offer);
		return { variant: "ok", value: offer.sdp };
	};
};

export default useRTC;
