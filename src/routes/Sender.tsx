import { useState } from "react";
import { NavLink } from "react-router";
import useChat from "../hooks/useChat";
import ChatHistory from "../components/Chat/ChatHistory";
import ChatInput from "../components/Chat/ChatInput";
import useCommunication from "../hooks/useCommunication";
import useId from "../hooks/useId";
import QRCodeScanner from "../components/QRCode/QRCodeScanner";

const Sender = () => {
	const [callerId, setCallerId] = useState<string>("");
	const [localOnly, setLocalOnly] = useState(true);

	const { messages, addMessage } = useChat();

	const { id } = useId();
	const { sendMessage, connectionState, call, status } = useCommunication({
		id,
		localOnly,
		onMessage: addMessage,
		receptor: false,
	});

	const handleCall = () => {
		call(callerId);
	};

	return (
		<>
			<NavLink to="/">Home</NavLink>
			<h1>Sender</h1>
			<p>Connection state: {connectionState.variant}</p>
			<input
				type="checkbox"
				name="localOnly"
				checked={localOnly}
				onChange={() => setLocalOnly(!localOnly)}
			/>
			<label htmlFor="localOnly">Use Local Network Only</label> <br />
			<p>
				My id: <input type="text" readOnly value={id} />
			</p>
			<input
				type="text"
				value={callerId}
				onChange={(e) => setCallerId(e.target.value)}
			/>
			<button onClick={handleCall}>Call</button>
			<p style={{ color: "red" }}>
				{status.variant === "error" && status.error}
			</p>
			<QRCodeScanner />
			<h3>Chat</h3>
			<ChatHistory messages={messages} />
			<ChatInput onSubmit={sendMessage} />
		</>
	);
};

export default Sender;
