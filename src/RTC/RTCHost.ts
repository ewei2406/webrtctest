import { Result } from "../util/result";
import RTCBase from "./RTCBase";

class RTCHost extends RTCBase {
	public async createOffer(): Promise<Result<RTCSessionDescriptionInit>> {
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
}

export default RTCHost;
