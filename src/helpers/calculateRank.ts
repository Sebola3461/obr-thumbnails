import { IScoreInfo, ModBitwise, ModCombination, ScoreInfo } from "osu-classes";
import {
	StandardDifficultyAttributes,
	StandardModCombination,
	StandardRuleset,
} from "osu-standard-stable";
import { Beatmap } from "../types/Beatmap";

function shouldBeSilverRank(scoreInfo: IScoreInfo): boolean {
	if (scoreInfo.mods) {
		return scoreInfo.mods.has("HD") || scoreInfo.mods.has("FL");
	}

	if (typeof scoreInfo.rawMods === "number") {
		const hasHidden = (scoreInfo.rawMods & ModBitwise.Hidden) > 0;
		const hasFlashlight = (scoreInfo.rawMods & ModBitwise.Flashlight) > 0;

		return hasHidden || hasFlashlight;
	}

	if (typeof scoreInfo.rawMods === "string") {
		const acronyms =
			scoreInfo.rawMods.match(/.{1,2}/g)?.map((a) => a.toUpperCase()) ??
			[];

		return acronyms.includes("HD") || acronyms.includes("FL");
	}

	return false;
}

export function calculateRank(scoreInfo: IScoreInfo) {
	const { count300, count50, countMiss, totalHits } = scoreInfo;

	const ratio300 = Math.fround(count300 / totalHits);
	const ratio50 = Math.fround(count50 / totalHits);

	if (ratio300 === 1) {
		return shouldBeSilverRank(scoreInfo) ? "XH" : "X";
	}

	if (ratio300 > 0.9 && ratio50 <= 0.01 && countMiss === 0) {
		return shouldBeSilverRank(scoreInfo) ? "SH" : "S";
	}

	if ((ratio300 > 0.8 && countMiss === 0) || ratio300 > 0.9) {
		return "A";
	}

	if ((ratio300 > 0.7 && countMiss === 0) || ratio300 > 0.8) {
		return "B";
	}

	return ratio300 > 0.6 ? "C" : "D";
}
