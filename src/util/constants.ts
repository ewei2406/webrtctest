export const ICE_TIMEOUT_MS = 10000;
export const CALL_TIMEOUT_MS = 2000;

export const DEFAULT_RTC_CONFIG: RTCConfiguration = {
	iceServers: [
		{
			urls: "stun:stun.l.google.com:19302",
		},
	],
};
