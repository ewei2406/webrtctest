import { NavLink } from "react-router";

const App = () => {
	return (
		<>
			<h1>WebRTC Test</h1>

			<h3>Peer-to-peer</h3>
			<NavLink to="/send">Sender</NavLink>
			<br />
			<NavLink to="/recv">Receiver</NavLink>

			<h3>3-peer</h3>
			<NavLink to="/host">Host</NavLink>
			<br />
			<NavLink to="/client">Client</NavLink>
		</>
	);
};

export default App;
