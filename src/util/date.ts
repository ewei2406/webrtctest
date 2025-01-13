export const getHHMM = (date: Date | string) => {
	if (typeof date === "string") {
		date = new Date(date);
	}

	const hours = date.getHours();
	const minutes = date.getMinutes();
	return `${hours}:${minutes.toString().padStart(2, "0")}`;
};
