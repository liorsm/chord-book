/**
 * Split song text into equal line chunks for book columns (no section logic).
 * @returns {{ parts: string[] }}
 */
export function splitSongContentForColumns(content, columnCount = 2) {
  const count = Math.max(1, Math.min(3, columnCount));
  if (!content?.trim()) {
    return { parts: [''] };
  }

  const lines = content.split('\n');
  if (count === 1 || lines.length < 2) {
    return { parts: [content] };
  }

  const chunkSize = Math.ceil(lines.length / count);
  const parts = [];

  for (let i = 0; i < count; i++) {
    const start = i * chunkSize;
    if (start >= lines.length) break;
    parts.push(lines.slice(start, start + chunkSize).join('\n'));
  }

  if (parts.length < 2 || !parts[1].trim()) {
    return { parts: [content] };
  }

  return { parts };
}
