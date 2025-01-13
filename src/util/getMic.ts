import { Result } from "./result";

const getMic = async (): Promise<Result> => {
	if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
		return {
			variant: "error",
			error: "getUserMedia is not supported.",
		};
	}

	try {
		await navigator.mediaDevices.getUserMedia({ audio: true });
		return { variant: "ok" };
	} catch (error) {
		return {
			variant: "error",
			error: `Failed to get microphone permission: ${(error as Error).message}`,
		};
	}
};

export default getMic;
