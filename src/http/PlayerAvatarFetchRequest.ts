import axios from "axios";

export class PlayerAvatarFetchRequest {
	public readonly playerId: number;
	private _loaded = false;
	private _data: Buffer = Buffer.from("");

	constructor(playerId: number) {
		this.playerId = playerId;
	}

	public get data() {
		return this._data;
	}

	public get hasData() {
		return this._loaded;
	}

	public perform(): Promise<Buffer> {
		return new Promise((resolve) => {
			axios(`https://a.ppy.sh/${this.playerId}`, {
				responseType: "arraybuffer",
			}).then((response) => {
				this._loaded = true;
				this._data = response.data;

				resolve(this.data);
			});
		});
	}
}
