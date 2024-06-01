import { BeatmapBackground } from "../../http/BeatmapBackground";

export enum ScorePearkType {
	FC,
	MISS,
	SB,
}

export class ThumbnailConfig {
	public outputFileName = "output.png";
	public background: BeatmapBackground = new BeatmapBackground(-1);
	public scorePearkType: ScorePearkType = ScorePearkType.FC;
	public scorePearkText: string = "FC";
	public comment = "";

	constructor() {}

	public setOutputFileName(fileName: string) {
		this.outputFileName = fileName;

		return this;
	}

	public setPearkHighlightType(type: ScorePearkType) {
		this.scorePearkType = type;

		return this;
	}

	public setPearkHighlightText(text: string) {
		this.scorePearkText = text;

		return this;
	}

	public setBackground(background: BeatmapBackground) {
		this.background = background;

		return this;
	}

	public setComment(comment: string) {
		this.comment = comment;

		return this;
	}
}
