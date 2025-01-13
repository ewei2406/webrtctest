import Chat from "../Chat";
import Communication from "../../../RTC/Communication";
import { useState } from "react";

const HostWidget = ({
	host,
	remove,
}: {
	host: Communication;
	remove: () => void;
}) => {
	const [isOpen, setIsOpen] = useState(false);

	const handleHost = async () => {
		if (isOpen) {
			host.close();
			setIsOpen(false);
		} else {
			const res = await host.host();
			if (res.variant === "ok") {
				setIsOpen(true);
			}
		}
	};

	const copyId = () => {
		navigator.clipboard.writeText(host.rtc.id);
		alert("ID copied to clipboard");
	};

	return (
		<div style={{ border: "1px solid black", margin: 10 }}>
			My id: <strong>{host.rtc.id}</strong>
			<br />
			<button onClick={copyId}>Copy ID</button>
			<button onClick={handleHost}>
				{isOpen ? "Disable" : "Enable"} calls
			</button>
			<button onClick={remove}>Remove</button>
			<br />
			<Chat chat={host} id={host.rtc.id} />
		</div>
	);
};

export default HostWidget;
