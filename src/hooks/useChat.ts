import { useState } from "react";
import { getUUID } from "../util/uuid";

export type Message = {
	id: string;
	data: string;
};

const useChat = () => {
	const [messages, setMessages] = useState<Message[]>([]);

	const addMessage = (message: string) => {
		const newMessage = { data: message, id: getUUID() };
		setMessages((prev) => [...prev, newMessage]);
	};

	return { messages, addMessage };
};

export default useChat;
