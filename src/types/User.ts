interface RawUser {
	user_id: string;
	username: string;
	join_date: string;
	count300: string;
	count100: string;
	count50: string;
	playcount: string;
	ranked_score: string;
	total_score: string;
	pp_rank: string;
	level: string;
	pp_raw: string;
	accuracy: string;
	count_rank_ss: string;
	count_rank_ssh: string;
	count_rank_s: string;
	count_rank_sh: string;
	count_rank_a: string;
	country: string;
	total_seconds_played: string;
	pp_country_rank: string;
}

interface User {
	user_id: number;
	username: string;
	join_date: Date;
	count300: number;
	count100: number;
	count50: number;
	playcount: number;
	ranked_score: number;
	total_score: number;
	pp_rank: number;
	level: number;
	pp_raw: number;
	accuracy: number;
	count_rank_ss: number;
	count_rank_ssh: number;
	count_rank_s: number;
	count_rank_sh: number;
	count_rank_a: number;
	country: string;
	total_seconds_played: number;
	pp_country_rank: number;
}
