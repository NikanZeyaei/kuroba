/**
 * Raw wire format of a preview reply post in `catalog.json`'s `last_replies`.
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

	get id(): number {
		return this.raw.no;
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

	get comment(): string | undefined {
		return this.raw.com;
	}

	get resto(): number {
		return this.raw.resto;
	}

	get filename(): string | undefined {
		return this.raw.filename;
	}

	get extension(): string | undefined {
		return this.raw.ext;
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

	get tim(): number | undefined {
		return this.raw.tim;
	}

	get md5(): string | undefined {
		return this.raw.md5;
	}

	get filesize(): number | undefined {
		return this.raw.fsize;
	}

	get capcode(): string | undefined {
		return this.raw.capcode;
	}

	get tripcode(): string | undefined {
		return this.raw.trip;
	}

	get posterId(): string | undefined {
		return this.raw.id;
	}

	get country(): string | undefined {
		return this.raw.country;
	}

	get countryName(): string | undefined {
		return this.raw.country_name;
	}

	get hasMobileOptimizedImage(): boolean | undefined {
		return this.raw.m_img !== undefined ? this.raw.m_img === 1 : undefined;
	}
}

/**
 * Normalized OP thread in a catalog page.
 */
export class CatalogThread {
	constructor(readonly raw: RawCatalogThread) {}

	get id(): number {
		return this.raw.no;
	}

	get resto(): number {
		return this.raw.resto;
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

	get omittedPosts(): number | undefined {
		return this.raw.omitted_posts;
	}

	get omittedImages(): number | undefined {
		return this.raw.omitted_images;
	}

	get replies(): number {
		return this.raw.replies;
	}

	get images(): number {
		return this.raw.images;
	}

	get isBumpLimitReached(): boolean | undefined {
		return this.flag(this.raw.bumplimit);
	}

	get isImageLimitReached(): boolean | undefined {
		return this.flag(this.raw.imagelimit);
	}

	get lastModified(): number | undefined {
		return this.raw.last_modified;
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

	get lastReplies(): CatalogReply[] {
		return this.raw.last_replies?.map((reply) => new CatalogReply(reply)) ?? [];
	}

	private flag(val?: 0 | 1): boolean | undefined {
		return val !== undefined ? val === 1 : undefined;
	}
}

/**
 * Normalized catalog page containing threads.
 */
export class CatalogPage {
	constructor(readonly raw: RawCatalogPage) {}

	get page(): number {
		return this.raw.page;
	}

	get threads(): CatalogThread[] {
		return this.raw.threads.map((thread) => new CatalogThread(thread));
	}
}
