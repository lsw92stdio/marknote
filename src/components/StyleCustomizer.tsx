import React from 'react';
import { X, Palette, Type, Sparkles, RefreshCw } from 'lucide-react';
import { PreviewStyleConfig } from '../types';
import { getEffectiveAccentColor } from '../utils/colorUtils';

interface StyleCustomizerProps {
  styleConfig: PreviewStyleConfig;
  onChangeStyleConfig: (newConfig: PreviewStyleConfig) => void;
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
}

const BOLD_COLOR_PRESETS = [
  { name: '레드', hex: '#ef4444' },
  { name: '블루', hex: '#3b82f6' },
  { name: '에메랄드', hex: '#10b981' },
  { name: '바이올렛', hex: '#8b5cf6' },
  { name: '핑크', hex: '#ec4899' },
  { name: '앰버 골드', hex: '#f59e0b' },
  { name: '시안', hex: '#06b6d4' },
  { name: '블랙/화이트', hex: '#020617' },
];

export const StyleCustomizer: React.FC<StyleCustomizerProps> = ({
  styleConfig,
  onChangeStyleConfig,
  isOpen,
  onClose,
  isDark,
}) => {
  if (!isOpen) return null;

  const updateField = <K extends keyof PreviewStyleConfig>(
    key: K,
    val: PreviewStyleConfig[K]
  ) => {
    onChangeStyleConfig({ ...styleConfig, [key]: val });
  };

  const handleResetDefaults = () => {
    onChangeStyleConfig({
      boldColor: '#ef4444',
      linkColor: '#ef4444',
      headingColor: 'default',
      fontFamily: 'sans',
      codeTheme: 'github-dark',
      fontSize: 'base',
      lineHeight: 'normal',
      enableBoldColor: true,
      enableBoldBg: true,
      accentHeadings: true,
      accentTable: true,
      accentHr: true,
    });
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-md h-full flex flex-col shadow-2xl border-l ${
          isDark
            ? 'bg-neutral-950 border-neutral-800 text-neutral-100'
            : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-pink-500" />
            <h2 className="font-bold text-base">결과물 스타일 & 색상 커스텀</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-neutral-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Customizer Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs">
          {/* Section 1: Main Theme / Accent Color */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/40 space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>앱 메인 및 테마 포인트 색상</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-slate-400 dark:text-neutral-500 uppercase">
                  {styleConfig.boldColor}
                </span>
                <input
                  type="color"
                  value={styleConfig.boldColor}
                  onChange={(e) => updateField('boldColor', e.target.value)}
                  className="w-7 h-7 rounded-lg border border-slate-300 dark:border-neutral-700 cursor-pointer p-0.5 bg-white dark:bg-neutral-800"
                  title="직접 색상 선택"
                />
              </div>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-neutral-400 leading-normal">
              선택한 테마 색상은 앱 상단 주 버튼과 아이콘 포인트, 문서 강조 요소에 공통으로 동기화됩니다.
            </p>


            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1">
              {BOLD_COLOR_PRESETS.map((preset) => {
                const swatchColor = getEffectiveAccentColor(preset.hex, isDark);
                return (
                  <button
                    key={preset.hex}
                    onClick={() => updateField('boldColor', preset.hex)}
                    className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg border text-[11px] font-medium transition-all ${
                      styleConfig.boldColor === preset.hex
                        ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold shadow-2xs'
                        : 'border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-slate-300 dark:hover:border-neutral-700'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs border border-black/10 dark:border-white/10"
                      style={{ backgroundColor: swatchColor }}
                    />
                    <span className="whitespace-nowrap text-[10.5px]">{preset.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Accent Target Toggles */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs">
                <Sparkles className="w-3.5 h-3.5" style={{ color: styleConfig.boldColor }} />
                <span>테마 색상 적용 대상 선택 (확장 옵션)</span>
              </label>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-neutral-400">
              결과물 문서 내의 어떤 요소들에 포인트 테마 색상을 적용할지 선택합니다.
            </p>

            <div className="grid grid-cols-1 gap-2">
              <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 hover:bg-slate-50 dark:hover:bg-neutral-900 transition-colors cursor-pointer">
                <span className="font-medium text-slate-800 dark:text-neutral-200 text-[11.5px]">
                  본문 굵은 글씨(**bold**)에 테마 색상 적용
                </span>
                <input
                  type="checkbox"
                  checked={styleConfig.enableBoldColor ?? true}
                  onChange={(e) => updateField('enableBoldColor', e.target.checked)}
                  style={{ accentColor: styleConfig.boldColor }}
                  className="w-4 h-4 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 hover:bg-slate-50 dark:hover:bg-neutral-900 transition-colors cursor-pointer">
                <span className="font-medium text-slate-800 dark:text-neutral-200 text-[11.5px]">
                  강조 문구에 형광펜(배경색) 효과 적용
                </span>
                <input
                  type="checkbox"
                  checked={styleConfig.enableBoldBg ?? true}
                  onChange={(e) => updateField('enableBoldBg', e.target.checked)}
                  style={{ accentColor: styleConfig.boldColor }}
                  className="w-4 h-4 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 hover:bg-slate-50 dark:hover:bg-neutral-900 transition-colors cursor-pointer">
                <span className="font-medium text-slate-800 dark:text-neutral-200 text-[11.5px]">
                  타이틀(#, ##, ###)에 테마 색상 적용
                </span>
                <input
                  type="checkbox"
                  checked={styleConfig.accentHeadings ?? true}
                  onChange={(e) => updateField('accentHeadings', e.target.checked)}
                  style={{ accentColor: styleConfig.boldColor }}
                  className="w-4 h-4 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 hover:bg-slate-50 dark:hover:bg-neutral-900 transition-colors cursor-pointer">
                <span className="font-medium text-slate-800 dark:text-neutral-200 text-[11.5px]">
                  표(Table) 헤더 & 테두리에 테마 색상 틴트 적용
                </span>
                <input
                  type="checkbox"
                  checked={styleConfig.accentTable ?? true}
                  onChange={(e) => updateField('accentTable', e.target.checked)}
                  style={{ accentColor: styleConfig.boldColor }}
                  className="w-4 h-4 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 hover:bg-slate-50 dark:hover:bg-neutral-900 transition-colors cursor-pointer">
                <span className="font-medium text-slate-800 dark:text-neutral-200 text-[11.5px]">
                  구분선(---)에 테마 색상 라인 적용
                </span>
                <input
                  type="checkbox"
                  checked={styleConfig.accentHr ?? true}
                  onChange={(e) => updateField('accentHr', e.target.checked)}
                  style={{ accentColor: styleConfig.boldColor }}
                  className="w-4 h-4 rounded cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Section 3: Font Family */}
          <div className="space-y-2.5 pt-3 border-t border-slate-200 dark:border-neutral-800">
            <label className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs">
              <Type className="w-3.5 h-3.5 text-blue-500" />
              <span>본문 폰트 종류</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => updateField('fontFamily', 'sans')}
                className={`py-2 px-3 rounded-lg border font-sans text-center transition-all ${
                  styleConfig.fontFamily === 'sans'
                    ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold shadow-2xs'
                    : 'border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900'
                }`}
              >
                고딕 (Sans)
              </button>
              <button
                onClick={() => updateField('fontFamily', 'serif')}
                className={`py-2 px-3 rounded-lg border font-serif text-center transition-all ${
                  styleConfig.fontFamily === 'serif'
                    ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold shadow-2xs'
                    : 'border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900'
                }`}
              >
                명조 (Serif)
              </button>
              <button
                onClick={() => updateField('fontFamily', 'mono')}
                className={`py-2 px-3 rounded-lg border font-mono text-center transition-all ${
                  styleConfig.fontFamily === 'mono'
                    ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold shadow-2xs'
                    : 'border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900'
                }`}
              >
                고정폭 (Mono)
              </button>
            </div>
          </div>

          {/* Section 4: Font Size & Line Height */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200 dark:border-neutral-800">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-900 dark:text-white block text-xs">글자 크기</label>
              <select
                value={styleConfig.fontSize}
                onChange={(e) => updateField('fontSize', e.target.value as any)}
                className="w-full p-2 rounded-lg bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
              >
                <option value="sm">작게 (14px)</option>
                <option value="base">보통 (16px)</option>
                <option value="lg">크게 (18px)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-900 dark:text-white block text-xs">줄 간격</label>
              <select
                value={styleConfig.lineHeight}
                onChange={(e) => updateField('lineHeight', e.target.value as any)}
                className="w-full p-2 rounded-lg bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
              >
                <option value="tight">조밀하게</option>
                <option value="normal">보통</option>
                <option value="relaxed">넓게</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-neutral-800 flex items-center">
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-neutral-200 font-medium"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>기본값 복원</span>
          </button>
        </div>
      </div>
    </div>
  );
};
