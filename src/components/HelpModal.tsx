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
  Link2,
  ListTree,
  Settings,
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
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
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
                  <span className="font-medium">줄 바꿈 (같은 문단 내 강제 개행)</span>
                  <kbd className="px-2 py-1 rounded bg-white dark:bg-black border border-slate-300 dark:border-neutral-700 font-mono text-[11px]">
                    Shift + Enter
                  </kbd>
                </div>

                <div className="flex items-center justify-between p-3">
                  <span className="font-medium">실행 취소 (Undo)</span>
                  <kbd className="px-2 py-1 rounded bg-slate-100 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 font-mono text-[11px]">
                    Ctrl + Z / Cmd + Z
                  </kbd>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-neutral-900">
                  <span className="font-medium">다시 실행 (Redo)</span>
                  <kbd className="px-2 py-1 rounded bg-white dark:bg-black border border-slate-300 dark:border-neutral-700 font-mono text-[11px]">
                    Ctrl + Shift + Z / Ctrl + Y
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
                    별도 설정 없이 사이드바의 'Google Drive' 버튼만 누르면 각자 자기 계정으로 로그인해 자기 드라이브에 저장됩니다. 폴더 구성과 즐겨찾기 상태까지 함께 동기화되어 다른 기기에서도 그대로 이어집니다.
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
                    <ListTree className="w-4 h-4 text-amber-500" />
                    <span>클릭 이동 목차(TOC)</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-neutral-400 leading-relaxed">
                    문서 내 #, ##, ### 제목을 자동 수집해 목차 위젯으로 보여주고, 항목을 클릭하면 해당 위치로 바로 이동합니다. 설정에서 켜기/끄기와 화면 위치(4모서리)를 바꿀 수 있습니다.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/50 space-y-1">
                  <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold">
                    <Link2 className="w-4 h-4 text-sky-500" />
                    <span>같이보기 스크롤 동기화</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-neutral-400 leading-relaxed">
                    같이보기 모드에서 에디터와 미리보기 스크롤이 함께 움직입니다. 설정에서 언제든 끄고 켤 수 있습니다.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/50 space-y-1">
                  <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold">
                    <Settings className="w-4 h-4 text-slate-500" />
                    <span>설정 패널</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-neutral-400 leading-relaxed">
                    상단 '설정' 버튼에서 Google Drive 연결 상태 확인, 스크롤 동기화, 목차 켜기/끄기 및 위치를 한곳에서 관리할 수 있습니다.
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
