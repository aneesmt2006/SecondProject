export function extractSymptoms(html: string): string[] {
    return html
        .split(/<\/p>\s*<p>/g)           // split first
        .map(s => s.replace(/<\/?p>/g,'')) // remove tags later
        .map(s => s.trim())
        .filter(Boolean);
}
