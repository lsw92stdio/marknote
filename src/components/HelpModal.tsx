import React, { useState } from 'react';
import {
  HelpCircle,
  X,
  FileText,
  Keyboard,
  Sparkles,
  Cloud,
  Download,
  Palette,
  CheckSquare,
  Quote,
  Code2,
  Table,
} from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  accentColor?: string;
}

export const HelpModal: React.FC<HelpModalProps> = ({
  isOpen,
  onClose,
  isDark,
  accentColor = '#2563eb',
}) => {
  const [activeTab, setActiveTab] = useState<'markdown' | 'shortcuts' | 'features'>('markdown');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div
        className={`w-full max-w-2xl rounded-2xl shadow-2xl border overflow-hidden flex flex-col max-h-[85vh] ${
          isDark
            ? 'bg-neutral-950 border-neutral-800 text-neutral-100'
            : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-neutral-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: accentColor }}
            >
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base leading-tight">마크다운 에디터 사용 도움말</h2>
              <p className="text-[11px] text-slate-500 dark:text-neutral-400">
                작성 문법, 단축키 및 주요 기능 안내
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-900 px-4 pt-2 gap-2 text-xs shrink-0">
          <button
            onClick={() => setActiveTab('markdown')}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-semibold transition-all ${
              activeTab === 'markdown'
                ? 'border-transparent text-slate-900 dark:text-white'
                : 'border-transparent text-slate-500 dark:text-neutral-400 hover:text-slate-800 dark:hover:text-neutral-200'
            }`}
            style={
              activeTab === 'markdown'
                ? { borderBottomColor: accentColor, color: accentColor }
                : {}
            }
          >
            <FileText className="w-3.5 h-3.5" />
            <span>마크다운 문법</span>
          </button>

          <button
            onClick={() => setActiveTab('shortcuts')}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-semibold transition-all ${
              activeTab === 'shortcuts'
                ? 'border-transparent text-slate-900 dark:text-white'
                : 'border-transparent text-slate-500 dark:text-neutral-400 hover:text-slate-800 dark:hover:text-neutral-200'
            }`}
            style={
              activeTab === 'shortcuts'
                ? { borderBottomColor: accentColor, color: accentColor }
                : {}
            }
          >
            <Keyboard className="w-3.5 h-3.5" />
            <span>단축키 안내</span>
          </button>

          <button
            onClick={() => setActiveTab('features')}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-semibold transition-all ${
              activeTab === 'features'
                ? 'border-transparent text-slate-900 dark:text-white'
                : 'border-transparent text-slate-500 dark:text-neutral-400 hover:text-slate-800 dark:hover:text-neutral-200'
            }`}
            style={
              activeTab === 'features'
                ? { borderBottomColor: accentColor, color: accentColor }
                : {}
            }
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>주요 기능</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
          {activeTab === 'markdown' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Headers */}
                <div className="p-3 rounded-xl border border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/50 space-y-1.5">
                  <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs">
                    <FileText className="w-3.5 h-3.5" style={{ color: accentColor }} />
                    <span>제목 (Headings)</span>
                  </h3>
                  <pre className="p-2 rounded bg-slate-100 dark:bg-black font-mono text-[11px] text-slate-700 dark:text-neutral-300">
{`# 큰 제목 (H1)
## 중간 제목 (H2)
### 작은 제목 (H3)`}
                  </pre>
                </div>

                {/* Text Formatting */}
                <div className="p-3 rounded-xl border border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/50 space-y-1.5">
                  <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs">
                    <Sparkles className="w-3.5 h-3.5" style={{ color: accentColor }} />
                    <span>글자 서식</span>
                  </h3>
                  <pre className="p-2 rounded bg-slate-100 dark:bg-black font-mono text-[11px] text-slate-700 dark:text-neutral-300">
{`**굵은 글씨 (Bold)**
*기울임 (Italic)*
~~취소선 (Strikethrough)~~`}
                  </pre>
                </div>

                {/* Blockquotes */}
                <div className="p-3 rounded-xl border border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/50 space-y-1.5">
                  <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs">
                    <Quote className="w-3.5 h-3.5" style={{ color: accentColor }} />
                    <span>인용구 (Blockquote &gt;)</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-neutral-400">
                    문장 맨 앞에 <code className="font-mono bg-slate-200 dark:bg-neutral-800 px-1 rounded">&gt;</code>를 입력하면 테마 포인트 색상 라인이 적용됩니다.
                  </p>
                  <pre className="p-2 rounded bg-slate-100 dark:bg-black font-mono text-[11px] text-slate-700 dark:text-neutral-300">
{`> 중요 인용문이나 강조 노트 작성`}
                  </pre>
                </div>

                {/* Task Lists / Checkboxes */}
                <div className="p-3 rounded-xl border border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/50 space-y-1.5">
                  <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs">
                    <CheckSquare className="w-3.5 h-3.5" style={{ color: accentColor }} />
                    <span>체크리스트 (Task Lists)</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-neutral-400">
                    체크박스 선택 시 설정한 테마 포인트 색상으로 채워집니다.
                  </p>
                  <pre className="p-2 rounded bg-slate-100 dark:bg-black font-mono text-[11px] text-slate-700 dark:text-neutral-300">
{`- [ ] 미완료 항목
- [x] 완료된 항목`}
                  </pre>
                </div>

                {/* Code Block */}
                <div className="p-3 rounded-xl border border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/50 space-y-1.5">
                  <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs">
                    <Code2 className="w-3.5 h-3.5" style={{ color: accentColor }} />
                    <span>코드 블록 & 구문 강조</span>
                  </h3>
                  <pre className="p-2 rounded bg-slate-100 dark:bg-black font-mono text-[11px] text-slate-700 dark:text-neutral-300">
{`\`\`\`javascript
const greeting = "Hello World";
console.log(greeting);
\`\`\``}
                  </pre>
                </div>

                {/* Tables & Math */}
                <div className="p-3 rounded-xl border border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/50 space-y-1.5">
                  <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs">
                    <Table className="w-3.5 h-3.5" style={{ color: accentColor }} />
                    <span>표 (Table) & LaTeX 수식</span>
                  </h3>
                  <pre className="p-2 rounded bg-slate-100 dark:bg-black font-mono text-[11px] text-slate-700 dark:text-neutral-300">
{`| 항목 | 상태 |
| --- | --- |
| 작업 | 완료 |

수식: $E = mc^2$` }
                  </pre>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'shortcuts' && (
            <div className="space-y-3">
              <div className="rounded-xl border border-slate-200 dark:border-neutral-800 overflow-hidden divide-y divide-slate-200 dark:divide-neutral-800">
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-neutral-900">
                  <span className="font-medium">문서 저장 (자동 저장 기본 탑재)</span>
                  <kbd className="px-2 py-1 rounded bg-white dark:bg-black border border-slate-300 dark:border-neutral-700 font-mono text-[11px] shadow-xs">
                    Ctrl + S / Cmd + S
                  </kbd>
                </div>

                <div className="flex items-center justify-between p-3">
                  <span className="font-medium">굵은 글씨 (Bold)</span>
                  <kbd className="px-2 py-1 rounded bg-slate-100 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 font-mono text-[11px]">
                    Ctrl + B / Cmd + B
                  </kbd>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-neutral-900">
                  <span className="font-medium">기울임 글씨 (Italic)</span>
                  <kbd className="px-2 py-1 rounded bg-white dark:bg-black border border-slate-300 dark:border-neutral-700 font-mono text-[11px]">
                    Ctrl + I / Cmd + I
                  </kbd>
                </div>

                <div className="flex items-center justify-between p-3">
                  <span className="font-medium">웹 링크 삽입 (Link)</span>
                  <kbd className="px-2 py-1 rounded bg-slate-100 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 font-mono text-[11px]">
                    Ctrl + K / Cmd + K
                  </kbd>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-neutral-900">
                  <span className="font-medium">줄 바꿈 (Line Break)</span>
                  <kbd className="px-2 py-1 rounded bg-white dark:bg-black border border-slate-300 dark:border-neutral-700 font-mono text-[11px]">
                    Shift + Enter
                  </kbd>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'features' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/50 space-y-1">
                  <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold">
                    <Palette className="w-4 h-4" style={{ color: accentColor }} />
                    <span>앱 메인 테마 색상 지정</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-neutral-400 leading-relaxed">
                    상단 '스타일 커스텀' 버튼을 눌러 앱 메인 포인트 색상을 지정하면 결과물 문구, 버튼, 목차, 인용구 및 체크박스까지 실시간 연동됩니다.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/50 space-y-1">
                  <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold">
                    <Cloud className="w-4 h-4 text-emerald-500" />
                    <span>Google Drive 클라우드 연동</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-neutral-400 leading-relaxed">
                    Google 계정으로 연결하면 작성 중인 문서들이 내 드라이브로 동기화되어 어느 기기에서나 안전하게 이어쓸 수 있습니다.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/50 space-y-1">
                  <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold">
                    <Download className="w-4 h-4 text-purple-500" />
                    <span>다양한 파일 내보내기</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-neutral-400 leading-relaxed">
                    작성한 문서를 .md 원본, 일반 텍스트(.txt), 단독 실행형 HTML웹페이지, 또는 PNG/JPEG 고해상도 이미지 파일로 바로 저장할 수 있습니다.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/50 space-y-1">
                  <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold">
                    <FileText className="w-4 h-4 text-amber-500" />
                    <span>자동 목차(TOC) 기능</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-neutral-400 leading-relaxed">
                    문서 내 H1~H6 제목 태그를 자동으로 수집하여 우측 하단에 인터랙티브 목차를 제공합니다.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-neutral-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="py-1.5 px-4 rounded-lg text-white font-semibold text-xs transition-opacity hover:opacity-90 shadow-xs"
            style={{ backgroundColor: accentColor }}
          >
            확인 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
};
