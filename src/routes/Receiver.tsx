import { NavLink } from "react-router";
import useChat from "../hooks/useChat";
import ChatHistory from "../components/Chat/ChatHistory";
import ChatInput from "../components/Chat/ChatInput";
import useCommunication from "../hooks/useCommunication";

const Receiver = () => {
	const { messages, addMessage } = useChat();

	const { id, sendMessage, connectionState, status } = useCommunication({
		localOnly: true,
		onMessage: (m) => {
			addMessage(m);
			console.log(m);
		},
		receptor: true,
	});

	return (
		<>
			<NavLink to="/">Home</NavLink>
			<h1>Receiver</h1>
			<p>Connection state: {connectionState.variant}</p> <br />
			<p>
				My id: <input type="text" readOnly value={id} />
			</p>
			<p style={{ color: "red" }}>
				{status.variant === "error" && status.error}
			</p>
			<ChatHistory messages={messages} />
			<ChatInput onSubmit={sendMessage} />
		</>
	);
};

export default Receiver;
