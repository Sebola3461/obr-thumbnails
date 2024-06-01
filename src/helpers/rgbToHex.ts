export function rgbToHex({
	r,
	g,
	b,
}: {
	r: number;
	g: number;
	b: number;
}): string {
	// Ensure the RGB values are within the 0-255 range
	if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) {
		throw new RangeError("RGB values must be between 0 and 255.");
	}

	// Convert each component to a hexadecimal string and pad with zeros if necessary
	const red = r.toString(16).padStart(2, "0");
	const green = g.toString(16).padStart(2, "0");
	const blue = b.toString(16).padStart(2, "0");

	// Concatenate the components into a single hex string
	return `#${red}${green}${blue}`;
}
