import useQRScanner from "../../hooks/useQRScanner";

const QRCodeScanner = () => {
	const { scannerState, startScanner, stopScanner } = useQRScanner({
		elementId: "reader",
		onScan: (decodedText) => {
			console.log(decodedText);
		},
	});

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
			<div style={{ width: "50%" }}>
				<div id="reader" style={{ width: 600 }}></div>
			</div>
		</div>
	);
};

export default QRCodeScanner;
