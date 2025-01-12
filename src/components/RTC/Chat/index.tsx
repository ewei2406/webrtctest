import { useEffect, useState } from "react";
import useChat from "../../../hooks/useChat";
import ChatHistory from "./ChatHistory";
import ChatInput from "./ChatInput";
import DCStatus from "../DCStatus";
import RTCBase from "../../../RTC/RTCBase";

const Chat = ({ dc, rtc }: { dc: RTCDataChannel; rtc: RTCBase }) => {
	const [isReady, setIsReady] = useState(false);
	const { messages, addMessage } = useChat();

	useEffect(() => {
		const onMessage = (e: MessageEvent) => addMessage(e.data);
		rtc.addMessageListener(dc.label, onMessage);
		return () => {
			rtc.removeMessageListener(dc.label, onMessage);
		};
	}, [addMessage, dc.label, rtc]);

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
