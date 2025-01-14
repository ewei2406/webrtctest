import useChat from "../../../hooks/useChat";
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
			<div
				style={{
					border: "1px solid black",
					margin: 10,
					width: 500,
					display: "flex",
					flexDirection: "column",
				}}
			>
				<div style={{ padding: 5, backgroundColor: "black", color: "white" }}>
					<strong>Chat</strong>
				</div>
				<div
					style={{
						padding: 5,
						display: "flex",
						flexDirection: "column-reverse",
						overflowY: "scroll",
						height: 200,
						gap: 5,
					}}
				>
					{messages.map((message) => (
						<div key={message.id}>
							[{getHHMM(message.date)} - {message.clientId.slice(0, 6)}]{" "}
							{message.data as string}
						</div>
					))}
				</div>
				<div style={{ flexGrow: 1, display: "flex" }}>
					<input
						style={{ flexGrow: 1 }}
						type="text"
						value={inputMsg}
						onChange={(e) => setInputMsg(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") handleSend();
						}}
						disabled={status !== "open"}
						placeholder={
							status === "open" ? "Type a message..." : "Chat disconnected."
						}
					/>
					<button onClick={handleSend}>Send</button>
				</div>
			</div>
		</>
	);
};

export default Chat;
