import { useEffect, useState } from "react";
import { getUUID } from "../util/uuid";
import useDCStatus from "./useDCStatus";

export type Message = {
	authorId: string;
	date: Date;
	id: string;
	data: string;
};

export type ChatAction = "none" | "typing";

type ChatEvent = {
	authorId: string;
} & (
	| {
			type: "message";
			data: string;
	  }
	| {
			type: "action";
			action: ChatAction;
	  }
	| {
			type: "nickname";
			nickname: string;
	  }
);

const useChat = (authorId: string, dc: RTCDataChannel) => {
	const [messages, setMessages] = useState<Message[]>([]);
	const [remoteAction, setRemoteAction] = useState<ChatAction>("none");
	const [nicknameMap, setNicknameMap] = useState<Map<string, string>>(
		new Map()
	);
	const { status } = useDCStatus(dc);

	const send = (ev: ChatEvent) => {
		if (status === "open") {
			dc.send(JSON.stringify(ev));
		}
	};

	const addMessage = (props: { authorId: string; data: string }) => {
		const newMessage = { ...props, id: getUUID(), date: new Date() };
		setMessages((prev) => [...prev, newMessage]);
	};

	const sendMessage = (data: string) => {
		send({
			authorId,
			type: "message",
			data,
		});
		addMessage({ data, authorId });
	};

	const setAction = (action: ChatAction) => {
		send({
			authorId,
			type: "action",
			action: action,
		});
	};

	const sendNickname = (nickname: string) => {
		send({
			authorId,
			type: "nickname",
			nickname,
		});
	};

	useEffect(() => {
		const onMessage = (ev: MessageEvent) => {
			console.log("recieved chatEvent: ", ev.data);
			const chatEv = JSON.parse(ev.data) as ChatEvent;
			switch (chatEv.type) {
				case "message":
					addMessage({ authorId: chatEv.authorId, data: chatEv.data });
					break;
				case "action":
					setRemoteAction(chatEv.action);
					break;
				case "nickname":
					setNicknameMap((prev) => {
						const newMap = new Map(prev);
						newMap.set(chatEv.authorId, chatEv.nickname);
						return newMap;
					});
					break;
				default:
					console.error("unknown chat event type: ", chatEv);
			}
		};
		dc.addEventListener("message", onMessage);
	}, [dc]);

	return {
		status,
		nicknameMap,
		messages,
		sendMessage,
		setAction,
		sendNickname,
		remoteAction,
	};
};

export default useChat;
