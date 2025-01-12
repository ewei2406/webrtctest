import { useEffect, useState } from "react";
import useChat from "../../../hooks/useChat";
import ChatHistory from "./ChatHistory";
import ChatInput from "./ChatInput";
import DCStatus from "../DCStatus";

const Chat = ({ dc }: { dc: RTCDataChannel }) => {
	const [isReady, setIsReady] = useState(false);
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

	const handleStatusChange = (status: RTCDataChannelState) => {
		setIsReady(status === "open");
	};

	return (
		<>
			<DCStatus dc={dc} onStatusChange={handleStatusChange} />
			<ChatHistory messages={messages} />
			<ChatInput onSubmit={onSubmit} disabled={!isReady} />
		</>
	);
};

export default Chat;
