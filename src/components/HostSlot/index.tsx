import { useState } from "react";
import RTCHost from "../../RTC/RTCHost";

const HostSlot = ({ host }: { host: RTCHost }) => {
	const [answerSDP, setAnswerSDP] = useState("");

	const copyOffer = async () => {
		const offer = await host.createOffer();
		if (offer.variant === "error") {
			return alert("Failed to create offer: " + offer.error);
		}

		await navigator.clipboard.writeText(offer.value.sdp!);
		alert("Offer copied to clipboard");
	};

	const handleSubmit = async () => {
		await host.submitAnswer({ type: "answer", sdp: answerSDP });
		alert("Answer SDP submitted");
	};

	return (
		<div style={{ border: "1px solid black", margin: 10 }}>
			<strong>{host.id}</strong>
			<br />
			<button onClick={copyOffer}>Copy offer</button>
			<textarea
				placeholder="Enter Answer"
				value={answerSDP}
				onChange={(e) => setAnswerSDP(e.target.value)}
			/>
			<button onClick={handleSubmit}>Submit Answer</button>
		</div>
	);
};

export default HostSlot;
