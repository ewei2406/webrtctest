import { Result } from "../util/result";
import RTCBase from "./RTCBase";
import FBSignaler from "./Signaler";

const COMM_DCINIT = [
	{
		label: "chat",
	},
];

class Communication {
	rtc: RTCBase;
	unsub?: () => void;

	constructor() {
		this.rtc = new RTCBase({
			dataChannels: COMM_DCINIT,
		});
	}

	async host(): Promise<Result> {
		const offer = await this.rtc.createOffer();
		if (offer.variant === "error") {
			return offer;
		}
		const signal = await FBSignaler.setOffer(this.rtc.id, offer.value);
		if (signal.variant === "error") {
			return signal;
		}
		this.unsub = FBSignaler.listen(this.rtc.id, (answer) => {
			this.rtc.submitAnswer(answer);
		});
		return { variant: "ok" };
	}

	async call(targetId: string): Promise<Result> {
		const remoteOffer = await FBSignaler.getOffer(targetId);
		if (remoteOffer.variant === "error") {
			return remoteOffer;
		}
		const answer = await this.rtc.submitOffer(remoteOffer.value);
		if (answer.variant === "error") {
			return answer;
		}
		const signal = await FBSignaler.sendAnswer(
			this.rtc.id,
			targetId,
			answer.value
		);
		if (signal.variant === "error") {
			return signal;
		}
		return { variant: "ok" };
	}

	sendMessage(message: string): Result {
		return this.rtc.sendMessage("chat", message);
	}

	close() {
		this.unsub?.();
		this.rtc.close();
		FBSignaler.closeOffer(this.rtc.id);
	}
}

export default Communication;
