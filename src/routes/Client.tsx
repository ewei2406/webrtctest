import { NavLink } from "react-router";
import ClientWidget from "../components/RTC/ClientWidget";
import { useState } from "react";
import Communication from "../RTC/Communication";

const Client = () => {
	const [client] = useState(new Communication());

	return (
		<>
			<NavLink to="/">Home</NavLink> <NavLink to="/host">Host</NavLink>
			<h1>Client</h1>
			<ClientWidget client={client} />
		</>
	);
};

export default Client;
