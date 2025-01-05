import { useEffect, useState } from "react";
import { NavLink } from "react-router";
import QRCode from "qrcode";

const Receiver = () => {
	const [id] = useState(crypto.randomUUID());
	const [qrData, setQrData] = useState("");

	useEffect(() => {
		QRCode.toDataURL(id, { margin: 0 })
			.then(setQrData)
			.catch((err) => {
				console.error(err);
			});
	}, [id]);

	return (
		<>
			<NavLink to="/">Home</NavLink>
			<h1>Receiver</h1>
			My QR code:
			<div style={{ border: "1px solid black" }}>
				<img src={qrData} alt="" style={{ display: "block" }} />
			</div>
		</>
	);
};

export default Receiver;
