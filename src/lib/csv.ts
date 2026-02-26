import * as es from 'es-toolkit';

export function parse<T extends Record<string, string | number>>(csv: string): T[] {
	const lines = csv.trim().split('\n');
	if (lines.length < 2) return [];

	const headers = lines[0].split(',').map((h) => h.trim());
	const dataLines = lines.slice(1);

	return dataLines.map((line) => {
		const values = line.split(',').map(autoTypeCoerce);
		const pairs = es.zip(headers, values);
		return Object.fromEntries(pairs) as T;
	});
}

/**
 * Coerces a string into a number if possible,
 * otherwise returns the original trimmed string.
 */
function autoTypeCoerce(value: string): string | number {
	const trimmed = value.trim();
	if (trimmed === '') return trimmed;
	const num = Number(trimmed);
	return !isNaN(num) ? num : trimmed;
}
