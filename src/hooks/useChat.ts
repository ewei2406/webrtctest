import { useEffect, useState } from "react";
import useDCStatus from "./useDCStatus";
import { MultiMessage } from "../RTC/multi/MultiHost";
import { getUUID } from "../util/uuid";

const useChat = (authorId: string, dc: RTCDataChannel) => {
	const [messages, setMessages] = useState<MultiMessage[]>([]);
	const { status } = useDCStatus(dc);

	const sendMessage = (message: string) => {
		if (status === "open") {
			dc.send(message);
			addMessage({
				clientId: authorId,
				data: message,
				date: new Date(),
				id: getUUID(),
			});
		}
	};

	const addMessage = (mm: MultiMessage) => {
		setMessages((prev) => [...prev, mm]);
	};

	useEffect(() => {
		const onMessage = (ev: MessageEvent) => {
			console.log("recieved: ", ev.data);
			const chatEv = JSON.parse(ev.data) as MultiMessage;
			console.log("chatEv: ", chatEv);
			addMessage(chatEv);
		};
		dc.addEventListener("message", onMessage);
	}, [dc]);

	return {
		status,
		messages,
		sendMessage,
	};
};

export default useChat;
