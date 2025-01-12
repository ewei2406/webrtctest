import { useState } from "react";
import { NavLink } from "react-router";
import ClientSlot from "../components/RTC/ClientWidget";
import RTCBase from "../RTC/RTCBase";

const Client = () => {
	const [client] = useState(new RTCBase({ dataChannels: [{ label: "chat" }] }));

	return (
		<>
			<NavLink to="/">Home</NavLink>
			<h1>Client</h1>

			<ClientSlot client={client} />
		</>
	);
};

export default Client;
