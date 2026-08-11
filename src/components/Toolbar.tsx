import React from 'react';
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  ListTodo,
  Quote,
  Code,
  SquareCode,
  Link,
  Image,
  Table,
  Minus,
  Sigma,
  Undo,
  Redo,
} from 'lucide-react';

interface ToolbarProps {
  onInsert: (prefix: string, suffix?: string, defaultText?: string) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onInsert,
  onUndo,
  onRedo,
  canUndo = true,
  canRedo = true,
}) => {
  const tools = [
    {
      icon: Bold,
      title: '굵게 (Ctrl+B)',
      action: () => onInsert('**', '**', '강조 텍스트'),
    },
    {
      icon: Italic,
      title: '기울임 (Ctrl+I)',
      action: () => onInsert('*', '*', '기울임 텍스트'),
    },
    {
      icon: Strikethrough,
      title: '취소선',
      action: () => onInsert('~~', '~~', '취소선 텍스트'),
    },
    { type: 'divider' },
    {
      icon: Heading1,
      title: '제목 1',
      action: () => onInsert('# ', '', '제목 1'),
    },
    {
      icon: Heading2,
      title: '제목 2',
      action: () => onInsert('## ', '', '제목 2'),
    },
    {
      icon: Heading3,
      title: '제목 3',
      action: () => onInsert('### ', '', '제목 3'),
    },
    { type: 'divider' },
    {
      icon: List,
      title: '글머리 기호 목록',
      action: () => onInsert('- ', '', '목록 항목'),
    },
    {
      icon: ListOrdered,
      title: '번호 목록',
      action: () => onInsert('1. ', '', '목록 항목'),
    },
    {
      icon: ListTodo,
      title: '체크리스트',
      action: () => onInsert('- [ ] ', '', '할 일 항목'),
    },
    { type: 'divider' },
    {
      icon: Quote,
      title: '인용구',
      action: () => onInsert('> ', '', '인용구 텍스트'),
    },
    {
      icon: Code,
      title: '인라인 코드',
      action: () => onInsert('`', '`', 'code'),
    },
    {
      icon: SquareCode,
      title: '코드 블록',
      action: () => onInsert('```typescript\n', '\n```', '// 코드를 입력하세요'),
    },
    {
      icon: Link,
      title: '링크 삽입',
      action: () => onInsert('[', '](https://example.com)', '링크 텍스트'),
    },
    {
      icon: Image,
      title: '이미지 삽입',
      action: () => onInsert('![이미지 설명](', ')', 'https://picsum.photos/600/400'),
    },
    {
      icon: Table,
      title: '표 삽입',
      action: () =>
        onInsert(
          '| 헤더 1 | 헤더 2 |\n| :--- | :--- |\n| 내용 1 | 내용 2 |\n'
        ),
    },
    {
      icon: Sigma,
      title: '수식 (LaTeX)',
      action: () => onInsert('$$\n', '\n$$', 'E = mc^2'),
    },
    {
      icon: Minus,
      title: '구분선',
      action: () => onInsert('\n---\n'),
    },
  ];

  return (
    <div className="flex items-center gap-1 p-2 overflow-x-auto whitespace-nowrap bg-slate-50 dark:bg-black border-b border-slate-200 dark:border-neutral-800 text-slate-700 dark:text-neutral-300 select-none scrollbar-none touch-pan-x shrink-0">
      {onUndo && (
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="p-1.5 shrink-0 rounded hover:bg-slate-200 dark:hover:bg-neutral-800 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
          title="실행 취소 (Ctrl+Z)"
        >
          <Undo className="w-4 h-4" />
        </button>
      )}

      {onRedo && (
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="p-1.5 shrink-0 rounded hover:bg-slate-200 dark:hover:bg-neutral-800 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
          title="다시 실행 (Ctrl+Y)"
        >
          <Redo className="w-4 h-4" />
        </button>
      )}

      <div className="w-px h-4 shrink-0 bg-slate-300 dark:bg-neutral-800 mx-1" />

      {tools.map((tool, idx) => {
        if (tool.type === 'divider') {
          return <div key={`div-${idx}`} className="w-px h-4 shrink-0 bg-slate-300 dark:bg-neutral-800 mx-1" />;
        }

        const IconComponent = tool.icon!;
        return (
          <button
            key={tool.title}
            onClick={tool.action}
            className="p-1.5 shrink-0 rounded hover:bg-slate-200 dark:hover:bg-neutral-800 transition-colors"
            title={tool.title}
          >
            <IconComponent className="w-4 h-4" />
          </button>
        );
      })}
    </div>
  );
};
