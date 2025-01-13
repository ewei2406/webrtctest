import { DEFAULT_RTC_CONFIG, ICE_TIMEOUT_MS } from "../util/constants";
import getMic from "../util/getMic";
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

	public onError: (label: string, ev: Event) => void = console.error;
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
			this.dcs.set(dc.label, dc);
		};

		this.pc = new RTCPeerConnection(props.config || DEFAULT_RTC_CONFIG);
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

	private async ICECompleted(): Promise<Result> {
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

	public async submitOffer(
		offer: RTCSessionDescriptionInit
	): Promise<Result<RTCSessionDescriptionInit>> {
		const mic = await getMic();
		if (mic.variant === "error") {
			return mic;
		}

		await this.pc.setRemoteDescription(offer);
		const answer = await this.pc.createAnswer();
		await this.pc.setLocalDescription(answer);

		const ICEResult = await this.ICECompleted();
		if (ICEResult.variant === "error") {
			return ICEResult;
		}

		if (!this.pc.localDescription) {
			return {
				variant: "error",
				error: "Failed to create answer.",
			};
		}

		return { variant: "ok", value: this.pc.localDescription };
	}

	public async createOffer(): Promise<Result<RTCSessionDescriptionInit>> {
		const mic = await getMic();
		if (mic.variant === "error") {
			return mic;
		}

		const offer = await this.pc.createOffer();
		await this.pc.setLocalDescription(offer);

		const ICEResult = await this.ICECompleted();
		if (ICEResult.variant === "error") {
			return ICEResult;
		}

		if (!this.pc.localDescription) {
			return {
				variant: "error",
				error: "Failed to create offer.",
			};
		}

		return {
			variant: "ok",
			value: this.pc.localDescription,
		};
	}

	public async submitAnswer(answer: RTCSessionDescriptionInit) {
		this.pc.setRemoteDescription(answer);
	}

	public addMessageListener(
		label: string,
		onMessage: (message: MessageEvent) => void
	): Result {
		const dc = this.dcs.get(label);
		if (!dc) {
			return {
				variant: "error",
				error: `Channel with label ${label} not found.`,
			};
		}
		dc.addEventListener("message", onMessage);
		return { variant: "ok" };
	}

	public removeMessageListener(
		label: string,
		onMessage: (message: MessageEvent) => void
	): Result {
		const dc = this.dcs.get(label);
		if (!dc) {
			return {
				variant: "error",
				error: `Channel with label ${label} not found.`,
			};
		}
		dc.removeEventListener("message", onMessage);
		return { variant: "ok" };
	}
}

export default RTCBase;
