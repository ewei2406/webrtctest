const ChatHistory = (props: { messages: { id: string; data: string }[] }) => {
	return (
		<div>
			{props.messages.map((msg) => (
				<div key={msg.id}>{msg.data}</div>
			))}
		</div>
	);
};

export default ChatHistory;
