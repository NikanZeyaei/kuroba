/**
 * Raw wire format of a 4chan post as documented in `4chan-API/pages/Threads.md`.
 */
export interface RawPost {
	/** Numeric post ID */
	no: number;
	/** For replies: thread ID being replied to. For OP: zero */
	resto: number;
	/** OP only: 1 if stickied to top of board */
	sticky?: 0 | 1;
	/** OP only: 1 if closed to replies */
	closed?: 0 | 1;
	/** MM/DD/YY(Day)HH:MM(:SS) timestamp in EST/EDT timezone */
	now: string;
	/** UNIX timestamp of post creation */
	time: number;
	/** Name user posted with (defaults to "Anonymous") */
	name: string;
	/** User's tripcode in format: !tripcode or !!securetripcode */
	trip?: string;
	/** Poster's 8-character ID */
	id?: string;
	/** Capcode identifier: mod, admin, admin_highlight, manager, developer, founder */
	capcode?: string;
	/** ISO 3166-1 alpha-2 country code or XX if unknown */
	country?: string;
	/** Poster's country name */
	country_name?: string;
	/** Poster's board flag code */
	board_flag?: string;
	/** Poster's board flag name */
	flag_name?: string;
	/** OP only: subject text */
	sub?: string;
	/** HTML-escaped post comment */
	com?: string;
	/** Attachment upload timestamp + microtime */
	tim?: number;
	/** Filename as it appeared on poster's device */
	filename?: string;
	/** Attachment file extension (.jpg, .png, .gif, .pdf, .swf, .webm) */
	ext?: string;
	/** File size in bytes */
	fsize?: number;
	/** 24-character packed base64 MD5 hash of uploaded file */
	md5?: string;
	/** Image width dimension */
	w?: number;
	/** Image height dimension */
	h?: number;
	/** Thumbnail image width dimension */
	tn_w?: number;
	/** Thumbnail image height dimension */
	tn_h?: number;
	/** 1 if attachment was deleted */
	filedeleted?: 0 | 1;
	/** 1 if attachment is spoilered */
	spoiler?: 0 | 1;
	/** Custom spoiler ID (1-10) for spoilered image */
	custom_spoiler?: number;
	/** OP only: total number of replies to thread */
	replies?: number;
	/** OP only: total number of image replies to thread */
	images?: number;
	/** OP only: 1 if bump limit has been reached */
	bumplimit?: 0 | 1;
	/** OP only: 1 if image limit has been reached */
	imagelimit?: 0 | 1;
	/** OP only (/f/ only): category of .swf upload (Game, Loop, etc.) */
	tag?: string;
	/** OP only: SEO URL slug for thread */
	semantic_url?: string;
	/** Year 4chan pass was bought */
	since4pass?: number;
	/** OP only: number of unique poster IP addresses */
	unique_ips?: number;
	/** 1 if mobile-optimized image exists */
	m_img?: 0 | 1;
	/** OP only: 1 if thread has reached the board archive */
	archived?: 0 | 1;
	/** OP only: UNIX timestamp when the post was archived */
	archived_on?: number;
}

/**
 * Raw wire format returned by `https://a.4cdn.org/[board]/thread/[threadId].json`.
 */
export interface RawThreadResponse {
	posts: RawPost[];
}

/**
 * Raw wire format of an item in `https://a.4cdn.org/[board]/threads.json`.
 */
export interface RawThreadListItem {
	no: number;
	last_modified: number;
	replies: number;
}

/**
 * Raw wire format of a page in `https://a.4cdn.org/[board]/threads.json`.
 */
export interface RawThreadListPage {
	page: number;
	threads: RawThreadListItem[];
}

/**
 * Normalized 4chan post representation with clean camelCase getters.
 * Matches `4chan-API/pages/Threads.md`.
 */
export class Post {
	constructor(readonly raw: RawPost) {}

	/**
	 * The numeric post ID.
	 * @remarks Raw: `no`
	 */
	get id(): number {
		return this.raw.no;
	}

	/**
	 * For replies: the ID of the thread being replied to. For OP: zero.
	 * @remarks Raw: `resto`
	 */
	get resto(): number {
		return this.raw.resto;
	}

	/**
	 * Whether this post is the Original Post (OP) of its thread.
	 */
	get isOp(): boolean {
		return this.raw.resto === 0;
	}

	/**
	 * Whether the thread is pinned to the top of the board (OP only).
	 * @remarks Raw: `sticky` (1 = yes)
	 */
	get isSticky(): boolean | undefined {
		return this.flag(this.raw.sticky);
	}

	/**
	 * Whether the thread is closed to new replies (OP only).
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
	 * The poster's 8-character ID tag.
	 * @remarks Raw: `id`
	 */
	get posterId(): string | undefined {
		return this.raw.id;
	}

	/**
	 * Capcode identifier for administrative/moderator posts (`mod`, `admin`, `developer`, etc.).
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
	 * Poster's board flag code on boards with custom board flags enabled.
	 * @remarks Raw: `board_flag`
	 */
	get boardFlag(): string | undefined {
		return this.raw.board_flag;
	}

	/**
	 * Poster's board flag name on boards with custom board flags enabled.
	 * @remarks Raw: `flag_name`
	 */
	get flagName(): string | undefined {
		return this.raw.flag_name;
	}

	/**
	 * Subject line of the thread (OP only).
	 * @remarks Raw: `sub`
	 */
	get subject(): string | undefined {
		return this.raw.sub;
	}

	/**
	 * Comment text (HTML-escaped).
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
	 * 24-character packed base64 MD5 hash of the uploaded file.
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
	 * Total number of replies in this thread (OP only).
	 * @remarks Raw: `replies`
	 */
	get replies(): number | undefined {
		return this.raw.replies;
	}

	/**
	 * Total number of image replies in this thread (OP only).
	 * @remarks Raw: `images`
	 */
	get images(): number | undefined {
		return this.raw.images;
	}

	/**
	 * Whether the thread has reached its bump limit and will no longer bump (OP only).
	 * @remarks Raw: `bumplimit` (1 = yes)
	 */
	get isBumpLimitReached(): boolean | undefined {
		return this.flag(this.raw.bumplimit);
	}

	/**
	 * Whether the thread has reached its image limit and rejects further uploads (OP only).
	 * @remarks Raw: `imagelimit` (1 = yes)
	 */
	get isImageLimitReached(): boolean | undefined {
		return this.flag(this.raw.imagelimit);
	}

	/**
	 * Category of `.swf` upload on Flash board `/f/` (OP only).
	 * @remarks Raw: `tag`
	 */
	get tag(): string | undefined {
		return this.raw.tag;
	}

	/**
	 * SEO URL slug for the thread (OP only).
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
	 * Number of unique poster IP addresses in the thread (OP only).
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
	 * Whether the thread has reached the board's archive (OP only).
	 * @remarks Raw: `archived` (1 = yes)
	 */
	get isArchived(): boolean | undefined {
		return this.flag(this.raw.archived);
	}

	/**
	 * UNIX timestamp marking when the thread was archived (OP only).
	 * @remarks Raw: `archived_on`
	 */
	get archivedOn(): number | undefined {
		return this.raw.archived_on;
	}

	private flag(val?: 0 | 1): boolean | undefined {
		return val !== undefined ? val === 1 : undefined;
	}
}

/**
 * Normalized 4chan Thread model aggregating the OP and all reply posts.
 */
export class Thread {
	/** Original Post of the thread */
	readonly op: Post;
	/** Array of reply posts in the thread */
	readonly replies: Post[];

	constructor(
		readonly posts: Post[],
		readonly raw: RawThreadResponse,
	) {
		const first = posts[0];
		if (!first) {
			throw new Error("Thread posts array must contain at least an OP post.");
		}
		this.op = first;
		this.replies = posts.slice(1);
	}

	/** Numeric ID of the thread (equal to OP post ID) */
	get id(): number {
		return this.op.id;
	}

	/** Subject of the thread (from OP) */
	get subject(): string | undefined {
		return this.op.subject;
	}

	/** Comment body of the thread OP */
	get comment(): string | undefined {
		return this.op.comment;
	}

	/** Whether the thread is pinned/stickied */
	get isSticky(): boolean | undefined {
		return this.op.isSticky;
	}

	/** Whether the thread is closed to new replies */
	get isClosed(): boolean | undefined {
		return this.op.isClosed;
	}

	/** Whether the thread has been archived */
	get isArchived(): boolean | undefined {
		return this.op.isArchived;
	}

	/** Total count of posts in this thread (OP + replies) */
	get postCount(): number {
		return this.posts.length;
	}
}

/**
 * Summarized thread entry in `threads.json` thread list.
 * Matches `4chan-API/pages/Threadlist.md`.
 */
export class ThreadListItem {
	constructor(readonly raw: RawThreadListItem) {}

	/** OP number of the thread */
	get id(): number {
		return this.raw.no;
	}

	/** UNIX timestamp marking the last time the thread was modified */
	get lastModified(): number {
		return this.raw.last_modified;
	}

	/** Count of replies in the thread */
	get replies(): number {
		return this.raw.replies;
	}
}

/**
 * Page grouping in `threads.json` containing thread summaries.
 */
export class ThreadListPage {
	constructor(readonly raw: RawThreadListPage) {}

	/** The index page number (1-15) */
	get page(): number {
		return this.raw.page;
	}

	/** Summarized thread entries on this page */
	get threads(): ThreadListItem[] {
		return this.raw.threads.map((item) => new ThreadListItem(item));
	}
}
