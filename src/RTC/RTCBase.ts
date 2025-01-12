import { ICE_TIMEOUT_MS } from "../util/constants";
import { Result } from "../util/result";
import { getUUID } from "../util/uuid";

type DataChannelProps = RTCDataChannelInit & {
	label: string;
};

class RTCBase {
	protected pc: RTCPeerConnection;
	public readonly id = getUUID();
	protected dcs = new Map<string, RTCDataChannel>();

	constructor(props: {
		config?: RTCConfiguration;
		dataChannels: DataChannelProps[];
		onMessage?: (label: string, ev: MessageEvent) => void;
		onError?: (label: string, ev: RTCErrorEvent) => void;
		onOpen?: (label: string, ev: Event) => void;
		onClose?: (label: string, ev: Event) => void;
	}) {
		const onError = props.onError || console.error;
		const onOpen = props.onOpen || console.log;
		const onClose = props.onClose || console.log;
		const onMessage = props.onMessage || console.log;

		const addDc = (dc: RTCDataChannel) => {
			dc.onerror = (ev) => onError(dc.label, ev);
			dc.onopen = (ev) => onOpen(dc.label, ev);
			dc.onclose = (ev) => onClose(dc.label, ev);
			dc.onmessage = (ev) => onMessage(dc.label, ev);
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
