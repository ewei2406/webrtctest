import useChat from "../../../hooks/useChat";
import RTCStatus from "../RTCStatus";
import Communication from "../../../RTC/Communication";
import { useState } from "react";
import { getHHMM } from "../../../util/date";

const Chat = ({ chat, id }: { chat: Communication; id: string }) => {
	const [inputMsg, setInputMsg] = useState("");
	const { status, messages, sendMessage } = useChat(
		id,
		chat.rtc.dcs.get("chat")!
	);

	const handleSend = () => {
		sendMessage(inputMsg);
		setInputMsg("");
	};

	return (
		<>
			<h3>Chat</h3>
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
				<div>
					{messages.map((message) => (
						<p key={message.id}>
							[{getHHMM(message.date)} - {message.clientId}]{" "}
							{message.data as string}
						</p>
					))}
				</div>
				<div>
					<input
						type="text"
						value={inputMsg}
						onChange={(e) => setInputMsg(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") handleSend();
						}}
					/>
					<button onClick={handleSend}>Send</button>
				</div>
			</div>
		</>
	);
};

export default Chat;
