export interface RawPost {
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
	board_flag?: string;
	flag_name?: string;
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
	replies?: number;
	images?: number;
	bumplimit?: 0 | 1;
	imagelimit?: 0 | 1;
	tag?: string;
	semantic_url?: string;
	since4pass?: number;
	unique_ips?: number;
	m_img?: 0 | 1;
	archived?: 0 | 1;
	archived_on?: number;
}

export interface RawThreadResponse {
	posts: RawPost[];
}

export interface RawThreadListItem {
	no: number;
	last_modified: number;
	replies: number;
}

export interface RawThreadListPage {
	page: number;
	threads: RawThreadListItem[];
}

export class Post {
	constructor(readonly raw: RawPost) {}

	get id(): number {
		return this.raw.no;
	}

	get resto(): number {
		return this.raw.resto;
	}

	get isOp(): boolean {
		return this.raw.resto === 0;
	}

	get isSticky(): boolean | undefined {
		return this.flag(this.raw.sticky);
	}

	get isClosed(): boolean | undefined {
		return this.flag(this.raw.closed);
	}

	get now(): string {
		return this.raw.now;
	}

	get time(): number {
		return this.raw.time;
	}

	get name(): string {
		return this.raw.name;
	}

	get tripcode(): string | undefined {
		return this.raw.trip;
	}

	get posterId(): string | undefined {
		return this.raw.id;
	}

	get capcode(): string | undefined {
		return this.raw.capcode;
	}

	get country(): string | undefined {
		return this.raw.country;
	}

	get countryName(): string | undefined {
		return this.raw.country_name;
	}

	get boardFlag(): string | undefined {
		return this.raw.board_flag;
	}

	get flagName(): string | undefined {
		return this.raw.flag_name;
	}

	get subject(): string | undefined {
		return this.raw.sub;
	}

	get comment(): string | undefined {
		return this.raw.com;
	}

	get tim(): number | undefined {
		return this.raw.tim;
	}

	get filename(): string | undefined {
		return this.raw.filename;
	}

	get extension(): string | undefined {
		return this.raw.ext;
	}

	get filesize(): number | undefined {
		return this.raw.fsize;
	}

	get md5(): string | undefined {
		return this.raw.md5;
	}

	get width(): number | undefined {
		return this.raw.w;
	}

	get height(): number | undefined {
		return this.raw.h;
	}

	get thumbnailWidth(): number | undefined {
		return this.raw.tn_w;
	}

	get thumbnailHeight(): number | undefined {
		return this.raw.tn_h;
	}

	get isFileDeleted(): boolean | undefined {
		return this.flag(this.raw.filedeleted);
	}

	get hasSpoiler(): boolean | undefined {
		return this.flag(this.raw.spoiler);
	}

	get customSpoiler(): number | undefined {
		return this.raw.custom_spoiler;
	}

	get replies(): number | undefined {
		return this.raw.replies;
	}

	get images(): number | undefined {
		return this.raw.images;
	}

	get isBumpLimitReached(): boolean | undefined {
		return this.flag(this.raw.bumplimit);
	}

	get isImageLimitReached(): boolean | undefined {
		return this.flag(this.raw.imagelimit);
	}

	get tag(): string | undefined {
		return this.raw.tag;
	}

	get semanticUrl(): string | undefined {
		return this.raw.semantic_url;
	}

	get since4Pass(): number | undefined {
		return this.raw.since4pass;
	}

	get uniqueIps(): number | undefined {
		return this.raw.unique_ips;
	}

	get hasMobileOptimizedImage(): boolean | undefined {
		return this.flag(this.raw.m_img);
	}

	get isArchived(): boolean | undefined {
		return this.flag(this.raw.archived);
	}

	get archivedOn(): number | undefined {
		return this.raw.archived_on;
	}

	private flag(val?: 0 | 1): boolean | undefined {
		return val !== undefined ? val === 1 : undefined;
	}
}

export class Thread {
	readonly op: Post;
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

	get id(): number {
		return this.op.id;
	}

	get subject(): string | undefined {
		return this.op.subject;
	}

	get comment(): string | undefined {
		return this.op.comment;
	}

	get isSticky(): boolean | undefined {
		return this.op.isSticky;
	}

	get isClosed(): boolean | undefined {
		return this.op.isClosed;
	}

	get isArchived(): boolean | undefined {
		return this.op.isArchived;
	}

	get postCount(): number {
		return this.posts.length;
	}
}

export class ThreadListItem {
	constructor(readonly raw: RawThreadListItem) {}

	get id(): number {
		return this.raw.no;
	}

	get lastModified(): number {
		return this.raw.last_modified;
	}

	get replies(): number {
		return this.raw.replies;
	}
}

export class ThreadListPage {
	constructor(readonly raw: RawThreadListPage) {}

	get page(): number {
		return this.raw.page;
	}

	get threads(): ThreadListItem[] {
		return this.raw.threads.map((item) => new ThreadListItem(item));
	}
}
