import { ReactNode, useEffect, useState } from "react";
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

	const dcStatuses: ReactNode[] = [];
	rtc.dcs.forEach((dc) =>
		dcStatuses.push(
			<p key={dc.label + dc.readyState}>
				{dc.label}: {dc.readyState}
			</p>
		)
	);

	return (
		<div>
			<p>RTC Status: {pcStatus}</p>
			{dcStatuses}
		</div>
	);
};

export default RTCStatus;
