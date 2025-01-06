export type Result<V> =
	| { variant: "ok"; value: V }
	| { variant: "error"; error: string };
