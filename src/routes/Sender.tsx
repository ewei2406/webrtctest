import { useState } from "react";
import { NavLink } from "react-router";
import useRTC from "../hooks/useRTC";
import useChat from "../hooks/useChat";
import ChatHistory from "../components/Chat/ChatHistory";
import ChatInput from "../components/Chat/ChatInput";

const Sender = () => {
	const [offerSDP, setOfferSDP] = useState<string>("");
	const [localOnly, setLocalOnly] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	const { messages, addMessage } = useChat();

	const { connectionState, submitOffer, answer, sendMessage } = useRTC({
		localOnly,
		isOfferCreator: true,
		onRecieveMessage: addMessage,
		onSendMessage: addMessage,
	});

	const handleSubmitOffer = async () => {
		const result = await submitOffer(offerSDP);
		if (result.variant === "error") {
			setError(result.error);
		}
	};

	return (
		<>
			<NavLink to="/">Home</NavLink>
			<h1>Sender</h1>

			<input
				name="localOnly"
				type="checkbox"
				checked={localOnly}
				onChange={(e) => setLocalOnly(e.target.checked)}
			/>
			<label htmlFor="localOnly">Use Local Network Only</label>

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
			<button onClick={handleSubmitOffer}>Submit</button>

			<h2>Answer</h2>
			<textarea
				value={answer ? answer.sdp : ""}
				rows={10}
				cols={50}
				readOnly
			></textarea>

			<h2>Chat</h2>
			<ChatHistory messages={messages} />
			<ChatInput onSubmit={sendMessage} />
		</>
	);
};

export default Sender;
