import { useEffect, useState } from "react";
import { NavLink } from "react-router";
import MultiHost from "../RTC/multi/MultiHost";
import Communication from "../RTC/Communication";
import RTCStatus from "../components/RTC/RTCStatus";
import DCStatus from "../components/RTC/DCStatus";
import { getHHMM } from "../util/date";

const Host = () => {
	const [host] = useState(new MultiHost());
	const [history, setHistory] = useState(host.history);
	const [clients, setClients] = useState<
		{ clientId: string; communication: Communication }[]
	>([]);

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

	return (
		<>
			<NavLink to="/">Home</NavLink> <NavLink to="/client">Client</NavLink>
			<h1>Host</h1>
			My id: {host.id}
			<br />
			<h3>History</h3>
			<div>
				{history.map((mm) => (
					<p key={mm.id}>
						[{getHHMM(mm.date)} - {mm.clientId}] {mm.data as string}
					</p>
				))}
			</div>
			<h3>Clients</h3>
			{clients.map(({ clientId, communication }) => (
				<div key={clientId} style={{ border: "1px solid black", margin: 10 }}>
					{clientId}
					<RTCStatus rtc={communication.rtc} />
					{Array.from(communication.rtc.dcs.values()).map((dc) => (
						<DCStatus key={dc.id} dc={dc} />
					))}
				</div>
			))}
		</>
	);
};

export default Host;
