/**
 * Base error class for all errors originating from the Kuroba client.
 */
export class KurobaError extends Error {
	override readonly name: string = "KurobaError";

	constructor(message: string, options?: ErrorOptions) {
		super(message, options);
		Object.setPrototypeOf(this, new.target.prototype);
	}
}

/**
 * Error raised when the 4chan API returns a non-2xx HTTP status code.
 */
export class KurobaHttpError extends KurobaError {
	override readonly name: string = "KurobaHttpError";
	readonly status: number;
	readonly statusText: string;
	readonly url: string;
	readonly headers: Headers;
	readonly responseBody?: string | undefined;

	constructor(
		message: string,
		params: {
			status: number;
			statusText: string;
			url: string;
			headers: Headers;
			responseBody?: string | undefined;
			cause?: unknown;
		},
	) {
		super(
			message,
			params.cause !== undefined ? { cause: params.cause } : undefined,
		);
		this.status = params.status;
		this.statusText = params.statusText;
		this.url = params.url;
		this.headers = params.headers;
		this.responseBody = params.responseBody;
	}
}

/**
 * Specialized HTTP error raised when the client receives HTTP 429 Too Many Requests.
 * Rule: 4chan API permits no more than 1 request per second.
 */
export class KurobaRateLimitError extends KurobaHttpError {
	override readonly name: string = "KurobaRateLimitError";

	constructor(params: {
		status?: number | undefined;
		statusText?: string | undefined;
		url: string;
		headers: Headers;
		responseBody?: string | undefined;
		cause?: unknown;
	}) {
		super("4chan API rate limit exceeded (HTTP 429 Too Many Requests).", {
			status: params.status ?? 429,
			statusText: params.statusText ?? "Too Many Requests",
			url: params.url,
			headers: params.headers,
			responseBody: params.responseBody,
			cause: params.cause,
		});
	}
}

/**
 * Error raised when the API response cannot be parsed as JSON.
 */
export class KurobaParseError extends KurobaError {
	override readonly name: string = "KurobaParseError";
	readonly url: string;
	readonly rawText?: string | undefined;

	constructor(
		message: string,
		params: {
			url: string;
			rawText?: string | undefined;
			cause?: unknown;
		},
	) {
		super(
			message,
			params.cause !== undefined ? { cause: params.cause } : undefined,
		);
		this.url = params.url;
		this.rawText = params.rawText;
	}
}
