import { useState } from "react";
import Chat from "../Chat";
import Communication from "../../../RTC/Communication";

const ClientWidget = ({ client }: { client: Communication }) => {
	const [otherId, setOtherId] = useState("");

	return (
		<div style={{ border: "1px solid black", margin: 10 }}>
			<strong>{client.rtc.id}</strong>
			<br />
			<input
				type="text"
				placeholder="Other ID"
				value={otherId}
				onChange={(e) => setOtherId(e.target.value)}
			/>
			<button onClick={() => client.call(otherId)}>Start Call</button>

			<Chat chat={client} id={client.rtc.id} />
		</div>
	);
};

export default ClientWidget;
