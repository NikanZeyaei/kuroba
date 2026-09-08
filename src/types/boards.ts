export interface BoardCooldowns {
	threads: number;
	replies: number;
	images: number;
}

export type BoardFlags = Record<string, string>;

/**
 * Raw wire format of a board item returned by `https://a.4cdn.org/boards.json`.
 */
export interface RawBoard {
	board: string;
	title: string;
	ws_board: 0 | 1;
	per_page: number;
	pages: number;
	max_filesize: number;
	max_webm_filesize: number;
	max_comment_chars: number;
	max_webm_duration: number;
	bump_limit: number;
	image_limit: number;
	cooldowns: BoardCooldowns;
	meta_description: string;
	spoilers?: 0 | 1;
	custom_spoilers?: number;
	is_archived?: 0 | 1;
	board_flags?: BoardFlags;
	country_flags?: 0 | 1;
	user_ids?: 0 | 1;
	oekaki?: 0 | 1;
	sjis_tags?: 0 | 1;
	code_tags?: 0 | 1;
	math_tags?: 0 | 1;
	text_only?: 0 | 1;
	forced_anon?: 0 | 1;
	webm_audio?: 0 | 1;
	require_subject?: 0 | 1;
	min_image_width?: number;
	min_image_height?: number;
}

/**
 * Raw wire format returned by `https://a.4cdn.org/boards.json`.
 */
export interface RawBoardsResponse {
	boards: RawBoard[];
	troll_flags?: Record<string, string>;
}

/**
 * 4chan board model providing clean camelCase properties computed lazily from raw wire data.
 */
export class Board {
	constructor(readonly raw: RawBoard) {}

	/**
	 * Directory of the board (e.g. "a", "po", "g").
	 * @remarks Raw: `board`
	 */
	get board(): string {
		return this.raw.board;
	}

	/**
	 * Display title of the board.
	 * @remarks Raw: `title`
	 */
	get title(): string {
		return this.raw.title;
	}

	/**
	 * Whether the board is worksafe.
	 * @remarks Raw: `ws_board` (1 = yes, 0 = no)
	 */
	get isWorksafe(): boolean {
		return this.raw.ws_board === 1;
	}

	/**
	 * Number of threads displayed on each index page.
	 * @remarks Raw: `per_page`
	 */
	get perPage(): number {
		return this.raw.per_page;
	}

	/**
	 * Total number of index pages the board contains.
	 * @remarks Raw: `pages`
	 */
	get pages(): number {
		return this.raw.pages;
	}

	/**
	 * Maximum file size for standard attachments in bytes.
	 * @remarks Raw: `max_filesize`
	 */
	get maxFilesize(): number {
		return this.raw.max_filesize;
	}

	/**
	 * Maximum file size for `.webm` video attachments in bytes.
	 * @remarks Raw: `max_webm_filesize`
	 */
	get maxWebmFilesize(): number {
		return this.raw.max_webm_filesize;
	}

	/**
	 * Maximum comment characters allowed per post.
	 * @remarks Raw: `max_comment_chars`
	 */
	get maxCommentChars(): number {
		return this.raw.max_comment_chars;
	}

	/**
	 * Maximum duration for `.webm` video attachments in seconds.
	 * @remarks Raw: `max_webm_duration`
	 */
	get maxWebmDuration(): number {
		return this.raw.max_webm_duration;
	}

	/**
	 * Maximum reply count before a thread stops bumping.
	 * @remarks Raw: `bump_limit`
	 */
	get bumpLimit(): number {
		return this.raw.bump_limit;
	}

	/**
	 * Maximum image replies before further attachments are rejected.
	 * @remarks Raw: `image_limit`
	 */
	get imageLimit(): number {
		return this.raw.image_limit;
	}

	/**
	 * Cooldown limits between posts in seconds.
	 * @remarks Raw: `cooldowns`
	 */
	get cooldowns(): BoardCooldowns {
		return this.raw.cooldowns;
	}

	/**
	 * SEO meta description for the board.
	 * @remarks Raw: `meta_description`
	 */
	get metaDescription(): string {
		return this.raw.meta_description;
	}

	/**
	 * Whether spoilers are enabled.
	 * @remarks Raw: `spoilers` (1 = yes)
	 */
	get hasSpoilers(): boolean | undefined {
		return this.flag(this.raw.spoilers);
	}

	/**
	 * Number of custom spoilers available on this board.
	 * @remarks Raw: `custom_spoilers`
	 */
	get customSpoilers(): number | undefined {
		return this.raw.custom_spoilers;
	}

	/**
	 * Whether threads on this board are archived when pushed off the last page.
	 * @remarks Raw: `is_archived` (1 = yes)
	 */
	get isArchived(): boolean | undefined {
		return this.flag(this.raw.is_archived);
	}

	/**
	 * Board-specific flags mapped from code to label.
	 * @remarks Raw: `board_flags`
	 */
	get boardFlags(): BoardFlags | undefined {
		return this.raw.board_flags;
	}

	/**
	 * Whether poster country flags are displayed.
	 * @remarks Raw: `country_flags` (1 = yes)
	 */
	get countryFlags(): boolean | undefined {
		return this.flag(this.raw.country_flags);
	}

	/**
	 * Whether poster ID tags are enabled.
	 * @remarks Raw: `user_ids` (1 = yes)
	 */
	get userIds(): boolean | undefined {
		return this.flag(this.raw.user_ids);
	}

	/**
	 * Whether drawings can be submitted via the Oekaki applet.
	 * @remarks Raw: `oekaki` (1 = yes)
	 */
	get oekaki(): boolean | undefined {
		return this.flag(this.raw.oekaki);
	}

	/**
	 * Whether Shift-JIS tags ([sjis]) are supported.
	 * @remarks Raw: `sjis_tags` (1 = yes)
	 */
	get sjisTags(): boolean | undefined {
		return this.flag(this.raw.sjis_tags);
	}

	/**
	 * Whether syntax-highlighted code tags ([code]) are supported.
	 * @remarks Raw: `code_tags` (1 = yes)
	 */
	get codeTags(): boolean | undefined {
		return this.flag(this.raw.code_tags);
	}

	/**
	 * Whether TeX math tags ([math], [eqn]) are supported.
	 * @remarks Raw: `math_tags` (1 = yes)
	 */
	get mathTags(): boolean | undefined {
		return this.flag(this.raw.math_tags);
	}

	/**
	 * Whether image attachments are disabled.
	 * @remarks Raw: `text_only` (1 = yes)
	 */
	get textOnly(): boolean | undefined {
		return this.flag(this.raw.text_only);
	}

	/**
	 * Whether name field is forced anonymous.
	 * @remarks Raw: `forced_anon` (1 = yes)
	 */
	get forcedAnon(): boolean | undefined {
		return this.flag(this.raw.forced_anon);
	}

	/**
	 * Whether `.webm` files with audio are permitted.
	 * @remarks Raw: `webm_audio` (1 = yes)
	 */
	get webmAudio(): boolean | undefined {
		return this.flag(this.raw.webm_audio);
	}

	/**
	 * Whether original posts require a subject line.
	 * @remarks Raw: `require_subject` (1 = yes)
	 */
	get requireSubject(): boolean | undefined {
		return this.flag(this.raw.require_subject);
	}

	/**
	 * Minimum required image width in pixels.
	 * @remarks Raw: `min_image_width`
	 */
	get minImageWidth(): number | undefined {
		return this.raw.min_image_width;
	}

	/**
	 * Minimum required image height in pixels.
	 * @remarks Raw: `min_image_height`
	 */
	get minImageHeight(): number | undefined {
		return this.raw.min_image_height;
	}

	private flag(val?: 0 | 1): boolean | undefined {
		return val !== undefined ? val === 1 : undefined;
	}
}

export function transformBoard(raw: RawBoard): Board {
	return new Board(raw);
}
