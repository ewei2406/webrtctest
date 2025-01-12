import { useEffect, useState } from "react";

const DCStatus = ({ dc }: { dc: RTCDataChannel }) => {
	const [status, setStatus] = useState(dc.readyState);
	useEffect(() => {
		const open = () => setStatus("open");
		const close = () => setStatus("closed");

		dc.addEventListener("open", open);
		dc.addEventListener("close", close);
		return () => {
			dc.removeEventListener("open", open);
			dc.removeEventListener("close", close);
		};
	}, [dc]);

	return (
		<div style={{ border: "1px solid gray" }}>
			{dc.label}: {status}
		</div>
	);
};

export default DCStatus;
