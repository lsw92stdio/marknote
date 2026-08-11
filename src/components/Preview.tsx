import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Copy, Check } from 'lucide-react';
import { PreviewStyleConfig } from '../types';
import { getEffectiveAccentColor } from '../utils/colorUtils';

interface PreviewProps {
  content: string;
  styleConfig: PreviewStyleConfig;
  isDark: boolean;
  onHtmlGenerated?: (html: string) => void;
}

export const Preview: React.FC<PreviewProps> = ({ content, styleConfig, isDark }) => {
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  const handleCopyCode = (codeText: string, id: string) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  // Font family class mapping
  const fontFamilyClass =
    styleConfig.fontFamily === 'serif'
      ? 'font-serif'
      : styleConfig.fontFamily === 'mono'
      ? 'font-mono'
      : 'font-sans';

  // Font size class mapping
  const fontSizeClass =
    styleConfig.fontSize === 'sm'
      ? 'text-sm'
      : styleConfig.fontSize === 'lg'
      ? 'text-lg'
      : 'text-base';

  // Line height class mapping
  const lineHeightClass =
    styleConfig.lineHeight === 'tight'
      ? 'leading-snug'
      : styleConfig.lineHeight === 'relaxed'
      ? 'leading-relaxed'
      : 'leading-normal';

  const effectiveAccentColor = getEffectiveAccentColor(styleConfig.boldColor, isDark);

  // Dynamic inline styles for customizable user colors
  const customCssVariables: React.CSSProperties = {
    '--preview-bold-color': effectiveAccentColor || '#ef4444',
    '--preview-bold-bg': styleConfig.boldBgColor || 'transparent',
    '--preview-link-color': effectiveAccentColor || '#ef4444',
    '--preview-heading-color':
      styleConfig.headingColor === 'default'
        ? 'inherit'
        : styleConfig.headingColor,
  } as React.CSSProperties;

  return (
    <div
      id="markdown-preview-container"
      style={customCssVariables}
      className={`relative w-full h-full p-6 md:p-8 overflow-y-auto transition-colors duration-200 ${fontFamilyClass} ${fontSizeClass} ${lineHeightClass} ${
        isDark ? 'bg-neutral-950 text-neutral-100' : 'bg-white text-slate-800'
      }`}
    >
      <div className="max-w-4xl mx-auto space-y-4 markdown-preview-content">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeHighlight, rehypeKatex]}
          components={{
            // Custom Strong/Bold renderer with custom user accent color
            strong: ({ children }) => (
              <strong
                style={{
                  color: (styleConfig.enableBoldColor ?? true) ? 'var(--preview-bold-color)' : 'inherit',
                  backgroundColor: (styleConfig.enableBoldColor ?? true) ? 'var(--preview-bold-bg)' : 'transparent',
                }}
                className="font-bold px-0.5 rounded transition-colors"
              >
                {children}
              </strong>
            ),
            // Custom Link renderer with user chosen link color
            a: ({ href, children }) => (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--preview-link-color)' }}
                className="underline hover:opacity-80 transition-opacity font-medium"
              >
                {children}
              </a>
            ),
            // Custom Headings
            // Headings with optional accent color
            h1: ({ children }) => (
              <h1
                style={{
                  color: styleConfig.accentHeadings ?? true ? effectiveAccentColor : 'var(--preview-heading-color)',
                  borderBottomColor: styleConfig.accentHeadings ?? true ? `${effectiveAccentColor}40` : undefined,
                }}
                className="text-2xl md:text-3xl font-extrabold pb-2 mb-4 border-b border-slate-200 dark:border-neutral-800 tracking-tight"
              >
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2
                style={{
                  color: styleConfig.accentHeadings ?? true ? effectiveAccentColor : 'var(--preview-heading-color)',
                  borderBottomColor: styleConfig.accentHeadings ?? true ? `${effectiveAccentColor}25` : undefined,
                }}
                className="text-xl md:text-2xl font-bold pb-1.5 mb-3 border-b border-slate-100 dark:border-neutral-800/80 mt-6 tracking-tight"
              >
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3
                style={{
                  color: styleConfig.accentHeadings ?? true ? effectiveAccentColor : 'var(--preview-heading-color)',
                }}
                className="text-lg md:text-xl font-bold mt-5 mb-2"
              >
                {children}
              </h3>
            ),
            h4: ({ children }) => (
              <h4 className="text-base font-bold mb-2 mt-4">{children}</h4>
            ),
            // Custom Code blocks & Inline Code
            code: ({ node, inline, className, children, ...props }: any) => {
              const match = /language-(\w+)/.exec(className || '');
              const lang = match ? match[1] : '';
              const codeId = `code-${Math.random().toString(36).substring(2, 9)}`;

              // Helper function to extract plain text string from React node tree for copying
              const extractText = (child: any): string => {
                if (typeof child === 'string') return child;
                if (typeof child === 'number') return String(child);
                if (Array.isArray(child)) return child.map(extractText).join('');
                if (child && child.props && child.props.children) return extractText(child.props.children);
                return '';
              };

              if (!inline) {
                const codeString = extractText(children).replace(/\n$/, '');

                return (
                  <div className="relative group my-4 rounded-xl overflow-hidden border border-slate-200 dark:border-neutral-800 shadow-xs">
                    <div className="flex items-center justify-between px-4 py-1.5 bg-slate-100 dark:bg-neutral-900 border-b border-slate-200 dark:border-neutral-800 text-xs text-slate-500 dark:text-neutral-400 font-mono">
                      <span className="font-semibold text-slate-700 dark:text-neutral-300 uppercase tracking-wider text-[11px]">
                        {lang || 'CODE'}
                      </span>
                      <button
                        onClick={() => handleCopyCode(codeString, codeId)}
                        className="flex items-center gap-1.5 px-2 py-0.5 rounded text-slate-600 dark:text-neutral-300 hover:bg-slate-200 dark:hover:bg-neutral-800 transition-colors"
                        title="코드 복사"
                      >
                        {copiedCodeId === codeId ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-emerald-500 font-medium">복사됨</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>복사</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="p-4 overflow-x-auto text-sm font-mono bg-[#282c34] text-[#abb2bf] leading-relaxed">
                      <code className={`hljs ${className || ''}`} {...props}>
                        {children}
                      </code>
                    </pre>
                  </div>
                );
              }

              return (
                <code
                  className="px-1.5 py-0.5 rounded text-sm font-mono bg-slate-100 dark:bg-neutral-900 text-pink-600 dark:text-pink-400 border border-slate-200 dark:border-neutral-800"
                  {...props}
                >
                  {children}
                </code>
              );
            },
            // Blockquotes
            blockquote: ({ children }) => (
              <blockquote
                style={{ borderLeftColor: effectiveAccentColor }}
                className="pl-4 py-1.5 my-4 border-l-4 italic bg-slate-50 dark:bg-neutral-900/50 text-slate-600 dark:text-neutral-300 rounded-r shadow-2xs"
              >
                {children}
              </blockquote>
            ),
            // Tables
            table: ({ children }) => (
              <div
                style={{
                  borderColor: styleConfig.accentTable ?? true ? `${effectiveAccentColor}35` : undefined,
                }}
                className="overflow-x-auto my-4 rounded-lg border border-slate-200 dark:border-neutral-800"
              >
                <table className="min-w-full divide-y divide-slate-200 dark:divide-neutral-800 text-sm">
                  {children}
                </table>
              </div>
            ),
            thead: ({ children }) => (
              <thead
                style={{
                  backgroundColor: styleConfig.accentTable ?? true ? `${effectiveAccentColor}12` : undefined,
                }}
                className="bg-slate-50 dark:bg-neutral-900 font-semibold text-slate-700 dark:text-neutral-200"
              >
                {children}
              </thead>
            ),
            tbody: ({ children }) => (
              <tbody className="divide-y divide-slate-200 dark:divide-neutral-800 bg-white dark:bg-neutral-950">
                {children}
              </tbody>
            ),
            tr: ({ children }) => <tr>{children}</tr>,
            th: ({ children }) => (
              <th
                style={{
                  color: styleConfig.accentTable ?? true ? effectiveAccentColor : undefined,
                }}
                className="px-4 py-2.5 text-left font-bold"
              >
                {children}
              </th>
            ),
            td: ({ children }) => <td className="px-4 py-2.5">{children}</td>,
            // Horizontal rule
            hr: () => (
              <hr
                style={{
                  borderColor: styleConfig.accentHr ?? true ? `${effectiveAccentColor}60` : undefined,
                }}
                className="my-6 border-slate-200 dark:border-neutral-800"
              />
            ),
            // Lists
            ul: ({ children }) => (
              <ul className="list-disc list-inside space-y-1 my-3 pl-2">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal list-inside space-y-1 my-3 pl-2">{children}</ol>
            ),
            li: ({ children }) => (
              <li className="leading-relaxed">{children}</li>
            ),
            // Checkbox inputs for task lists
            input: (props: any) => {
              if (props.type === 'checkbox') {
                return (
                  <input
                    type="checkbox"
                    checked={props.checked}
                    readOnly
                    style={{ accentColor: effectiveAccentColor }}
                    className="mr-2 rounded border-slate-300 cursor-default w-4 h-4"
                  />
                );
              }
              return <input {...props} />;
            },
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
};
