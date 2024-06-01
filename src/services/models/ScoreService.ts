import { readdirSync } from "fs";
import { StandardModCombination } from "osu-standard-stable";
import path from "path";
import { LoggerService } from "../LoggerService";
import { ScoreDecoder } from "osu-parsers";
import { Score, ScoreInfo } from "osu-classes";
import {
	BeatmapFetchKey,
	BeatmapFetchRequest,
} from "../../http/BeatmapFetchRequest";
import { Beatmap } from "../../types/Beatmap";

export class ScoreService {
	// private _playerName: string = "osu!";
	// private _diffName: string = "Normal";
	// private _songTitle: string = "Beatmap";
	// private _accuracy: number = 100;
	// private _score: number = 0;
	// private _pp: number = 0;
	// private _mods: StandardModCombination = new StandardModCombination();
	// private _
	private readonly Logger = new LoggerService("ScoreService");
	private readonly scoreDecoder = new ScoreDecoder();
	private _beatmapData!: Beatmap;
	private _scoreData!: Score;
	private scoreFilePath: string;

	public hasLoadedScore = false;

	constructor() {
		this.scoreFilePath = this.getScoreFilePath();
	}

	public async decodeScoreFile() {
		this._scoreData = await this.scoreDecoder.decodeFromPath(
			this.scoreFilePath
		);

		this._beatmapData = await new BeatmapFetchRequest({
			key: BeatmapFetchKey.Hash,
			keyValue: this.scoreData.beatmapHashMD5,
			mods: Number(this._scoreData.info.rawMods),
		}).perform();

		this.hasLoadedScore = true;
	}

	public get beatmapData() {
		return this._beatmapData;
	}

	public get scoreData() {
		return new ScoreInfo(this._scoreData.info);
	}

	private getScoreFilePath() {
		const replaysFolderPath = path.resolve("./replays/");
		const osrFilesInReplaysFolder = readdirSync(replaysFolderPath).filter(
			(file) => file.endsWith(".osr")
		);

		if (osrFilesInReplaysFolder.length < 1)
			throw this.handleError(
				'Não foram encontrados arquivos de score na pasta "replays"'
			);

		return path.resolve(
			path.join("./replays/", osrFilesInReplaysFolder[0])
		);
	}

	private handleError(reason: string) {
		this.Logger.printError(
			"Não foi possível carregar o arquivo de score:",
			reason
		);

		process.exit(1);
	}
}
