import { NavLink } from "react-router";
import { useState } from "react";
import MultiClient from "../RTC/multi/MultiClient";
import Chat from "../components/RTC/Chat";

const Client = () => {
	const [otherId, setOtherId] = useState("");
	const [client] = useState(new MultiClient());

	const handleCall = async () => {
		const result = await client.call(otherId);
		if (result.variant === "error") {
			console.error(result.error);
		}
	};

	return (
		<>
			<NavLink to="/">Home</NavLink> <NavLink to="/host">Host</NavLink>
			<h1>Client</h1>
			My id: {client.comm.rtc.id}
			<br />
			<input
				type="text"
				placeholder="Other ID"
				value={otherId}
				onChange={(e) => setOtherId(e.target.value)}
			/>
			<button onClick={handleCall}>Join</button>
			<Chat id={client.comm.rtc.id} chat={client.comm} />
		</>
	);
};

export default Client;
