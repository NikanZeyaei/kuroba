/**
 * Helper utility for generating media and static asset URLs.
 * Ref: `4chan-API/pages/User_images_and_static_content.md`
 */
export class MediaHelper {
	constructor(
		private readonly mediaBaseUrl: string,
		private readonly staticBaseUrl: string,
	) {}

	/**
	 * Constructs the full URL for a user-uploaded image attachment.
	 *
	 * Format: `https://i.4cdn.org/[board]/[tim][ext]`
	 *
	 * @param board Board abbreviation (e.g. "po", "g", "a").
	 * @param tim Post attachment timestamp identifier (`post.tim`).
	 * @param ext File extension including or excluding leading dot (`.png`, `jpg`).
	 */
	image(board: string, tim: number | string, ext: string): string {
		const normalizedExt = ext.startsWith(".") ? ext : `.${ext}`;
		return `${this.mediaBaseUrl}/${board}/${tim}${normalizedExt}`;
	}

	/**
	 * Constructs the full URL for a post thumbnail.
	 *
	 * Format: `https://i.4cdn.org/[board]/[tim]s.jpg`
	 *
	 * @param board Board abbreviation (e.g. "po", "g", "a").
	 * @param tim Post attachment timestamp identifier (`post.tim`).
	 */
	thumbnail(board: string, tim: number | string): string {
		return `${this.mediaBaseUrl}/${board}/${tim}s.jpg`;
	}

	/**
	 * Constructs the full URL for an individual ISO country flag icon.
	 *
	 * Format: `https://s.4cdn.org/image/country/[countryCode].gif`
	 *
	 * @param countryCode Two-character ISO 3166-1 alpha-2 country code (`post.country`).
	 */
	countryFlag(countryCode: string): string {
		return `${this.staticBaseUrl}/image/country/${countryCode.toLowerCase()}.gif`;
	}

	/**
	 * Constructs the full URL for an individual board-specific flag image.
	 *
	 * Format: `https://s.4cdn.org/image/flags/[board]/[code].gif`
	 *
	 * @param board Board abbreviation (e.g. "pol").
	 * @param code Board flag code (`post.boardFlag`).
	 */
	boardFlag(board: string, code: string): string {
		return `${this.staticBaseUrl}/image/flags/${board}/${code.toLowerCase()}.gif`;
	}

	/**
	 * Constructs the full URL for the default spoiler placeholder image.
	 *
	 * Format: `https://s.4cdn.org/image/spoiler.png`
	 */
	spoiler(): string {
		return `${this.staticBaseUrl}/image/spoiler.png`;
	}

	/**
	 * Constructs the full URL for a board-specific custom spoiler thumbnail.
	 *
	 * Format: `https://s.4cdn.org/image/spoiler-[board][customSpoilerId].png`
	 *
	 * @param board Board abbreviation (e.g. "a").
	 * @param customSpoilerId Custom spoiler index (1-10).
	 */
	customSpoiler(board: string, customSpoilerId: number): string {
		return `${this.staticBaseUrl}/image/spoiler-${board}${customSpoilerId}.png`;
	}
}
