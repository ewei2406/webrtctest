import { useEffect } from "react";
import useChat from "../../../hooks/useChat";
import ChatHistory from "./ChatHistory";
import ChatInput from "./ChatInput";

const Chat = ({ dc }: { dc: RTCDataChannel }) => {
	const { messages, addMessage } = useChat();

	useEffect(() => {
		const prev = dc.onmessage ? dc.onmessage.bind(dc) : null;
		dc.onmessage = (ev) => {
			addMessage(ev.data);
			return prev ? prev(ev) : null;
		};
	}, [addMessage, dc]);

	const onSubmit = (message: string) => {
		dc.send(message);
		addMessage(message);
	};

	return (
		<>
			<ChatHistory messages={messages} />
			<ChatInput onSubmit={onSubmit} />
		</>
	);
};

export default Chat;
