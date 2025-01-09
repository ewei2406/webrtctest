import { useState } from "react";
import { getUUID } from "../util/uuid";

const ID_KEY = "id";

const useId = () => {
	const [id, setId] = useState(() => {
		const localId = localStorage.getItem(ID_KEY);
		if (localId) {
			return localId;
		}
		const newId = getUUID();
		localStorage.setItem(ID_KEY, newId);
		return newId;
	});

	const resetId = () => {
		const newId = getUUID();
		setId(newId);
		localStorage.setItem(ID_KEY, newId);
	};

	return { id, resetId };
};

export default useId;
