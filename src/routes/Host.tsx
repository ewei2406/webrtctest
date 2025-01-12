import { useState } from "react";
import { NavLink } from "react-router";
import RTCHost from "../RTC/RTCHost";
import HostSlot from "../components/RTC/Host";

const Host = () => {
	const [hosts, setHosts] = useState<RTCHost[]>([]);

	const addHost = () => {
		const newHost = new RTCHost({ dataChannels: [{ label: "chat" }] });
		setHosts((hosts) => [...hosts, newHost]);
	};

	const removeHost = (id: string) => {
		setHosts((hosts) =>
			hosts.filter((h) => {
				if (h.id === id) {
					h.close();
					return false;
				}
				return true;
			})
		);
	};

	return (
		<>
			<NavLink to="/">Home</NavLink>
			<h1>Host</h1>

			<button onClick={addHost}>Add Host</button>
			<h3>Slots</h3>
			<div>
				{hosts.map((host) => (
					<HostSlot
						key={host.id}
						host={host}
						remove={() => removeHost(host.id)}
					/>
				))}
			</div>
		</>
	);
};

export default Host;
