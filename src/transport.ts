import {
	KurobaHttpError,
	KurobaParseError,
	KurobaRateLimitError,
} from "./errors.js";
import type { RequestOptions } from "./types/options.js";

/**
 * Transport-level options for executing HTTP requests against 4chan APIs.
 */
export interface TransportConfig {
	baseUrl: string;
	fetch: typeof fetch;
	defaultHeaders?: HeadersInit | undefined;
	defaultTimeoutMs?: number | undefined;
}

export type TimeoutHandle = Parameters<typeof clearTimeout>[0];

/**
 * Successful or 304 response container from the transport.
 */
export interface TransportResult<T> {
	data: T | null;
	status: number;
	statusText: string;
	headers: Headers;
	notModified: boolean;
}

/**
 * Resolves a full URL given a base URL and an endpoint path.
 */
export function buildUrl(baseUrl: string, path: string): string {
	const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
	const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
	return new URL(normalizedPath, normalizedBase).toString();
}

/**
 * Executes an HTTP GET request against the 4chan API.
 */
export async function executeGet<T>(
	config: TransportConfig,
	path: string,
	options?: RequestOptions,
): Promise<TransportResult<T>> {
	const targetUrl = buildUrl(config.baseUrl, path);

	// Assemble headers
	const headers = new Headers(config.defaultHeaders);
	if (options?.headers) {
		const requestHeaders = new Headers(options.headers);
		for (const [key, value] of requestHeaders.entries()) {
			headers.set(key, value);
		}
	}

	// Format If-Modified-Since if provided
	if (options?.ifModifiedSince !== undefined) {
		headers.set("If-Modified-Since", options.ifModifiedSince.toUTCString());
	}

	// Timeout and abort controller setup
	const timeoutMs = options?.timeoutMs ?? config.defaultTimeoutMs;
	const controller = new AbortController();
	let timeoutId: TimeoutHandle | undefined;

	if (timeoutMs !== undefined && timeoutMs > 0) {
		timeoutId = setTimeout(() => {
			controller.abort(
				new DOMException(
					`Request timed out after ${timeoutMs}ms`,
					"TimeoutError",
				),
			);
		}, timeoutMs);
	}

	const callerSignal = options?.signal;
	const onCallerAbort = () => {
		controller.abort(callerSignal?.reason);
	};

	if (callerSignal) {
		if (callerSignal.aborted) {
			controller.abort(callerSignal.reason);
		} else {
			callerSignal.addEventListener("abort", onCallerAbort, { once: true });
		}
	}

	try {
		const fetchFn = config.fetch;
		const response = await fetchFn(targetUrl, {
			method: "GET",
			headers,
			signal: controller.signal,
		});

		// 304 Not Modified
		if (response.status === 304) {
			return {
				data: null,
				status: 304,
				statusText: response.statusText,
				headers: response.headers,
				notModified: true,
			};
		}

		// 429 Too Many Requests
		if (response.status === 429) {
			const bodyText = await response.text().catch(() => undefined);
			throw new KurobaRateLimitError({
				status: response.status,
				statusText: response.statusText,
				url: targetUrl,
				headers: response.headers,
				responseBody: bodyText,
			});
		}

		// Other non-2xx status codes
		if (!response.ok) {
			const bodyText = await response.text().catch(() => undefined);
			throw new KurobaHttpError(
				`HTTP ${response.status} ${response.statusText} for ${targetUrl}`,
				{
					status: response.status,
					statusText: response.statusText,
					url: targetUrl,
					headers: response.headers,
					responseBody: bodyText,
				},
			);
		}

		// Parse 200 OK body
		const rawText = await response.text();
		try {
			const data = JSON.parse(rawText) as T;
			return {
				data,
				status: response.status,
				statusText: response.statusText,
				headers: response.headers,
				notModified: false,
			};
		} catch (cause) {
			throw new KurobaParseError(
				`Failed to parse JSON response from ${targetUrl}`,
				{
					url: targetUrl,
					rawText,
					cause,
				},
			);
		}
	} finally {
		clearTimeout(timeoutId);
		if (callerSignal) {
			callerSignal.removeEventListener("abort", onCallerAbort);
		}
	}
}
