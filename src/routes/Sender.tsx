import { useState } from "react";
import { NavLink } from "react-router";
import useChat from "../hooks/useChat";
import ChatHistory from "../components/Chat/ChatHistory";
import ChatInput from "../components/Chat/ChatInput";
import useCommunication from "../hooks/useCommunication";

const Sender = () => {
	const [callerId, setCallerId] = useState<string>("");

	const { messages, addMessage } = useChat();

	const { id, sendMessage, connectionState, call, status } = useCommunication({
		localOnly: true,
		onMessage: (m) => {
			addMessage(m);
			console.log(m);
		},
		receptor: false,
	});

	const handleCall = () => {
		call(callerId);
	};

	return (
		<>
			<NavLink to="/">Home</NavLink>
			<h1>Sender</h1>
			<p>Connection state: {connectionState.variant}</p> <br />
			<p>
				My id: <input type="text" readOnly value={id} />
				<input
					type="text"
					value={callerId}
					onChange={(e) => setCallerId(e.target.value)}
				/>
				<button onClick={handleCall}>Call</button>
			</p>
			<p style={{ color: "red" }}>
				{status.variant === "error" && status.error}
			</p>
			<ChatHistory messages={messages} />
			<ChatInput onSubmit={sendMessage} />
		</>
	);
};

export default Sender;
