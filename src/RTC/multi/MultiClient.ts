import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../util/firebase";
import Communication from "../Communication";
import { Result } from "../../util/result";

class MultiClient {
	public readonly comm: Communication;

	constructor() {
		this.comm = new Communication();
		this.comm.rtc.dcs.forEach((dc) => {
			dc.addEventListener("message", (ev) => {
				console.log(`recieved ${ev}`);
			});
		});
	}

	async call(targetId: string): Promise<Result> {
		const host = await this.comm.host();
		if (host.variant === "error") {
			return host;
		}

		const docRef = doc(db, "multi", targetId);
		try {
			await updateDoc(docRef, {
				clientId: this.comm.rtc.id,
			});
			return { variant: "ok" };
		} catch {
			return {
				variant: "error",
				error: `Failed to connect to host with ID "${targetId}". Is the host active?`,
			};
		}
	}

	async sendMessage(message: string) {
		return this.comm.sendMessage(message);
	}
}

export default MultiClient;
