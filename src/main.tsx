import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import App from "./App";
import Host from "./routes/Host";
import Client from "./routes/Client";

createRoot(document.getElementById("root")!).render(
	<BrowserRouter>
		<Routes>
			<Route path="/" element={<App />} />
			<Route path="/host" element={<Host />} />
			<Route path="/client" element={<Client />} />
		</Routes>
	</BrowserRouter>
);
