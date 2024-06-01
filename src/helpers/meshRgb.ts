export function meshRgb({
	r,
	g,
	b,
	percentage,
}: {
	r: number;
	g: number;
	b: number;
	percentage: number;
}) {
	return { r: r * percentage, g: g * percentage, b: b * percentage };
}
