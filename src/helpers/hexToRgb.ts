export function hexToRgb(
	hex: string
): { r: number; g: number; b: number } | null {
	// Remove the leading # if it's there
	hex = hex.replace(/^#/, "");

	// Parse 3-digit hex
	if (hex.length === 3) {
		hex = hex
			.split("")
			.map((char) => char + char)
			.join("");
	}

	// Validate the hex string
	if (hex.length !== 6 || !/^[0-9A-Fa-f]{6}$/.test(hex)) {
		return null; // Invalid hex string
	}

	// Convert hex to RGB
	const r = parseInt(hex.substring(0, 2), 16);
	const g = parseInt(hex.substring(2, 4), 16);
	const b = parseInt(hex.substring(4, 6), 16);

	return { r, g, b };
}
