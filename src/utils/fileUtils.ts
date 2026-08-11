import { toPng, toJpeg } from 'html-to-image';
import { PreviewStyleConfig, TOCItem } from '../types';
import { getEffectiveAccentColor, getTintedBackground } from './colorUtils';

// File Download Helper
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportAsMarkdown(filename: string, content: string) {
  const name = filename.endsWith('.md') ? filename : `${filename}.md`;
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  downloadBlob(blob, name);
}

export function exportAsText(filename: string, content: string) {
  const name = filename.replace(/\.md$/, '') + '.txt';
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  downloadBlob(blob, name);
}

export function exportAsHtml(filename: string, renderedHtml: string, title: string, styleConfig: PreviewStyleConfig, isDark: boolean) {
  const name = filename.replace(/\.md$/, '') + '.html';

  // Strip copy buttons or interactive UI elements from exported HTML
  const cleanHtml = renderedHtml
    .replace(/<button[^>]*title="코드 복사"[^>]*>[\s\S]*?<\/button>/gi, '')
    .replace(/<button[^>]*>[\s\S]*?복사[\s\S]*?<\/button>/gi, '');

  const highlightCssUrl = isDark
    ? 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-dark.min.css'
    : 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css';

  const effectiveAccentColor = getEffectiveAccentColor(styleConfig.boldColor, isDark) || '#ef4444';
  const boldBgValue = (styleConfig.enableBoldBg ?? true)
    ? getTintedBackground(effectiveAccentColor)
    : 'transparent';

  const fullHtml = `<!DOCTYPE html>
<html lang="ko" class="${isDark ? 'dark' : ''}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <link rel="stylesheet" href="${highlightCssUrl}">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
  <style>
    :root {
      --preview-bold-color: ${effectiveAccentColor};
      --preview-bold-bg: ${boldBgValue};
      --preview-link-color: ${effectiveAccentColor};
      --preview-heading-color: ${styleConfig.headingColor === 'default' ? 'inherit' : styleConfig.headingColor};
    }
    * {
      box-sizing: border-box;
    }
    body {
      font-family: ${
        styleConfig.fontFamily === 'serif'
          ? 'Georgia, Cambria, "Times New Roman", Times, serif'
          : styleConfig.fontFamily === 'mono'
          ? 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'
          : 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      };
      max-width: 880px;
      margin: 0 auto;
      padding: 2.5rem 1.5rem;
      color: ${isDark ? '#f5f5f5' : '#1e293b'};
      background-color: ${isDark ? '#0a0a0a' : '#ffffff'};
      line-height: ${
        styleConfig.lineHeight === 'tight'
          ? '1.4'
          : styleConfig.lineHeight === 'relaxed'
          ? '1.8'
          : '1.6'
      };
      font-size: ${
        styleConfig.fontSize === 'sm'
          ? '14px'
          : styleConfig.fontSize === 'lg'
          ? '18px'
          : '16px'
      };
    }
    strong, b {
      color: ${
        (styleConfig.enableBoldColor ?? true)
          ? 'var(--preview-bold-color)'
          : 'inherit'
      } !important;
      background-color: var(--preview-bold-bg) !important;
      padding: 0 2px;
      border-radius: 2px;
    }
    a {
      color: var(--preview-link-color) !important;
      text-decoration: underline;
    }
    h1, h2, h3, h4, h5, h6 {
      color: ${
        styleConfig.accentHeadings ?? true
          ? 'var(--preview-bold-color)'
          : 'var(--preview-heading-color)'
      };
      margin-top: 1.5em;
      margin-bottom: 0.5em;
      font-weight: 700;
      letter-spacing: -0.02em;
    }
    h1 {
      font-size: 2em;
      border-bottom: 1px solid ${
        styleConfig.accentHeadings ?? true
          ? `${styleConfig.boldColor || '#ef4444'}40`
          : isDark
          ? '#262626'
          : '#e2e8f0'
      };
      padding-bottom: 0.3em;
    }
    h2 {
      font-size: 1.5em;
      border-bottom: 1px solid ${
        styleConfig.accentHeadings ?? true
          ? `${styleConfig.boldColor || '#ef4444'}25`
          : isDark
          ? '#262626'
          : '#f1f5f9'
      };
      padding-bottom: 0.2em;
    }
    pre {
      background-color: ${isDark ? '#282c34' : '#f8fafc'};
      border: 1px solid ${isDark ? '#333333' : '#e2e8f0'};
      border-radius: 8px;
      padding: 1rem;
      overflow-x: auto;
      margin: 1em 0;
    }
    code {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 0.9em;
    }
    p code, li code {
      background-color: ${isDark ? '#171717' : '#f1f5f9'};
      color: ${isDark ? '#f472b6' : '#db2777'};
      padding: 0.2em 0.4em;
      border-radius: 4px;
      border: 1px solid ${isDark ? '#262626' : '#e2e8f0'};
    }
    blockquote {
      border-left: 4px solid var(--preview-bold-color);
      margin: 1em 0;
      padding: 0.5rem 1rem;
      background-color: ${isDark ? 'rgba(23, 23, 23, 0.5)' : '#f8fafc'};
      color: ${isDark ? '#d4d4d4' : '#475569'};
      border-top-right-radius: 6px;
      border-bottom-right-radius: 6px;
      font-style: italic;
    }
    hr {
      border: none;
      border-top: 1px solid ${
        styleConfig.accentHr ?? true
          ? `${styleConfig.boldColor || '#ef4444'}60`
          : isDark
          ? '#262626'
          : '#e2e8f0'
      };
      margin: 2em 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 1.5em 0;
      border-radius: 6px;
      overflow: hidden;
      border: 1px solid ${
        styleConfig.accentTable ?? true
          ? `${styleConfig.boldColor || '#ef4444'}35`
          : isDark
          ? '#262626'
          : '#e2e8f0'
      };
    }
    th, td {
      border: 1px solid ${isDark ? '#262626' : '#cbd5e1'};
      padding: 0.6rem 0.8rem;
      text-align: left;
    }
    th {
      background-color: ${
        styleConfig.accentTable ?? true
          ? `${styleConfig.boldColor || '#ef4444'}12`
          : isDark
          ? '#171717'
          : '#f8fafc'
      };
      color: ${
        styleConfig.accentTable ?? true
          ? 'var(--preview-bold-color)'
          : 'inherit'
      };
      font-weight: 600;
    }
    input[type="checkbox"] {
      accent-color: var(--preview-bold-color);
      margin-right: 0.5rem;
    }
    img {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
    }
  </style>
</head>
<body>
  <div class="markdown-preview">
    ${cleanHtml}
  </div>
</body>
</html>`;

  const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
  downloadBlob(blob, name);
}

export async function exportAsImage(
  elementId: string,
  filename: string,
  format: 'png' | 'jpeg' = 'png',
  isDark: boolean = false
) {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('미리보기 영역을 찾을 수 없습니다.');
  }

  const name = filename.replace(/\.md$/, '') + `.${format}`;

  // Measure scroll dimensions so full document height is rendered without clipping
  const scrollHeight = Math.max(element.scrollHeight, element.offsetHeight, 400);
  const scrollWidth = Math.max(element.scrollWidth, element.offsetWidth, 600);

  const options = {
    quality: 0.98,
    backgroundColor: isDark ? '#0a0a0a' : '#ffffff',
    cacheBust: true,
    pixelRatio: 2, // High DPI output
    width: scrollWidth,
    height: scrollHeight,
    style: {
      overflow: 'visible',
      height: `${scrollHeight}px`,
      maxHeight: 'none',
      position: 'static',
      transform: 'none',
    },
    filter: (node: HTMLElement) => {
      // Hide copy buttons and floating action components during image capture
      if (
        node.tagName === 'BUTTON' &&
        (node.textContent?.includes('복사') ||
          node.title?.includes('복사') ||
          node.getAttribute('title')?.includes('복사'))
      ) {
        return false;
      }
      return true;
    },
  };

  const dataUrl =
    format === 'png'
      ? await toPng(element, options)
      : await toJpeg(element, options);

  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function extractTOC(markdown: string): TOCItem[] {
  const lines = markdown.split('\n');
  const items: TOCItem[] = [];

  lines.forEach((line) => {
    const match = line.match(/^(#{1,3})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].trim().replace(/[*_~`]/g, '');
      const id = text.toLowerCase().replace(/[^\w\u3131-\u318E\uAC00-\uD7A3]+/g, '-');
      items.push({ id, text, level });
    }
  });

  return items;
}

export function calculateTextStats(text: string) {
  const chars = text.length;
  const charsNoSpaces = text.replace(/\s/g, '').length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const lines = text.split('\n').length;
  const readTimeMin = Math.ceil(words / 200);

  return { chars, charsNoSpaces, words, lines, readTimeMin };
}
