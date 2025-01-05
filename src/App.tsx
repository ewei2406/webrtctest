import { NavLink } from "react-router";

const App = () => {
	return (
		<>
			<h1>WebRTC Test</h1>
			<NavLink to="/send">Sender</NavLink>
			<br />
			<NavLink to="/recv">Receiver</NavLink>
		</>
	);
};

export default App;
