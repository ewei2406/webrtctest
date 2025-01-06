import { Html5Qrcode } from "html5-qrcode";
import { useCallback, useState, useEffect, useRef } from "react";

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
	elementId: string;
	onScan: (decodedText: string) => void;
};

const useQRScanner = (props: UseQRScannerProps) => {
	const html5QrCodeRef = useRef<Html5Qrcode>();

	useEffect(() => {
		html5QrCodeRef.current = new Html5Qrcode(props.elementId);

		return () => {
			// Stop the scanner if it has started
			html5QrCodeRef.current?.stop();

			// Cleanup the instance
			html5QrCodeRef.current?.clear();
		};
	}, [props.elementId]);

	const [scannerState, setScannerState] = useState<ScannerState>({
		variant: "loading",
	});

	const startScanner = useCallback(async () => {
		if (!html5QrCodeRef.current) {
			setScannerState({
				variant: "error",
				error: "Scanner not ready.",
			});
			return;
		}

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
				await html5QrCodeRef.current.stop();
			}

			await html5QrCodeRef.current.start(
				cameraId,
				{ fps: 10 },
				props.onScan,
				() => {}
			);
			setScannerState({ variant: "ready" });
		} catch (err) {
			setScannerState({ variant: "error", error: err as string });
		}
	}, [props.onScan, scannerState]);

	return { scannerState, startScanner };
};

export default useQRScanner;
