import { ChangeEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { ChatAction } from "../../../hooks/useChat";

const ChatInput = ({
	onSubmit,
	disabled,
	setAction,
}: {
	onSubmit: (message: string) => void;
	disabled?: boolean;
	setAction: (action: ChatAction) => void;
}) => {
	const [chatInput, setChatInput] = useState<string>("");
	const prevChatRef = useRef("");

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

	useEffect(() => {
		if (prevChatRef.current !== "" && chatInput === "") {
			setAction("none");
		}
		if (prevChatRef.current === "" && chatInput !== "") {
			setAction("typing");
		}
		prevChatRef.current = chatInput;
	}, [chatInput, setAction]);

	return (
		<div style={{ display: "flex" }}>
			<input
				style={{ flexGrow: 1 }}
				disabled={disabled}
				value={chatInput}
				onChange={handleChange}
				onKeyDown={handleKeyDown}
			/>
			<button onClick={submit}>Send</button>
		</div>
	);
};

export default ChatInput;
