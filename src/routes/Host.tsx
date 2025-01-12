import { useState } from "react";
import { NavLink } from "react-router";
import RTCBase from "../RTC/RTCBase";
import HostWidget from "../components/RTC/HostWidget";

const Host = () => {
	const [hosts, setHosts] = useState<RTCBase[]>([]);

	const addHost = () => {
		const newHost = new RTCBase({ dataChannels: [{ label: "chat" }] });
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
					<HostWidget
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
