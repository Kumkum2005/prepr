export type TextPart = { text: string; bold: boolean };

export function splitBold(input: string): TextPart[] {
  const parts: TextPart[] = [];
  const pattern = /\*\*([\s\S]+?)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(input)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ text: input.slice(lastIndex, match.index), bold: false });
    }
    parts.push({ text: match[1], bold: true });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < input.length) {
    parts.push({ text: input.slice(lastIndex), bold: false });
  }
  return parts;
}

export function stripBold(input: string): string {
  return input.replace(/\*\*/g, '');
}
