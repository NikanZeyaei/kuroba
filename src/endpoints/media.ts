export class MediaHelper {
	constructor(
		private readonly mediaBaseUrl: string,
		private readonly staticBaseUrl: string,
	) {}

	image(board: string, tim: number | string, ext: string): string {
		const normalizedExt = ext.startsWith(".") ? ext : `.${ext}`;
		return `${this.mediaBaseUrl}/${board}/${tim}${normalizedExt}`;
	}

	thumbnail(board: string, tim: number | string): string {
		return `${this.mediaBaseUrl}/${board}/${tim}s.jpg`;
	}

	countryFlag(countryCode: string): string {
		return `${this.staticBaseUrl}/image/country/${countryCode.toLowerCase()}.gif`;
	}

	boardFlag(board: string, code: string): string {
		return `${this.staticBaseUrl}/image/flags/${board}/${code.toLowerCase()}.gif`;
	}

	spoiler(): string {
		return `${this.staticBaseUrl}/image/spoiler.png`;
	}

	customSpoiler(board: string, customSpoilerId: number): string {
		return `${this.staticBaseUrl}/image/spoiler-${board}${customSpoilerId}.png`;
	}
}
