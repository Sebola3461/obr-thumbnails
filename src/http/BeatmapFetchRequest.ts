import axios from "axios";
import { LoggerService } from "../services/LoggerService";
import { Beatmap, RawBeatmap } from "../types/Beatmap";
import { StandardModCombination } from "osu-standard-stable";

export enum BeatmapFetchKey {
	Hash = "h",
	BeatmapsetId = "s",
	BeatmapId = "b",
}

export class BeatmapFetchRequest {
	public readonly key: BeatmapFetchKey;
	public readonly keyValue;
	public readonly mods: number = 0;
	private Logger = new LoggerService("BeatmapFetchRequest");

	constructor({
		key,
		keyValue,
		mods,
	}: {
		key: BeatmapFetchKey;
		keyValue: string | number;
		mods?: number;
	}) {
		this.key = key;
		this.keyValue = keyValue;
		this.mods = mods || 0;
	}

	public perform(): Promise<Beatmap> {
		return new Promise((resolve) => {
			axios(
				`https://osu.ppy.sh/api/get_beatmaps?k=${
					process.env.OSU_API_KEY
				}&${this.key}=${
					this.keyValue
				}&mods=${this.getDifficultyIncreaseMods()}`
			).then((response) => {
				if (response.status != 200)
					throw this.handleError(response.statusText);

				resolve(this.buildSanitized(response.data[0] as RawBeatmap));
			});
		});
	}

	private getDifficultyIncreaseMods() {
		const difficultyIncreaseMods = ["DT", "NC", "HR"];

		const mods = new StandardModCombination(this.mods);

		const filteredMods = mods.all.filter((mod) =>
			difficultyIncreaseMods.includes(mod.acronym)
		);

		if (filteredMods.length == 0) return 0;

		return new StandardModCombination().toBitwise(
			filteredMods.map((mod) => mod.acronym).join("")
		);
	}

	private handleError(reason: string) {
		this.Logger.printError("Não foi possível carregar o beatmap:", reason);

		process.exit(1);
	}

	private buildSanitized(beatmap: RawBeatmap): Beatmap {
		return {
			beatmapset_id: Number(beatmap.beatmapset_id),
			beatmap_id: Number(beatmap.beatmap_id),
			approved: Number(beatmap.approved),
			total_length: Number(beatmap.total_length),
			hit_length: Number(beatmap.hit_length),
			version: beatmap.version,
			file_md5: beatmap.file_md5,
			diff_size: Number(beatmap.diff_size),
			diff_overall: Number(beatmap.diff_overall),
			diff_approach: Number(beatmap.diff_approach),
			diff_drain: Number(beatmap.diff_drain),
			mode: Number(beatmap.mode),
			count_normal: Number(beatmap.count_normal),
			count_slider: Number(beatmap.count_slider),
			count_spinner: Number(beatmap.count_spinner),
			submit_date: new Date(beatmap.submit_date),
			approved_date: new Date(beatmap.approved_date),
			last_update: new Date(beatmap.last_update),
			artist: beatmap.artist,
			artist_unicode: beatmap.artist_unicode,
			title: beatmap.title,
			title_unicode: beatmap.title_unicode,
			creator: beatmap.creator,
			creator_id: Number(beatmap.creator_id),
			bpm: Number(beatmap.bpm),
			source: beatmap.source,
			tags: beatmap.tags,
			genre_id: Number(beatmap.genre_id),
			language_id: Number(beatmap.language_id),
			favourite_count: Number(beatmap.favourite_count),
			rating: Number(beatmap.rating),
			storyboard: beatmap.storyboard == "1",
			video: beatmap.video == "1",
			download_unavailable: beatmap.download_unavailable == "1",
			audio_unavailable: beatmap.audio_unavailable == "1",
			playcount: Number(beatmap.playcount),
			passcount: Number(beatmap.passcount),
			packs: beatmap.packs,
			max_combo: Number(beatmap.max_combo),
			diff_aim: Number(beatmap.diff_aim),
			diff_speed: Number(beatmap.diff_speed),
			difficultyrating: Number(beatmap.difficultyrating),
		};
	}
}
