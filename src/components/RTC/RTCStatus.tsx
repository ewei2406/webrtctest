import { useEffect, useState } from "react";
import RTCBase from "../../RTC/RTCBase";

const RTCStatus = ({ rtc }: { rtc: RTCBase }) => {
	const [pcStatus, setPcStatus] = useState(rtc.pc.iceConnectionState);
	useEffect(() => {
		rtc.pc.oniceconnectionstatechange = () =>
			setPcStatus(rtc.pc.iceConnectionState);

		return () => {
			rtc.pc.oniceconnectionstatechange = null;
		};
	}, [rtc.pc]);

	return <div>RTC Status: {pcStatus}</div>;
};

export default RTCStatus;
