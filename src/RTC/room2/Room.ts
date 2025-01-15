import { Result } from "../../util/result";
import RTC, { DCInit, PCAndDC } from "./RTC";
import Signalling from "./Signalling";

const dcInit: { chat: DCInit } = {
	chat: {
		onMessage: (ev: MessageEvent) => console.log("Chat DC message: ", ev.data),
		onOpen: () => console.log("Chat DC open"),
		onClose: () => console.log("Chat DC closed"),
		init: {
			id: 0,
			negotiated: true,
		},
	},
};

export type ChatRoom = PCAndDC<typeof dcInit>;

const createRoom = async (): Promise<
	Result<{ room: ChatRoom; id: string }>
> => {
	const hostRoom = RTC.createHostPC(dcInit);

	const roomId = await Signalling.createRoom();
	if (roomId.variant === "error") {
		console.error(roomId.error);
		return roomId;
	}
	console.log(`Created new room: ${roomId.value}`);

	hostRoom.pc.onicecandidate = async (ev) => {
		if (ev.candidate) {
			console.log("Got new local ICE candidate: ", ev.candidate);
			Signalling.sendCalleeICECandidate(roomId.value, ev.candidate.toJSON());
		}
	};

	const offer = await hostRoom.pc.createOffer();
	await hostRoom.pc.setLocalDescription(offer);
	Signalling.setRoomOffer(roomId.value, offer);
	console.log(`Updated room with offer: ${offer.sdp}`);

	Signalling.onRoomAnswer(roomId.value, async (answer) => {
		console.log("Got remote description: ", answer);
		if (!hostRoom.pc.remoteDescription) {
			await hostRoom.pc.setRemoteDescription(new RTCSessionDescription(answer));
		}
	});

	Signalling.onCallerICECandidate(roomId.value, async (candidate) => {
		console.log("Got new remote ICE candidate: ", candidate);
		await hostRoom.pc.addIceCandidate(new RTCIceCandidate(candidate));
	});

	return { variant: "ok", value: { room: hostRoom, id: roomId.value } };
};

const joinRoom = async (roomId: string): Promise<Result<ChatRoom>> => {
	const clientRoom = RTC.createClientPC(dcInit);

	const offer = await Signalling.getRoomOffer(roomId);
	if (offer.variant === "error") {
		console.error(offer.error);
		return offer;
	}
	console.log(`Got offer: ${offer.value.sdp}`);

	clientRoom.pc.onicecandidate = async (ev) => {
		if (ev.candidate) {
			console.log("Got new local ICE candidate: ", ev.candidate);
			Signalling.sendCallerICECandidate(roomId, ev.candidate.toJSON());
		}
	};

	await clientRoom.pc.setRemoteDescription(
		new RTCSessionDescription(offer.value)
	);
	const answer = await clientRoom.pc.createAnswer();
	await clientRoom.pc.setLocalDescription(answer);
	Signalling.setRoomAnswer(roomId, answer);
	console.log(`Updated room with answer: ${answer.sdp}`);

	Signalling.onCalleeICECandidate(roomId, async (candidate) => {
		console.log("Got new remote ICE candidate: ", candidate);
		await clientRoom.pc.addIceCandidate(candidate);
	});

	return { variant: "ok", value: clientRoom };
};

const Room = { createRoom, joinRoom };
export default Room;
