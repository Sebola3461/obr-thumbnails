import axios from "axios";
import { HitResult, IScoreInfo, ScoreInfo } from "osu-classes";
import { BeatmapDecoder } from "osu-parsers";
import { StandardRuleset } from "osu-standard-stable";

export class ScoreCalculationRequest {
	public readonly score: IScoreInfo;
	public readonly beatmapId: number;
	private ruleset = new StandardRuleset();
	private beatmapDecoder = new BeatmapDecoder();

	constructor(score: IScoreInfo, beatmapId: number) {
		this.score = score;
		this.beatmapId = beatmapId;
	}

	public async perform() {
		const beatmap = this.beatmapDecoder.decodeFromString(
			await this.getBeatmapFile()
		);

		const mods = this.ruleset.createModCombination(this.score.rawMods);
		const standardBeatmap = this.ruleset.applyToBeatmapWithMods(
			beatmap,
			mods
		);

		const score = new ScoreInfo({
			maxCombo: this.score.maxCombo,
			count300: this.score.statistics.get(HitResult.Great),
			count100: this.score.statistics.get(HitResult.Good),
			count50: this.score.statistics.get(HitResult.Meh),
			countMiss: this.score.statistics.get(HitResult.Miss),
			mods,
		});

		score.accuracy =
			(score.count300 + score.count100 / 3 + score.count50 / 6) /
			(score.count300 + score.count100 + score.count50 + score.countMiss);

		const difficultyCalculator =
			this.ruleset.createDifficultyCalculator(standardBeatmap);

		const difficultyAttributes = difficultyCalculator.calculate();

		const performanceCalculator = this.ruleset.createPerformanceCalculator(
			difficultyAttributes,
			score
		);

		const performanceAttributes =
			performanceCalculator.calculateAttributes();

		return performanceCalculator.calculate(difficultyAttributes, score);
	}

	private async getBeatmapFile(): Promise<string> {
		return new Promise((resolve) => {
			axios(`https://osu.ppy.sh/osu/${this.beatmapId}`).then(
				(response) => {
					resolve(response.data);
				}
			);
		});
	}
}
