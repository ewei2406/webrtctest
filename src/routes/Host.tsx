import { useState } from "react";
import { NavLink } from "react-router";
import HostWidget from "../components/RTC/HostWidget";
import Communication from "../RTC/Communication";

const Host = () => {
	const [hosts, setHosts] = useState<Communication[]>([]);

	const addHost = () => {
		const newHost = new Communication();
		setHosts((hosts) => [...hosts, newHost]);
	};

	const removeHost = (id: string) => {
		setHosts((hosts) =>
			hosts.filter((h) => {
				if (h.rtc.id === id) {
					h.close();
					return false;
				}
				return true;
			})
		);
	};

	return (
		<>
			<NavLink to="/">Home</NavLink> <NavLink to="/client">Client</NavLink>
			<h1>Host</h1>
			<button onClick={addHost}>Add Host</button>
			<h3>Slots</h3>
			<div>
				{hosts.map((host) => (
					<HostWidget
						key={host.rtc.id}
						host={host}
						remove={() => removeHost(host.rtc.id)}
					/>
				))}
			</div>
		</>
	);
};

export default Host;
