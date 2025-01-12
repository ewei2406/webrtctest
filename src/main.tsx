import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import App from "./App.tsx";
import Sender from "./routes/Sender.tsx";
import Receiver from "./routes/Receiver.tsx";
import Host from "./routes/Host.tsx";
import Client from "./routes/Client.tsx";

createRoot(document.getElementById("root")!).render(
	<BrowserRouter>
		<Routes>
			<Route path="/" element={<App />} />
			<Route path="/host" element={<Host />} />
			<Route path="/client" element={<Client />} />
			<Route path="/send" element={<Sender />} />
			<Route path="/recv" element={<Receiver />} />
		</Routes>
	</BrowserRouter>
);
