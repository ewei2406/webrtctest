import { Result } from "../util/result";
import RTCBase from "./RTCBase";
import { Signaler } from "./Signaler";

const CHAT_DCINIT = [
	{
		label: "chat",
		init: {
			ordered: true,
		},
	},
];

class Chat<T extends Signaler> {
	rtc: RTCBase;
	signaler: T;

	constructor(signaler: T, onMessage: (message: MessageEvent) => void) {
		this.rtc = new RTCBase({
			dataChannels: CHAT_DCINIT,
		});
		this.rtc.addMessageListener("chat", onMessage);
		this.signaler = signaler;
		this.signaler.onAnswer = (answer) => {
			this.rtc.submitAnswer(answer);
		};
		this.signaler.id = this.rtc.id;
	}

	async host(): Promise<Result> {
		const offer = await this.rtc.createOffer();
		if (offer.variant === "error") {
			return offer;
		}
		const signal = await this.signaler.setOffer(this.rtc.id, offer.value);
		if (signal.variant === "error") {
			return signal;
		}
		this.signaler.listen(this.rtc.id);
		return { variant: "ok" };
	}

	async call(targetId: string): Promise<Result> {
		const remoteOffer = await this.signaler.getOffer(targetId);
		if (remoteOffer.variant === "error") {
			return remoteOffer;
		}
		const answer = await this.rtc.submitOffer(remoteOffer.value);
		if (answer.variant === "error") {
			return answer;
		}
		const signal = await this.signaler.sendAnswer(targetId, answer.value);
		if (signal.variant === "error") {
			return signal;
		}
		return { variant: "ok" };
	}

	sendMessage(message: string): Result {
		return this.rtc.sendMessage("chat", message);
	}
}

export default Chat;
