import { doc, getDoc, setDoc } from "firebase/firestore";
import { Html5Qrcode } from "html5-qrcode";
import { useRef, useEffect, useState } from "react";
import { NavLink } from "react-router";
import { db } from "../util/firebase";
import useQRScanner from "../hooks/useQRScanner";

const Sender = () => {
	const { scannerState, startScanner } = useQRScanner({
		elementId: "reader",
		onScan: (data) => {
			console.log(data);
		},
	});

	const [connectionState, setConnectionState] = useState<
		RTCIceConnectionState | undefined
	>("disconnected");
	const dataChannelRef = useRef<RTCDataChannel>();
	const peerConnectionRef = useRef<RTCPeerConnection>();

	const initializeDataChannel = (channel: RTCDataChannel) => {
		dataChannelRef.current = channel;
		dataChannelRef.current.onopen = () => console.log("Channel opened");
		dataChannelRef.current.onmessage = (event) => console.log("event", event);
	};

	useEffect(() => {
		// Initialize the connection object
		const server = { urls: "stun:stun.l.google.com:19302" };
		peerConnectionRef.current = new RTCPeerConnection({ iceServers: [server] });
		peerConnectionRef.current.ondatachannel = (event) =>
			initializeDataChannel(event.channel);
		peerConnectionRef.current.oniceconnectionstatechange = () => {
			setConnectionState(peerConnectionRef.current?.iceConnectionState);
			console.log(peerConnectionRef.current?.iceConnectionState);
		};

		// Start the QR code reader
		const qrCodeSuccessCallback = async (decodedText: string) => {
			console.log(peerConnectionRef.current);
			if (connectionState !== "disconnected") {
				console.warn("Connection already established.");
				return;
			}
			if (!peerConnectionRef.current) {
				console.error("Peer connection not ready.");
				return;
			}

			// If connection isn't stable stop
			if (peerConnectionRef.current.signalingState !== "stable") {
				console.warn("Connection state not stable yet.");
				return;
			}

			const receiverUUID = decodedText;

			// Get the doc from firestore
			const docRef = doc(db, "sdp", receiverUUID);
			const query = await getDoc(docRef);
			const data = query.data();

			// Retreive the offer SDP
			if (!data || !data.offer) {
				console.error("No offer found.");
				return;
			}
			const offerSDP = data.offer as string;

			const description = new RTCSessionDescription({
				type: "offer",
				sdp: offerSDP,
			});

			peerConnectionRef.current.onicecandidate = async (event) => {
				if (!peerConnectionRef.current) {
					console.error("Peer connection not ready.");
					return;
				}
				if (!event.candidate) {
					console.warn("No candidate present.");
					return;
				}

				const answerSDP = peerConnectionRef.current.localDescription?.sdp;
				if (!answerSDP) {
					console.error("Failed to create answer SDP.");
					return;
				}

				// Create the doc in firestore with the answer
				await setDoc(docRef, {
					answer: answerSDP,
				});
			};

			await peerConnectionRef.current.setRemoteDescription(description);
			const answer = await peerConnectionRef.current.createAnswer();
			await peerConnectionRef.current.setLocalDescription(answer);
		};

		const qrCodeErrorCallback = () => {};

		startScanner();
	}, []);

	return (
		<>
			<NavLink to="/">Home</NavLink>
			<h1>Sender</h1>
			<p>Scanner state: {scannerState.variant}</p>
			<p>Connection state: {connectionState}</p>
			QR Code reader
			<div style={{ width: 300 }}>
				<div id="reader"></div>
			</div>
		</>
	);
};

export default Sender;
