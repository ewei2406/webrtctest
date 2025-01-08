import { useEffect, useState } from "react";
import { NavLink } from "react-router";
import useRTC from "../hooks/useRTC";

const Receiver = () => {
	const [chat, setChat] = useState<{ msg: string; id: string | number }[]>([]);
	const [answerSDP, setAnswerSDP] = useState<string>("");
	const [chatInput, setChatInput] = useState<string>("");
	const [error, setError] = useState<string | null>(null);

	const {
		connectionState,
		offer,
		createOffer,
		setRemoteDescription,
		sendMessage,
	} = useRTC({
		localOnly: true,
		onMessage: (msg) => {
			setChat((prev) => [...prev, { msg: msg.data, id: msg.timeStamp }]);
		},
	});

	const submitAnswer = async () => {
		const result = await setRemoteDescription({
			type: "answer",
			sdp: answerSDP,
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

	useEffect(() => {
		createOffer().then((result) => {
			if (result.variant === "error") {
				setError(result.error);
			}
		});
	}, [createOffer]);

	return (
		<>
			<NavLink to="/">Home</NavLink>
			<h1>Receiver</h1>
			<p>Connection state: {connectionState}</p>
			<p style={{ color: "red" }}>{error}</p>

			<h2>Offer</h2>
			<textarea value={offer?.sdp} rows={10} cols={50}></textarea>

			<h2>Submit Answer</h2>
			<textarea
				value={answerSDP}
				onChange={(e) => setAnswerSDP(e.target.value)}
				rows={10}
				cols={50}
			></textarea>
			<br />
			<button onClick={submitAnswer}>Submit</button>

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

export default Receiver;
