import { useState } from "react";
import RTCClient from "../../RTC/RTCClient";

const HostSlot = ({ client }: { client: RTCClient }) => {
	const [offerSDP, setOfferSDP] = useState("");

	const handleSubmit = async () => {
		const answer = await client.submitOffer({ type: "offer", sdp: offerSDP });
		if (answer.variant === "error") {
			return alert("Failed to create answer: " + answer.error);
		}

		await navigator.clipboard.writeText(answer.value.sdp!);
		alert("Answer SDP copied to clipboard.");
	};

	return (
		<div style={{ border: "1px solid black", margin: 10 }}>
			<strong>{client.id}</strong>
			<br />
			<textarea
				placeholder="Enter Offer"
				value={offerSDP}
				onChange={(e) => setOfferSDP(e.target.value)}
			></textarea>
			<button onClick={handleSubmit}>Submit Offer</button>
		</div>
	);
};

export default HostSlot;
