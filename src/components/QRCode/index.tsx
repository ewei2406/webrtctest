import { QRCodeSVG } from "qrcode.react";

const QRCode = (props: { data: string }) => {
	return (
		<div style={{ margin: 10 }}>
			<QRCodeSVG value={props.data} />
		</div>
	);
};

export default QRCode;
