import { useState } from "react";
import { NavLink } from "react-router";
import useRTC from "../hooks/useRTC";

const Sender = () => {
	const [chat, setChat] = useState<{ msg: string; id: string | number }[]>([]);
	const [offerSDP, setOfferSDP] = useState<string>("");
	const [chatInput, setChatInput] = useState<string>("");
	const [error, setError] = useState<string | null>(null);

	const { connectionState, setRemoteDescription, answer, sendMessage } = useRTC(
		{
			localOnly: false,
			onMessage: (msg) => {
				setChat((prev) => [...prev, { msg: msg.data, id: msg.timeStamp }]);
			},
		}
	);

	const submitOffer = async () => {
		const result = await setRemoteDescription({
			type: "offer",
			sdp: offerSDP,
		});
		if (result.variant === "error") {
			setError(result.error);
		}
	};

	const sendChat = () => {
		setChat((prev) => [...prev, { msg: chatInput, id: Date.now() }]);
		setChatInput("");
		const result = sendMessage(chatInput);
		if (result.variant === "error") {
			setError(result.error);
		}
	};

	return (
		<>
			<NavLink to="/">Home</NavLink>
			<h1>Sender</h1>
			<p>Connection state: {connectionState}</p>
			<p style={{ color: "red" }}>{error}</p>

			<h2>Submit Remote Offer</h2>
			<textarea
				value={offerSDP}
				onChange={(e) => setOfferSDP(e.target.value)}
				rows={10}
				cols={50}
			></textarea>
			<br />
			<button onClick={submitOffer}>Submit</button>

			<h2>Answer</h2>
			<textarea value={answer?.sdp} rows={10} cols={50}></textarea>

			<h2>Chat</h2>
			{chat.map((msg) => (
				<p key={msg.id}>{msg.msg}</p>
			))}
			<input
				type="text"
				value={chatInput}
				onChange={(e) => setChatInput(e.target.value)}
			/>
			<button onClick={sendChat}>Send</button>
		</>
	);
};

export default Sender;
