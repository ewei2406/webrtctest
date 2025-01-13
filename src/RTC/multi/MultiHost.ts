import { deleteDoc, doc, onSnapshot, setDoc } from "firebase/firestore";
import { getUUID } from "../../util/uuid";
import { db } from "../../util/firebase";
import Communication from "../Communication";

export type MultiMessage = {
	id: string;
	date: Date;
	clientId: string;
	data: unknown;
};

class MultiHost {
	public id: string;
	onConnectionStateChange: (
		clientId: string,
		state: RTCPeerConnectionState
	) => void = () => {};
	onHistoryUpdate: (mm: MultiMessage) => void = () => {};
	connectionMap: Map<string, Communication> = new Map();
	history: (MultiMessage & { dcLabel: string })[] = [];

	constructor() {
		this.id = getUUID();
		const docRef = doc(db, "multi", this.id);
		setDoc(docRef, { clientId: "" }).then(() => this.listen());
	}

	async close() {
		const docRef = doc(db, "multi", this.id);
		await deleteDoc(docRef);
	}

	private async listen() {
		const docRef = doc(db, "multi", this.id);
		onSnapshot(docRef, (doc) => {
			const data = doc.data() as { clientId: string };
			if (data.clientId) {
				this.handleConnection(data.clientId);
			}
		});
	}

	private async handleConnection(clientId: string) {
		if (clientId === "" || this.connectionMap.has(clientId)) return;

		const connection = new Communication();
		connection.rtc.dcs.forEach((dc) => {
			dc.addEventListener("message", (ev) =>
				this.fanOut(dc.label, {
					id: getUUID(),
					clientId,
					data: ev.data,
					date: new Date(),
				})
			);
			dc.addEventListener("close", () => {});
		});
		connection.rtc.pc.onconnectionstatechange = () => {
			if (connection.rtc.pc.connectionState === "disconnected") {
				this.connectionMap.delete(clientId);
			}
			this.onConnectionStateChange(clientId, connection.rtc.pc.connectionState);
		};
		this.connectionMap.set(clientId, connection);
		await connection.call(clientId);
		connection.rtc.dcs.forEach((dc) => {
			dc.onopen = () => {
				this.catchUp(dc);
			};
			dc.onclose = () => {
				this.connectionMap.delete(clientId);
				this.onConnectionStateChange(clientId, "closed");
			};
		});
	}

	private async fanOut(dcLabel: string, mm: MultiMessage) {
		console.log(`${mm.clientId} (${dcLabel}): ${mm.data} @ ${mm.date}`);
		this.history.push({ ...mm, dcLabel });
		this.connectionMap.forEach((connection, id) => {
			if (id !== mm.clientId) {
				connection.rtc.dcs.get(dcLabel)?.send(JSON.stringify(mm));
			}
		});
		this.onHistoryUpdate(mm);
	}

	private async catchUp(dc: RTCDataChannel) {
		if (dc.readyState !== "open") return;

		this.history
			.filter((mm) => mm.dcLabel === dc.label)
			.forEach((mm) => {
				const withoutLabel: Record<string, unknown> = { ...mm };
				delete withoutLabel.dcLabel;
				dc.send(JSON.stringify(withoutLabel));
			});
	}
}

export default MultiHost;
