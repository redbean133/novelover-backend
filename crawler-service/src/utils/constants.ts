import { decode } from 'html-entities';

export const htmlToPlainText = (htmlString: string | null): string => {
  if (!htmlString) return '';

  let text = decode(htmlString);

  const PARAGRAPH_SEPARATOR = '|||---PARAGRAPH---|||';
  text = text.replace(
    /<\/(p|div|h[1-6]|blockquote|li|tr|section|article)>/gi,
    PARAGRAPH_SEPARATOR,
  );

  text = text.replace(/<br\s*\/?>/gi, PARAGRAPH_SEPARATOR);
  text = text.replace(/<[^>]+>/g, '');
  text = text.replace(/\u00a0/g, ' ');
  const paragraphs = text
    .split(PARAGRAPH_SEPARATOR)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0);

  return paragraphs.join('\n\n');
};
