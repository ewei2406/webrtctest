import { useEffect, useState } from "react";
import { NavLink } from "react-router";
import MultiHost from "../RTC/multi/MultiHost";
import Communication from "../RTC/Communication";
import { getHHMM } from "../util/date";
import getMic from "../util/getMic";

const Host = () => {
	const [host] = useState(new MultiHost());
	const [history, setHistory] = useState(host.history);
	const [clients, setClients] = useState<
		{ clientId: string; communication: Communication }[]
	>([]);

	useEffect(() => {
		getMic().then((res) => {
			if (res.variant === "error") {
				alert("Microphone permission is required to use this app.");
			}
		});
	}, []);

	useEffect(() => {
		host.onConnectionStateChange = () => {
			const newClients = Array.from(host.connectionMap).map(
				([clientId, comm]) => ({
					clientId,
					communication: comm,
				})
			);
			setClients(newClients);
		};
		host.onHistoryUpdate = () => {
			setHistory([...host.history]);
		};
	}, [host]);

	const copyLink = () => {
		navigator.clipboard
			.writeText(window.location.origin + "/client?hostId=" + host.id)
			.then(() => {
				alert("Copied invite link to clipboard.");
			});
	};

	return (
		<>
			<NavLink to="/">Home</NavLink> <NavLink to="/client">Client</NavLink>
			<h1>Host</h1>
			Room id: {host.id}
			<br />
			<button onClick={copyLink}>Copy invite link</button>
			<br />
			<div style={{ display: "flex" }}>
				<div>
					<h3>Clients</h3>
					{clients.map(({ clientId, communication }) => (
						<div
							key={clientId}
							style={{ border: "1px solid black", margin: 10 }}
						>
							{clientId}
							<br />
							Channels:{" "}
							{Array.from(communication.rtc.dcs.values())
								.map((dc) => dc.label)
								.join(", ")}
						</div>
					))}
				</div>
				<div>
					<h3>History</h3>
					<div style={{ display: "flex", flexDirection: "column-reverse" }}>
						{history.map((mm) => (
							<div key={mm.id}>
								[{getHHMM(mm.date)} - {mm.clientId.slice(0, 6)}]{" "}
								{mm.data as string}
							</div>
						))}
					</div>
				</div>
			</div>
		</>
	);
};

export default Host;
