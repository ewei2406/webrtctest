import { NavLink } from "react-router";
import "./util/getMic";

const App = () => {
	return (
		<>
			<h1>WebRTC Test</h1>
			<NavLink to="/host">Host</NavLink>
			<br />
			<NavLink to="/client">Client</NavLink>
		</>
	);
};

export default App;
