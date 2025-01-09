import { Message } from "../../hooks/useChat";

const ChatHistory = (props: { messages: Message[] }) => {
	return (
		<div>
			{props.messages.map((msg) => (
				<div key={msg.id}>{msg.data}</div>
			))}
		</div>
	);
};

export default ChatHistory;
