import { ChangeEvent, KeyboardEvent, useState } from "react";

const ChatInput = ({ onSubmit }: { onSubmit: (message: string) => void }) => {
	const [chatInput, setChatInput] = useState<string>("");

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		setChatInput(e.target.value);
	};

	const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			submit();
		}
	};

	const submit = () => {
		onSubmit(chatInput);
		setChatInput("");
	};

	return (
		<div>
			<input
				value={chatInput}
				onChange={handleChange}
				onKeyDown={handleKeyDown}
			/>
			<button onClick={submit}>Send</button>
		</div>
	);
};

export default ChatInput;
