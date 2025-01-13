import { useState, useEffect } from "react";

const useDCStatus = (dc: RTCDataChannel) => {
	const [status, setStatus] = useState(dc.readyState);
	useEffect(() => {
		const open = () => {
			setStatus("open");
		};
		const close = () => {
			setStatus("closed");
		};
		const closing = () => {
			setStatus("closing");
		};

		dc.addEventListener("open", open);
		dc.addEventListener("close", close);
		dc.addEventListener("closing", closing);
		return () => {
			dc.removeEventListener("open", open);
			dc.removeEventListener("close", close);
			dc.removeEventListener("closing", closing);
		};
	}, [dc]);

	return { status };
};

export default useDCStatus;
