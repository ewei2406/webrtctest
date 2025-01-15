import { NavLink } from "react-router";
import Room, { ChatRoom } from "../RTC/room2/Room";
import { useRef, useState } from "react";
import { getUUID } from "../util/uuid";

const Client = () => {
	const room = useRef<ChatRoom>();
	const [otherId, setOtherId] = useState(() => {
		const params = new URLSearchParams(window.location.search);
		return params.get("hostId") || "";
	});
	const [input, setInput] = useState("");
	const [messages, setMessages] = useState<{ data: string; id: string }[]>([]);

	const handleCall = async () => {
		const join = await Room.joinRoom(otherId);
		if (join.variant === "error") {
			console.error(join.error);
			return;
		}
		room.current = join.value;
		room.current.dcs.chat.onmessage = (ev) => {
			setMessages((prev) => [...prev, { data: ev.data, id: getUUID() }]);
		};
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

	return (
		<>
			<NavLink to="/">Home</NavLink> <NavLink to="/host">Host</NavLink>
			<h1>Client</h1>
			<br />
			<input
				type="text"
				placeholder="Other ID"
				value={otherId}
				onChange={(e) => setOtherId(e.target.value)}
			/>
			<button onClick={handleCall}>Join</button>
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

export default Client;
