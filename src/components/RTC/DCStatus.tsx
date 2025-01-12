import { useEffect, useState } from "react";

const DCStatus = ({
	dc,
	onStatusChange,
}: {
	dc: RTCDataChannel;
	onStatusChange: (status: RTCDataChannelState) => void;
}) => {
	const [status, setStatus] = useState(dc.readyState);
	useEffect(() => {
		const open = () => {
			onStatusChange("open");
			setStatus("open");
		};
		const close = () => {
			onStatusChange("closed");
			setStatus("closed");
		};

		dc.addEventListener("open", open);
		dc.addEventListener("close", close);
		return () => {
			dc.removeEventListener("open", open);
			dc.removeEventListener("close", close);
		};
	}, [dc, onStatusChange]);

	return (
		<div style={{ border: "1px solid gray" }}>
			{dc.label}: {status}
		</div>
	);
};

export default DCStatus;
