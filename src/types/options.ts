export interface KurobaClientOptions {
	baseUrl?: string | undefined;
	mediaBaseUrl?: string | undefined;
	staticBaseUrl?: string | undefined;
	fetch?: typeof fetch | undefined;
	headers?: HeadersInit | undefined;
	timeoutMs?: number | undefined;
}

export interface RequestOptions {
	headers?: HeadersInit | undefined;
	signal?: AbortSignal | undefined;
	timeoutMs?: number | undefined;
	ifModifiedSince?: Date | undefined;
}
