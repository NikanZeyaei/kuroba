/**
 * Raw wire format of a preview reply post in `catalog.json`'s `last_replies`.
 * Matches `4chan-API/pages/Catalog.md`.
 */
export interface RawCatalogReply {
	no: number;
	now: string;
	time: number;
	name: string;
	com?: string;
	resto: number;
	filename?: string;
	ext?: string;
	w?: number;
	h?: number;
	tn_w?: number;
	tn_h?: number;
	tim?: number;
	md5?: string;
	fsize?: number;
	capcode?: string;
	trip?: string;
	id?: string;
	country?: string;
	country_name?: string;
	m_img?: 0 | 1;
}

/**
 * Raw wire format of an OP thread object in `catalog.json`.
 * Matches `4chan-API/pages/Catalog.md`.
 */
export interface RawCatalogThread {
	no: number;
	resto: number;
	sticky?: 0 | 1;
	closed?: 0 | 1;
	now: string;
	time: number;
	name: string;
	trip?: string;
	id?: string;
	capcode?: string;
	country?: string;
	country_name?: string;
	sub?: string;
	com?: string;
	tim?: number;
	filename?: string;
	ext?: string;
	fsize?: number;
	md5?: string;
	w?: number;
	h?: number;
	tn_w?: number;
	tn_h?: number;
	filedeleted?: 0 | 1;
	spoiler?: 0 | 1;
	custom_spoiler?: number;
	omitted_posts?: number;
	omitted_images?: number;
	replies: number;
	images: number;
	bumplimit?: 0 | 1;
	imagelimit?: 0 | 1;
	last_modified?: number;
	tag?: string;
	semantic_url?: string;
	since4pass?: number;
	unique_ips?: number;
	m_img?: 0 | 1;
	last_replies?: RawCatalogReply[];
}

/**
 * Raw wire format of a catalog page object containing threads.
 * Matches `4chan-API/pages/Catalog.md`.
 */
export interface RawCatalogPage {
	page: number;
	threads: RawCatalogThread[];
}

/**
 * Normalized preview reply model in a catalog thread.
 */
export class CatalogReply {
	constructor(readonly raw: RawCatalogReply) {}

	/**
	 * Numeric post ID.
	 * @remarks Raw: `no`
	 */
	get id(): number {
		return this.raw.no;
	}

	/**
	 * Formatted date string (MM/DD/YY(Day)HH:MM(:SS) in EST/EDT timezone).
	 * @remarks Raw: `now`
	 */
	get now(): string {
		return this.raw.now;
	}

	/**
	 * UNIX timestamp marking when the post was created.
	 * @remarks Raw: `time`
	 */
	get time(): number {
		return this.raw.time;
	}

	/**
	 * Name the user posted with (defaults to "Anonymous").
	 * @remarks Raw: `name`
	 */
	get name(): string {
		return this.raw.name;
	}

	/**
	 * HTML-escaped comment text.
	 * @remarks Raw: `com`
	 */
	get comment(): string | undefined {
		return this.raw.com;
	}

	/**
	 * ID of the thread this post is replying to.
	 * @remarks Raw: `resto`
	 */
	get resto(): number {
		return this.raw.resto;
	}

	/**
	 * Attachment filename as it appeared on the poster's device.
	 * @remarks Raw: `filename`
	 */
	get filename(): string | undefined {
		return this.raw.filename;
	}

	/**
	 * Attachment file extension (`.jpg`, `.png`, `.gif`, `.pdf`, `.swf`, `.webm`).
	 * @remarks Raw: `ext`
	 */
	get extension(): string | undefined {
		return this.raw.ext;
	}

	/**
	 * Attachment image width in pixels.
	 * @remarks Raw: `w`
	 */
	get width(): number | undefined {
		return this.raw.w;
	}

	/**
	 * Attachment image height in pixels.
	 * @remarks Raw: `h`
	 */
	get height(): number | undefined {
		return this.raw.h;
	}

	/**
	 * Thumbnail width in pixels.
	 * @remarks Raw: `tn_w`
	 */
	get thumbnailWidth(): number | undefined {
		return this.raw.tn_w;
	}

	/**
	 * Thumbnail height in pixels.
	 * @remarks Raw: `tn_h`
	 */
	get thumbnailHeight(): number | undefined {
		return this.raw.tn_h;
	}

	/**
	 * Upload timestamp + microtime for attachment URL construction.
	 * @remarks Raw: `tim`
	 */
	get tim(): number | undefined {
		return this.raw.tim;
	}

	/**
	 * 24-character packed base64 MD5 hash of uploaded file.
	 * @remarks Raw: `md5`
	 */
	get md5(): string | undefined {
		return this.raw.md5;
	}

	/**
	 * Attachment file size in bytes.
	 * @remarks Raw: `fsize`
	 */
	get filesize(): number | undefined {
		return this.raw.fsize;
	}

	/**
	 * Capcode identifier for administrative/moderator posts (`mod`, `admin`, etc.).
	 * @remarks Raw: `capcode`
	 */
	get capcode(): string | undefined {
		return this.raw.capcode;
	}

	/**
	 * User's tripcode in format: `!tripcode` or `!!securetripcode`.
	 * @remarks Raw: `trip`
	 */
	get tripcode(): string | undefined {
		return this.raw.trip;
	}

	/**
	 * Poster's 8-character ID tag.
	 * @remarks Raw: `id`
	 */
	get posterId(): string | undefined {
		return this.raw.id;
	}

	/**
	 * Poster's ISO 3166-1 alpha-2 country code (or `XX` if unknown).
	 * @remarks Raw: `country`
	 */
	get country(): string | undefined {
		return this.raw.country;
	}

	/**
	 * Poster's country name.
	 * @remarks Raw: `country_name`
	 */
	get countryName(): string | undefined {
		return this.raw.country_name;
	}

	/**
	 * Whether a mobile-optimized version of the image attachment exists.
	 * @remarks Raw: `m_img` (1 = yes)
	 */
	get hasMobileOptimizedImage(): boolean | undefined {
		return this.raw.m_img !== undefined ? this.raw.m_img === 1 : undefined;
	}
}

/**
 * Normalized OP thread in a catalog page with lazy computed getters.
 * Matches `4chan-API/pages/Catalog.md`.
 */
export class CatalogThread {
	constructor(readonly raw: RawCatalogThread) {}

	/**
	 * Numeric post ID of the thread OP.
	 * @remarks Raw: `no`
	 */
	get id(): number {
		return this.raw.no;
	}

	/**
	 * For replies: thread ID being replied to. For OP: zero.
	 * @remarks Raw: `resto`
	 */
	get resto(): number {
		return this.raw.resto;
	}

	/**
	 * Whether the thread is pinned to the top of the board.
	 * @remarks Raw: `sticky` (1 = yes)
	 */
	get isSticky(): boolean | undefined {
		return this.flag(this.raw.sticky);
	}

	/**
	 * Whether the thread is closed to new replies.
	 * @remarks Raw: `closed` (1 = yes)
	 */
	get isClosed(): boolean | undefined {
		return this.flag(this.raw.closed);
	}

	/**
	 * Formatted date string (MM/DD/YY(Day)HH:MM(:SS) in EST/EDT timezone).
	 * @remarks Raw: `now`
	 */
	get now(): string {
		return this.raw.now;
	}

	/**
	 * UNIX timestamp marking when the post was created.
	 * @remarks Raw: `time`
	 */
	get time(): number {
		return this.raw.time;
	}

	/**
	 * Name the user posted with (defaults to "Anonymous").
	 * @remarks Raw: `name`
	 */
	get name(): string {
		return this.raw.name;
	}

	/**
	 * User's tripcode in format: `!tripcode` or `!!securetripcode`.
	 * @remarks Raw: `trip`
	 */
	get tripcode(): string | undefined {
		return this.raw.trip;
	}

	/**
	 * Poster's 8-character ID tag.
	 * @remarks Raw: `id`
	 */
	get posterId(): string | undefined {
		return this.raw.id;
	}

	/**
	 * Capcode identifier for administrative/moderator posts (`mod`, `admin`, etc.).
	 * @remarks Raw: `capcode`
	 */
	get capcode(): string | undefined {
		return this.raw.capcode;
	}

	/**
	 * Poster's ISO 3166-1 alpha-2 country code (or `XX` if unknown).
	 * @remarks Raw: `country`
	 */
	get country(): string | undefined {
		return this.raw.country;
	}

	/**
	 * Poster's country name.
	 * @remarks Raw: `country_name`
	 */
	get countryName(): string | undefined {
		return this.raw.country_name;
	}

	/**
	 * Subject line of the thread.
	 * @remarks Raw: `sub`
	 */
	get subject(): string | undefined {
		return this.raw.sub;
	}

	/**
	 * HTML-escaped comment text.
	 * @remarks Raw: `com`
	 */
	get comment(): string | undefined {
		return this.raw.com;
	}

	/**
	 * Upload timestamp + microtime used for attachment filename on `i.4cdn.org`.
	 * @remarks Raw: `tim`
	 */
	get tim(): number | undefined {
		return this.raw.tim;
	}

	/**
	 * Attachment filename as it appeared on the poster's device.
	 * @remarks Raw: `filename`
	 */
	get filename(): string | undefined {
		return this.raw.filename;
	}

	/**
	 * Attachment file extension (`.jpg`, `.png`, `.gif`, `.pdf`, `.swf`, `.webm`).
	 * @remarks Raw: `ext`
	 */
	get extension(): string | undefined {
		return this.raw.ext;
	}

	/**
	 * Attachment file size in bytes.
	 * @remarks Raw: `fsize`
	 */
	get filesize(): number | undefined {
		return this.raw.fsize;
	}

	/**
	 * 24-character packed base64 MD5 hash of uploaded file.
	 * @remarks Raw: `md5`
	 */
	get md5(): string | undefined {
		return this.raw.md5;
	}

	/**
	 * Image width dimension in pixels.
	 * @remarks Raw: `w`
	 */
	get width(): number | undefined {
		return this.raw.w;
	}

	/**
	 * Image height dimension in pixels.
	 * @remarks Raw: `h`
	 */
	get height(): number | undefined {
		return this.raw.h;
	}

	/**
	 * Thumbnail width dimension in pixels.
	 * @remarks Raw: `tn_w`
	 */
	get thumbnailWidth(): number | undefined {
		return this.raw.tn_w;
	}

	/**
	 * Thumbnail height dimension in pixels.
	 * @remarks Raw: `tn_h`
	 */
	get thumbnailHeight(): number | undefined {
		return this.raw.tn_h;
	}

	/**
	 * Whether the attachment has been deleted from the post.
	 * @remarks Raw: `filedeleted` (1 = yes)
	 */
	get isFileDeleted(): boolean | undefined {
		return this.flag(this.raw.filedeleted);
	}

	/**
	 * Whether the attachment is spoilered.
	 * @remarks Raw: `spoiler` (1 = yes)
	 */
	get hasSpoiler(): boolean | undefined {
		return this.flag(this.raw.spoiler);
	}

	/**
	 * Custom spoiler ID (1-10) for spoilered images on boards with custom spoilers.
	 * @remarks Raw: `custom_spoiler`
	 */
	get customSpoiler(): number | undefined {
		return this.raw.custom_spoiler;
	}

	/**
	 * Number of replies minus the number of previewed replies.
	 * @remarks Raw: `omitted_posts`
	 */
	get omittedPosts(): number | undefined {
		return this.raw.omitted_posts;
	}

	/**
	 * Number of image replies minus the number of previewed image replies.
	 * @remarks Raw: `omitted_images`
	 */
	get omittedImages(): number | undefined {
		return this.raw.omitted_images;
	}

	/**
	 * Total number of replies in this thread.
	 * @remarks Raw: `replies`
	 */
	get replies(): number {
		return this.raw.replies;
	}

	/**
	 * Total number of image replies in this thread.
	 * @remarks Raw: `images`
	 */
	get images(): number {
		return this.raw.images;
	}

	/**
	 * Whether the thread has reached its bump limit and will no longer bump.
	 * @remarks Raw: `bumplimit` (1 = yes)
	 */
	get isBumpLimitReached(): boolean | undefined {
		return this.flag(this.raw.bumplimit);
	}

	/**
	 * Whether the thread has reached its image limit and rejects further uploads.
	 * @remarks Raw: `imagelimit` (1 = yes)
	 */
	get isImageLimitReached(): boolean | undefined {
		return this.flag(this.raw.imagelimit);
	}

	/**
	 * UNIX timestamp marking the last time the thread was modified.
	 * @remarks Raw: `last_modified`
	 */
	get lastModified(): number | undefined {
		return this.raw.last_modified;
	}

	/**
	 * Category of `.swf` upload on Flash board `/f/`.
	 * @remarks Raw: `tag`
	 */
	get tag(): string | undefined {
		return this.raw.tag;
	}

	/**
	 * SEO URL slug for the thread.
	 * @remarks Raw: `semantic_url`
	 */
	get semanticUrl(): string | undefined {
		return this.raw.semantic_url;
	}

	/**
	 * Year 4chan pass was bought (if poster entered 'since4pass' in options).
	 * @remarks Raw: `since4pass`
	 */
	get since4Pass(): number | undefined {
		return this.raw.since4pass;
	}

	/**
	 * Number of unique poster IP addresses in the thread.
	 * @remarks Raw: `unique_ips`
	 */
	get uniqueIps(): number | undefined {
		return this.raw.unique_ips;
	}

	/**
	 * Whether a mobile-optimized version of the image attachment exists.
	 * @remarks Raw: `m_img` (1 = yes)
	 */
	get hasMobileOptimizedImage(): boolean | undefined {
		return this.flag(this.raw.m_img);
	}

	/**
	 * Array of most recent preview replies to this thread in the catalog.
	 * @remarks Raw: `last_replies`
	 */
	get lastReplies(): CatalogReply[] {
		return this.raw.last_replies?.map((reply) => new CatalogReply(reply)) ?? [];
	}

	private flag(val?: 0 | 1): boolean | undefined {
		return val !== undefined ? val === 1 : undefined;
	}
}

/**
 * Normalized catalog page containing threads.
 * Matches `4chan-API/pages/Catalog.md`.
 */
export class CatalogPage {
	constructor(readonly raw: RawCatalogPage) {}

	/**
	 * Catalog page number (1-indexed).
	 * @remarks Raw: `page`
	 */
	get page(): number {
		return this.raw.page;
	}

	/**
	 * Array of threads located on this catalog page.
	 * @remarks Raw: `threads`
	 */
	get threads(): CatalogThread[] {
		return this.raw.threads.map((thread) => new CatalogThread(thread));
	}
}
