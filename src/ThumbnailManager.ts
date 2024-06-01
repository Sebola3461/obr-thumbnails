import { ConfigurationManager } from "./ConfigurationManager";
import { BeatmapBackground } from "./http/BeatmapBackground";
import { ThumbnailConfig } from "./services/models/ThumbnailConfig";
import { Thumbnail } from "./renderer/Thumbnail";
import { ScoreService } from "./services/models/ScoreService";

export class ThumbnailManager {
	public readonly configuration;

	constructor() {
		this.configuration = new ConfigurationManager(this);

		this.configuration.load();

		const score = new ScoreService();

		score.decodeScoreFile().then(() => {
			const config = new ThumbnailConfig();

			config
				.setBackground(
					new BeatmapBackground(score.beatmapData.beatmapset_id)
				)
				.setPearkHighlightText(this.configuration.getPearkText())
				.setPearkHighlightType(this.configuration.getPearkType())
				.setComment(this.configuration.getComment());

			new Thumbnail(score, config).render();
		});
	}
}
