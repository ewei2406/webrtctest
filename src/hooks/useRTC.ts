import { useCallback, useEffect, useRef, useState } from "react";
import { Result } from "../util/result";

const DEFAULT_RTC_CONFIG: RTCConfiguration = {
	iceCandidatePoolSize: 1,
	iceServers: [
		{
			urls: "stun:stun.l.google.com:19302",
		},
	],
};

const DEFAULT_DATACHANNEL_LABEL = "chat";

type ConnectionState =
	| { variant: "error"; error: string }
	| { variant: "disconnected" }
	| { variant: "readying" }
	| { variant: "ready" }
	| { variant: "connecting" }
	| { variant: "connected" };

type DataChannelData = string | Blob | ArrayBuffer | ArrayBufferView;

type UseRTCProps<T extends DataChannelData> = {
	/**
	 * Disable using stun/turn servers, will only work between devices on same network
	 */
	localOnly: boolean;
	onRecieveMessage: (data: T) => void;
	onSendMessage: (data: T) => void;
	isOfferCreator: boolean;
};

const useRTC = <T extends DataChannelData = string>(props: UseRTCProps<T>) => {
	const dataChannelRef = useRef<RTCDataChannel>();
	const peerConnectionRef = useRef<RTCPeerConnection>();
	const [connectionState, setConnectionState] = useState<ConnectionState>({
		variant: "disconnected",
	});

	const [offer, setOffer] = useState<RTCSessionDescriptionInit | undefined>();
	const [answer, setAnswer] = useState<RTCSessionDescriptionInit | undefined>();
	const [resetCount, setResetCount] = useState(0);

	const initializeConnection = useCallback((): Result => {
		// Connection already exists.
		// TODO: Reset the connection.
		if (peerConnectionRef.current) {
			return {
				variant: "error",
				error: "Connection already exists.",
			};
		}

		const initializeDataChannel = (channel: RTCDataChannel) => {
			dataChannelRef.current = channel;
			dataChannelRef.current.onopen = () => {
				setConnectionState({ variant: "connected" });
			};
			dataChannelRef.current.onmessage = (event) => {
				props.onRecieveMessage(event.data);
			};
		};

		setConnectionState({ variant: "ready" });
		const config = props.localOnly ? {} : DEFAULT_RTC_CONFIG;
		peerConnectionRef.current = new RTCPeerConnection(config);
		peerConnectionRef.current.ondatachannel = (event) => {
			initializeDataChannel(event.channel);
		};
		peerConnectionRef.current.oniceconnectionstatechange = () => {
			switch (peerConnectionRef.current?.iceConnectionState) {
				case "disconnected":
					setConnectionState({ variant: "disconnected" });
					break;
				default:
					setConnectionState({ variant: "connecting" });
			}
		};

		const newDataChannel = peerConnectionRef.current.createDataChannel(
			DEFAULT_DATACHANNEL_LABEL
		);
		initializeDataChannel(newDataChannel);
		return { variant: "ok" };
	}, [props]);

	const closeConnection = useCallback((): Result => {
		if (peerConnectionRef.current) {
			peerConnectionRef.current.close();
		}
		peerConnectionRef.current = undefined;
		dataChannelRef.current = undefined;
		setOffer(undefined);
		setAnswer(undefined);
		setConnectionState({ variant: "disconnected" });
		return { variant: "ok" };
	}, []);

	const setRemoteDescription = useCallback(
		async (description: RTCSessionDescriptionInit): Promise<Result> => {
			if (!peerConnectionRef.current) {
				return { variant: "error", error: "Peer connection not ready." };
			}

			try {
				await peerConnectionRef.current.setRemoteDescription(description);
				setConnectionState({ variant: "disconnected" });
				// catch the operationError
			} catch (e) {
				return { variant: "error", error: (e as Error).message };
			}

			// If the description is an answer, we are done
			if (description.type === "answer") {
				setAnswer(description);
				if (!peerConnectionRef.current.localDescription) {
					return { variant: "error", error: "Local description not found." };
				}
				return {
					variant: "ok",
				};
			}

			// If the description is an offer, create an answer
			const answer = await peerConnectionRef.current.createAnswer();
			if (!answer.sdp) {
				return { variant: "error", error: "Failed to create answer SDP." };
			}
			await peerConnectionRef.current.setLocalDescription(answer);

			peerConnectionRef.current.onicecandidate = (event) => {
				// Only once all candidates gathered can we proceed
				if (
					event.candidate ||
					!peerConnectionRef.current ||
					!peerConnectionRef.current.localDescription?.sdp
				) {
					return;
				}
				setAnswer(peerConnectionRef.current.localDescription);
			};

			return { variant: "ok" };
		},
		[]
	);

	const createOffer = useCallback(async (): Promise<Result> => {
		if (!peerConnectionRef.current) {
			return { variant: "error", error: "Peer connection not ready." };
		}

		// Wait until ICE candidate is collected
		peerConnectionRef.current.onicecandidate = (event) => {
			// Only once all candidates gathered can we proceed
			if (
				event.candidate ||
				!peerConnectionRef.current ||
				!peerConnectionRef.current.localDescription?.sdp
			) {
				return;
			}
			setConnectionState({ variant: "ready" });
			setOffer(peerConnectionRef.current.localDescription);
		};

		const offer = await peerConnectionRef.current.createOffer();
		await peerConnectionRef.current.setLocalDescription(offer);
		setConnectionState({ variant: "readying" });

		return { variant: "ok" };
	}, []);

	const sendMessage = useCallback(
		(data: T): Result => {
			if (!dataChannelRef.current) {
				return { variant: "error", error: "Data channel not ready." };
			}
			if (dataChannelRef.current.readyState !== "open") {
				return { variant: "error", error: "Data channel not open." };
			}
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			dataChannelRef.current.send(data);
			props.onSendMessage(data);
			return { variant: "ok" };
		},
		[props]
	);

	useEffect(() => {
		initializeConnection();
		if (props.isOfferCreator) {
			createOffer().then((result) => {
				if (result.variant === "error") {
					setConnectionState(result);
				}
			});
		}

		return () => {
			closeConnection();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [props.localOnly, props.isOfferCreator, resetCount]);

	return {
		connectionState,
		offer,
		answer,
		setRemoteDescription,
		sendMessage,
		resetConnection: () => setResetCount((x) => x + 1),
	};
};

export default useRTC;
