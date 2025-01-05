import { Html5Qrcode } from "html5-qrcode";
import { useCallback, useState, useEffect } from "react";

const html5QrCode = new Html5Qrcode("reader");

type ScannerState =
	| {
			variant: "loading";
	  }
	| {
			variant: "ready";
	  }
	| {
			variant: "error";
			error: string;
	  };

type UseQRScannerProps = {
	onScan: (decodedText: string) => void;
};

const useQRScanner = (props: UseQRScannerProps) => {
	useEffect(() => {
		return () => {
			// Stop the scanner if it has started
			html5QrCode.stop();
		};
	}, []);

	const [scannerState, setScannerState] = useState<ScannerState>({
		variant: "loading",
	});

	const startScanner = useCallback(async () => {
		try {
			const devices = await Html5Qrcode.getCameras();
			if (!devices || !devices.length) {
				setScannerState({
					variant: "error",
					error: "No video devices found.",
				});
				return;
			}
			const cameraId = devices[0].id;

			// Restart the scanner if it has started
			if (scannerState.variant === "ready") {
				await html5QrCode.stop();
			}

			await html5QrCode.start(cameraId, { fps: 10 }, props.onScan, () => {});
			setScannerState({ variant: "ready" });
		} catch (err) {
			setScannerState({ variant: "error", error: err as string });
		}
	}, [props.onScan, scannerState]);

	return { scannerState, startScanner };
};

export default useQRScanner;
