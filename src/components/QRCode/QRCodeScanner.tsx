import { useEffect } from "react";
import useQRScanner from "../../hooks/useQRScanner";

type QRCodeScannerProps = {
	width: number | string;
	onScan: (decodedText: string) => void;
	disabled?: boolean;
};

const QRCodeScanner = (props: QRCodeScannerProps) => {
	const { scannerState, startScanner, stopScanner } = useQRScanner({
		elementId: "reader",
		onScan: (decodedText) => {
			props.onScan(decodedText);
			stopScanner();
		},
	});

	useEffect(() => {
		if (props.disabled) stopScanner();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [props.disabled]);

	return (
		<div>
			<p>Scanner state: {scannerState.variant}</p>
			<p style={{ color: "red" }}>
				{scannerState.variant === "error" && scannerState.error}
			</p>
			{scannerState.variant === "stopped" && (
				<button onClick={startScanner}>Start Scanner</button>
			)}
			{scannerState.variant === "ready" && (
				<button onClick={stopScanner}>Stop Scanner</button>
			)}
			<div style={{ width: props.width }}>
				<div id="reader" style={{ position: "relative" }}></div>
			</div>
		</div>
	);
};

export default QRCodeScanner;
