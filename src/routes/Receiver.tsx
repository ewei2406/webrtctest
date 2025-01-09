import { useState } from "react";
import { NavLink } from "react-router";
import useRTC from "../hooks/useRTC";
import useChat from "../hooks/useChat";
import ChatHistory from "../components/Chat/ChatHistory";
import ChatInput from "../components/Chat/ChatInput";

const Receiver = () => {
	const [answerSDP, setAnswerSDP] = useState<string>("");
	const [localOnly, setLocalOnly] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	const { messages, addMessage } = useChat();

	const { connectionState, offer, submitAnswer, sendMessage } = useRTC({
		localOnly,
		isOfferCreator: true,
		onRecieveMessage: addMessage,
		onSendMessage: addMessage,
	});

	const handleSubmitAnswer = async () => {
		const result = await submitAnswer(answerSDP);
		if (result.variant === "error") {
			setError(result.error);
		}
	};

	return (
		<>
			<NavLink to="/">Home</NavLink>
			<h1>Receiver</h1>

			<input
				name="localOnly"
				type="checkbox"
				checked={localOnly}
				onChange={(e) => setLocalOnly(e.target.checked)}
			/>
			<label htmlFor="localOnly">Use Local Network Only</label>

			<p>Connection state: {connectionState}</p>
			<p style={{ color: "red" }}>{error}</p>

			<h2>Offer</h2>
			<textarea
				value={offer ? offer.sdp : ""}
				rows={10}
				cols={50}
				readOnly
			></textarea>

			<h2>Submit Answer</h2>
			<textarea
				value={answerSDP}
				onChange={(e) => setAnswerSDP(e.target.value)}
				rows={10}
				cols={50}
			></textarea>
			<br />
			<button onClick={handleSubmitAnswer}>Submit</button>

			<h2>Chat</h2>
			<ChatHistory messages={messages} />
			<ChatInput onSubmit={sendMessage} />
		</>
	);
};

export default Receiver;
