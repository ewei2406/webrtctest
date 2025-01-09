import { NavLink } from "react-router";
import useChat from "../hooks/useChat";
import ChatHistory from "../components/Chat/ChatHistory";
import ChatInput from "../components/Chat/ChatInput";
import useCommunication from "../hooks/useCommunication";
import { useState } from "react";

const Receiver = () => {
	const { messages, addMessage } = useChat();
	const [localOnly, setLocalOnly] = useState(true);

	const { id, sendMessage, connectionState, status } = useCommunication({
		localOnly,
		onMessage: addMessage,
		receptor: true,
	});

	return (
		<>
			<NavLink to="/">Home</NavLink>
			<h1>Receiver</h1>
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
			<p style={{ color: "red" }}>
				{status.variant === "error" && status.error}
			</p>
			<h3>Chat</h3>
			<ChatHistory messages={messages} />
			<ChatInput onSubmit={sendMessage} />
		</>
	);
};

export default Receiver;
