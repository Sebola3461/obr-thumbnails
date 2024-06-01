import axios from "axios";
import { readFileSync } from "fs";

export class BeatmapBackground {
	public readonly beatmapId: number;

	constructor(beatmapId: number) {
		this.beatmapId = beatmapId;
	}

	public load(): Promise<Buffer> {
		return new Promise((resolve, reject) => {
			axios(this.getCoverImageURL(), {
				responseType: "arraybuffer",
			})
				.then((response) => {
					resolve(
						response.data || readFileSync("./assets/fallbackbg.jpg")
					);
				})
				.catch(() => {
					resolve(readFileSync("./assets/fallbackbg.jpg"));
				});
		});
	}

	public getCoverImageURL() {
		return `https://assets.ppy.sh/beatmaps/${this.beatmapId}/covers/raw.jpg`;
	}
}
