import { DEFAULT_RTC_CONFIG } from "../../util/constants";

export type DCInit = {
	onMessage: (ev: MessageEvent) => void;
	onOpen: () => void;
	onClose: () => void;
	init?: RTCDataChannelInit;
};

export type PCAndDC<T> = {
	pc: RTCPeerConnection;
	dcs: {
		[K in keyof T]: RTCDataChannel;
	};
};

const createHostPC = <T extends { [label: string]: DCInit }>(
	dcInit: T
): PCAndDC<T> => {
	const pc = new RTCPeerConnection(DEFAULT_RTC_CONFIG);
	const dcs = Object.fromEntries(
		Object.keys(dcInit).map((label) => [
			label,
			pc.createDataChannel(label, dcInit[label].init),
		])
	) as { [K in keyof T]: RTCDataChannel };
	for (const [label, methods] of Object.entries(dcInit)) {
		const dc = dcs[label];
		dc.onmessage = methods.onMessage;
		dc.onopen = methods.onOpen;
		dc.onclose = methods.onClose;
	}
	return { pc, dcs };
};

const createClientPC = <T extends { [label: string]: DCInit }>(
	dcInit: T
): PCAndDC<T> => {
	const pc = new RTCPeerConnection(DEFAULT_RTC_CONFIG);
	const dcs = Object.fromEntries(
		Object.keys(dcInit).map((label) => [
			label,
			pc.createDataChannel(label, dcInit[label].init),
		])
	) as { [K in keyof T]: RTCDataChannel };

	for (const [label, methods] of Object.entries(dcInit)) {
		const dc = dcs[label];
		dc.onmessage = methods.onMessage;
		dc.onopen = methods.onOpen;
		dc.onclose = methods.onClose;
	}
	return { pc, dcs };
};

const RTC = { createHostPC, createClientPC };
export default RTC;
