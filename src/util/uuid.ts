export const getUUID = () => {
	return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
		const r = (Math.random() * 16) | 0;
		const v = c === "x" ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
};

export const getColor = (uuid: string) => {
	const hash = uuid.split("-").join("");
	const color = `#${hash.slice(0, 6)}`;
	return color;
};
