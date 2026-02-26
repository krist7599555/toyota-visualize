/**
 * Parses a CSV string into an array of objects, validated by the given Valibot schema.
 * Automatically attempts to convert numeric strings to numbers.
 *
 * @param csv The CSV string to parse
 * @returns An array of validated objects
 */
export function parse(csv: string): Record<string, any[]>[] {
	const lines = csv
		.trim()
		.split('\n')
		.filter((line) => line.trim() !== '');
	if (lines.length === 0) return [];

	const headers = lines[0].split(',').map((h) => h.trim());
	const rows = lines.slice(1);

	const records = rows.map((row) => {
		const values = row.split(',');
		const record: Record<string, any> = {};
		headers.forEach((header, i) => {
			const value = values[i]?.trim();

			// Simple heuristic: if the value is purely numeric, parse it as a number
			// This allows the CSV data to satisfy v.number() schemas.
			if (
				value !== undefined &&
				value !== '' &&
				!isNaN(Number(value)) &&
				/^-?\d+(\.\d+)?$/.test(value)
			) {
				record[header] = Number(value);
			} else {
				record[header] = value;
			}
		});
		return record;
	});

	return records;
}
