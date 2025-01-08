export type Result<T = undefined> = T extends undefined
	? { variant: "ok" } | { variant: "error"; error: string }
	: { variant: "ok"; value: T } | { variant: "error"; error: string };
