import { ICE_TIMEOUT_MS } from "../util/constants";
import { Result } from "../util/result";
import { getUUID } from "../util/uuid";

type DataChannelProps = {
	label: string;
	init?: RTCDataChannelInit;
};

class RTCBase {
	public readonly pc: RTCPeerConnection;
	public readonly id = getUUID();
	public readonly dcs = new Map<string, RTCDataChannel>();

	public onError: (label: string, ev: RTCErrorEvent) => void = console.error;
	public onMessage: (label: string, ev: MessageEvent) => void = console.log;
	public onOpen: (label: string, ev: Event) => void = console.log;
	public onClose: (label: string, ev: Event) => void = console.log;

	constructor(props: {
		config?: RTCConfiguration;
		dataChannels: DataChannelProps[];
	}) {
		const addDc = (dc: RTCDataChannel) => {
			dc.onerror = (ev) => this.onError(dc.label, ev);
			dc.onopen = (ev) => this.onOpen(dc.label, ev);
			dc.onclose = (ev) => this.onClose(dc.label, ev);
			dc.onmessage = (ev) => this.onMessage(dc.label, ev);
			this.dcs.set(dc.label, dc);
		};

		this.pc = new RTCPeerConnection(props.config);
		props.dataChannels.forEach((dcInit) => {
			const dc = this.pc.createDataChannel(dcInit.label);
			addDc(dc);
		});

		this.pc.ondatachannel = (event) => {
			const dc = event.channel;
			addDc(dc);
		};
	}

	public close() {
		this.dcs.forEach((dc) => dc.close());
		this.pc.close();
	}

	public sendMessage(channelLabel: string, message: string): Result {
		const dc = this.dcs.get(channelLabel);
		if (!dc) {
			return {
				variant: "error",
				error: `Channel with label ${channelLabel} not found.`,
			};
		}
		dc.send(message);
		return { variant: "ok" };
	}

	protected async ICECompleted(): Promise<Result> {
		if (this.pc.iceGatheringState === "complete") return { variant: "ok" };

		return new Promise<Result>((resolve) => {
			const timeout = setTimeout(() => {
				resolve({
					variant: "error",
					error: `ICE gathering timed out after ${ICE_TIMEOUT_MS / 1000}s.`,
				});
			}, ICE_TIMEOUT_MS);

			this.pc.onicegatheringstatechange = () => {
				if (this.pc.iceGatheringState === "complete") {
					clearTimeout(timeout);
					resolve({ variant: "ok" });
				}
			};
		});
	}
}

export default RTCBase;
