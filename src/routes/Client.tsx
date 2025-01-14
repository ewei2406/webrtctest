import { NavLink } from "react-router";
import { useState } from "react";
import MultiClient from "../RTC/multi/MultiClient";
import Chat from "../components/RTC/Chat";
import getMic from "../util/getMic";

const Client = () => {
	const [otherId] = useState(() => {
		const params = new URLSearchParams(window.location.search);
		const hostId = params.get("hostId");
		return hostId || "";
	});
	const [client] = useState(new MultiClient());
	const [error, setError] = useState<string>();

	if (!otherId) {
		return (
			<>
				<h1>Error</h1>
				<p>Invalid invite link.</p>
			</>
		);
	}

	const handleCall = async () => {
		const micresult = await getMic();
		if (micresult.variant === "error") {
			setError(micresult.error);
			alert("Microphone permission is required to use this app.");
			return;
		}
		const result = await client.call(otherId);
		if (result.variant === "error") {
			setError(result.error);
		}
	};

	return (
		<>
			<NavLink to="/">Home</NavLink> <NavLink to="/host">Host</NavLink>
			<h1>Client</h1>
			My id: {client.comm.rtc.id}
			<br />
			<button onClick={handleCall}>Join lobby: {otherId}</button>
			{error && <p style={{ color: "red" }}>{error}</p>}
			<Chat id={client.comm.rtc.id} chat={client.comm} />
		</>
	);
};

export default Client;
