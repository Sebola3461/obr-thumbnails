import axios from "axios";

export class PlayerFetchRequest {
	private readonly username: string;
	private _data!: User;
	private _loaded = false;

	constructor(username: string) {
		this.username = username;
	}

	public get data() {
		return this._data;
	}

	public get hasData() {
		return this._loaded;
	}

	public perform(): Promise<User> {
		return new Promise((resolve) => {
			axios<RawUser[]>(
				`https://osu.ppy.sh/api/get_user?k=${process.env.OSU_API_KEY}&u=${this.username}&type=string`
			).then((response) => {
				this._loaded = true;

				const responseData = response.data[0];

				if (!responseData)
					throw new Error("Usuário inválido ou banido");

				this._data = {
					user_id: Number(responseData.user_id),
					username: responseData.username,
					join_date: new Date(responseData.join_date),
					count300: Number(responseData.count300),
					count100: Number(responseData.count100),
					count50: Number(responseData.count50),
					playcount: Number(responseData.playcount),
					ranked_score: Number(responseData.ranked_score),
					total_score: Number(responseData.total_score),
					pp_rank: Number(responseData.pp_rank),
					level: Number(responseData.level),
					pp_raw: Number(responseData.pp_raw),
					accuracy: Number(responseData.accuracy),
					count_rank_ss: Number(responseData.count_rank_ss),
					count_rank_ssh: Number(responseData.count_rank_ssh),
					count_rank_s: Number(responseData.count_rank_s),
					count_rank_sh: Number(responseData.count_rank_sh),
					count_rank_a: Number(responseData.count_rank_a),
					country: responseData.country,
					total_seconds_played: Number(
						responseData.total_seconds_played
					),
					pp_country_rank: Number(responseData.pp_country_rank),
				} as User;

				resolve(this._data);
			});
		});
	}
}
