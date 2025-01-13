export const getHHMM = (date: Date) => {
	const hours = date.getHours();
	const minutes = date.getMinutes();
	return `${hours}:${minutes.toString().padStart(2, "0")}`;
};