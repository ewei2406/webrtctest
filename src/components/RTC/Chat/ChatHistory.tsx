import { Property } from "csstype";
import { Message } from "../../../hooks/useChat";
import { getHHMM } from "../../../util/date";
import { getColor } from "../../../util/uuid";

const ChatHistoryRow = (props: {
	message: string;
	date: Date;
	author: string;
	color: string;
	bubbleColor: string;
	textColor: string;
	alignment: Property.AlignItems;
	showIcon?: boolean;
}) => {
	return (
		<div style={{ display: "flex", flexGrow: 1, fontFamily: "sans-serif" }}>
			{props.showIcon && (
				<div
					style={{
						backgroundColor: props.color,
						textAlign: "center",
						verticalAlign: "middle",
						lineHeight: "30px",
						borderRadius: 30,
						width: 30,
						height: 30,
						fontWeight: 800,
						fontSize: "0.8em",
						color: "white",
						marginTop: "1.1em",
						filter: "opacity(0.5)",
					}}
				>
					{props.author.slice(0, 2)}
				</div>
			)}
			<div
				style={{
					flexGrow: 1,
					display: "flex",
					flexDirection: "column",
					alignItems: props.alignment,
					marginLeft: "0.4em",
				}}
			>
				<div
					style={{
						color: props.color,
						fontSize: "0.7em",
						padding: "2px 7px",
					}}
				>
					{props.author}
				</div>
				<div>
					<div
						style={{
							backgroundColor: props.bubbleColor,
							color: props.textColor,
							borderRadius: 20,
							display: "inline-block",
							padding: "5px 10px",
							fontSize: "0.9em",
						}}
					>
						{props.message}
					</div>
				</div>
			</div>
			<div
				style={{
					width: 40,
					color: "gray",
					textAlign: "end",
					paddingTop: 10,
					fontSize: "0.7em",
				}}
			>
				{getHHMM(props.date)}
			</div>
		</div>
	);
};

const ChatHistory = (props: {
	authorId: string;
	messages: Message[];
	nicknameMap: Map<string, string>;
}) => {
	return (
		<div
			style={{
				margin: 10,
				display: "flex",
				flexDirection: "column",
			}}
		>
			{props.messages.map((msg) => (
				<ChatHistoryRow
					key={msg.id}
					message={msg.data}
					date={msg.date}
					author={
						msg.authorId === props.authorId
							? "Me"
							: props.nicknameMap.get(msg.authorId) || "Unknown"
					}
					color={getColor(msg.authorId)}
					alignment={
						msg.authorId === props.authorId ? "flex-end" : "flex-start"
					}
					bubbleColor={msg.authorId === props.authorId ? "#007AFF" : "#eee"}
					textColor={msg.authorId === props.authorId ? "white" : "black"}
					showIcon={msg.authorId !== props.authorId}
				/>
			))}
		</div>
	);
};

export default ChatHistory;
