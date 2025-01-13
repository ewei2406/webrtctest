import useChat from "../../../hooks/useChat";
import ChatHistory from "./ChatHistory";
import ChatInput from "./ChatInput";
import RTCStatus from "../RTCStatus";
import Communication from "../../../RTC/Communication";
import { useEffect, useState } from "react";

const Chat = ({ chat, id }: { chat: Communication; id: string }) => {
	const [nickname, setNickname] = useState("Joe bob");
	const {
		status,
		messages,
		sendMessage,
		remoteAction,
		setAction,
		sendNickname,
		nicknameMap,
	} = useChat(id, chat.rtc.dcs.get("chat")!);

	useEffect(() => {
		if (status === "open") {
			sendNickname(nickname);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [status]);

	return (
		<>
			<h3>Chat</h3>
			Nickname:{" "}
			<input value={nickname} onChange={(e) => setNickname(e.target.value)} />
			<button onClick={() => sendNickname(nickname)}>Apply Nickname</button>
			<RTCStatus rtc={chat.rtc} />
			Chat status: {status}
			<div
				style={{
					border: "1px solid black",
					margin: 10,
					width: 300,
					display: "flex",
					flexDirection: "column",
				}}
			>
				<ChatHistory
					authorId={id}
					messages={messages}
					nicknameMap={nicknameMap}
				/>
				<p>{remoteAction === "typing" && "Other user is typing..."}</p>
				<ChatInput
					onSubmit={sendMessage}
					setAction={setAction}
					disabled={status !== "open"}
				/>
			</div>
		</>
	);
};

export default Chat;
