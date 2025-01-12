import { Result } from "../util/result";
import RTCBase from "./RTCBase";

class RTCClient extends RTCBase {
	public async submitOffer(
		offer: RTCSessionDescriptionInit
	): Promise<Result<RTCSessionDescriptionInit>> {
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
}

export default RTCClient;
