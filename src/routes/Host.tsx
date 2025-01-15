import { useRef, useState } from "react";
import { NavLink } from "react-router";
import Room, { ChatRoom } from "../RTC/room2/Room";
import { getUUID } from "../util/uuid";

const Host = () => {
	const room = useRef<ChatRoom>();
	const [id, setId] = useState("");
	const [input, setInput] = useState("");
	const [messages, setMessages] = useState<{ data: string; id: string }[]>([]);

	const host = async () => {
		const create = await Room.createRoom();
		if (create.variant === "error") {
			console.error(create.error);
			return;
		}
		room.current = create.value.room;
		room.current.dcs.chat.onmessage = (ev) => {
			setMessages((prev) => [...prev, { data: ev.data, id: getUUID() }]);
		};
		setId(create.value.id);
	};

	const send = () => {
		if (!room.current) {
			console.error("Client not initialized!");
			return;
		}
		const { dcs } = room.current;
		if (!dcs.chat) {
			console.error("Chat DC not initialized!");
			return;
		}
		dcs.chat.send(input);
		setMessages((prev) => [...prev, { data: input, id: getUUID() }]);
		setInput("");
	};

	const handleCopy = () => {
		navigator.clipboard.writeText(
			window.location.origin + "/client?hostId=" + id
		);
		alert("Copied to clipboard!");
	};

	return (
		<>
			<NavLink to="/">Home</NavLink> <NavLink to="/host">Host</NavLink>
			<h1>Host</h1>
			<br />
			<button onClick={host}>Start room</button>
			<br />
			Room ID: {id}
			<br />
			<button onClick={handleCopy}>Copy link</button>
			<br />
			<input
				type="text"
				placeholder="Message"
				value={input}
				onChange={(e) => setInput(e.target.value)}
			/>
			<button onClick={send}>Send</button>
			<div style={{ display: "flex", flexDirection: "column-reverse" }}>
				{messages.map((msg) => (
					<div key={msg.id}>{msg.data}</div>
				))}
			</div>
		</>
	);
};

export default Host;
