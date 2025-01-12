import { useState } from "react";
import { NavLink } from "react-router";
import RTCHost from "../RTC/RTCHost";
import HostSlot from "../components/HostSlot";

const Host = () => {
	const [hosts, setHosts] = useState<RTCHost[]>([]);

	const addClientSlot = () => {
		const newHost = new RTCHost({ dataChannels: [{ label: "chat" }] });
		setHosts([...hosts, newHost]);
	};

	return (
		<>
			<NavLink to="/">Home</NavLink>
			<h1>Host</h1>

			<button onClick={addClientSlot}>Add Client Slot</button>
			<h3>Slots</h3>
			<div>
				{hosts.map((host) => (
					<HostSlot key={host.id} host={host} />
				))}
			</div>
		</>
	);
};

export default Host;
