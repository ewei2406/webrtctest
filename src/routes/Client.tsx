import { useState } from "react";
import { NavLink } from "react-router";
import RTCClient from "../RTC/RTCClient";
import ClientSlot from "../components/RTC/Client";

const Client = () => {
	const [client] = useState(
		new RTCClient({ dataChannels: [{ label: "chat" }] })
	);

	return (
		<>
			<NavLink to="/">Home</NavLink>
			<h1>Client</h1>

			<ClientSlot client={client} />
		</>
	);
};

export default Client;
