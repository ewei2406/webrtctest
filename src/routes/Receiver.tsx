import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router";
import QRCode from "qrcode";
import { db } from "../util/firebase";
import { doc, onSnapshot, setDoc } from "firebase/firestore";

const Receiver = () => {
	const [id] = useState(crypto.randomUUID());
	const [qrData, setQrData] = useState("");
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
		peerConnectionRef.current.oniceconnectionstatechange = () =>
			console.log(peerConnectionRef.current?.iceConnectionState);

		// Initialize the datachannel
		const newDataChannel = peerConnectionRef.current.createDataChannel("chat");
		initializeDataChannel(newDataChannel);

		peerConnectionRef.current.onicecandidate = async (event) => {
			if (!event.candidate || !peerConnectionRef.current) {
				console.error("Event candidate failed");
				return;
			}
			const offerSDP = peerConnectionRef.current.localDescription?.sdp;
			if (!offerSDP) {
				console.error("failed to create offer SDP");
				return;
			}

			// Create the doc in firestore with the offer
			const docRef = doc(db, "sdp", id);
			await setDoc(docRef, {
				offer: offerSDP,
			});

			// Listen to the doc for any changes
			onSnapshot(docRef, async (doc) => {
				if (peerConnectionRef.current?.signalingState !== "have-local-offer") {
					console.error("No offer to answer.");
					return;
				}

				const data = doc.data();
				if (!data) {
					console.error("No data found");
					return;
				}

				const answerSDP = data.answer;
				if (!answerSDP) {
					console.error("No answer found");
					return;
				}

				const description = new RTCSessionDescription({
					type: "answer",
					sdp: answerSDP,
				});

				await peerConnectionRef.current.setRemoteDescription(description);
			});

			// Write the UUID to the QR Code
			QRCode.toDataURL(id, { margin: 0 }).then(setQrData).catch(console.error);
		};

		const start = async () => {
			const offer = await peerConnectionRef.current?.createOffer();
			peerConnectionRef.current?.setLocalDescription(offer);
		};
		start();
	}, [id]);

	return (
		<>
			<NavLink to="/">Home</NavLink>
			<h1>Receiver</h1>
			My QR code:
			<img src={qrData} alt="" style={{ display: "block", margin: "10px" }} />
		</>
	);
};

export default Receiver;
