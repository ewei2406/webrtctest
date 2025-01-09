import { IDetectedBarcode, Scanner } from "@yudiel/react-qr-scanner";

const QRCodeScanner = () => {
	const handleScan = (codes: IDetectedBarcode[]) => {
		console.log(codes);
	};

	return (
		<div>
			<Scanner onScan={handleScan} />
		</div>
	);
};

export default QRCodeScanner;
