import React, { useState } from 'react';
import {
  X,
  FileCode,
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  Download,
  Check,
  Loader2,
} from 'lucide-react';
import { PreviewStyleConfig } from '../types';
import {
  exportAsMarkdown,
  exportAsText,
  exportAsHtml,
  exportAsImage,
} from '../utils/fileUtils';

interface ExportModalProps {
  fileName: string;
  content: string;
  styleConfig: PreviewStyleConfig;
  isDark: boolean;
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  fileName,
  content,
  styleConfig,
  isDark,
  isOpen,
  onClose,
}) => {
  const [isExportingImage, setIsExportingImage] = useState(false);
  const [exportSuccessMsg, setExportSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const showSuccess = (msg: string) => {
    setExportSuccessMsg(msg);
    setTimeout(() => {
      setExportSuccessMsg(null);
      onClose();
    }, 1500);
  };

  const handleExportMd = () => {
    exportAsMarkdown(fileName, content);
    showSuccess('.md 파일로 저장되었습니다.');
  };

  const handleExportTxt = () => {
    exportAsText(fileName, content);
    showSuccess('.txt 파일로 저장되었습니다.');
  };

  const handleExportHtml = () => {
    const previewEl = document.querySelector('.markdown-preview-content');
    const renderedHtml = previewEl ? previewEl.innerHTML : content;
    exportAsHtml(fileName, renderedHtml, fileName, styleConfig, isDark);
    showSuccess('.html 파일로 저장되었습니다.');
  };

  const handleExportPng = async () => {
    try {
      setIsExportingImage(true);
      await exportAsImage('markdown-preview-container', fileName, 'png', isDark);
      showSuccess('PNG 이미지로 내보냈습니다.');
    } catch (err: any) {
      alert(`이미지 생성 오류: ${err?.message || '알 수 없는 오류'}`);
    } finally {
      setIsExportingImage(false);
    }
  };

  const handleExportJpeg = async () => {
    try {
      setIsExportingImage(true);
      await exportAsImage('markdown-preview-container', fileName, 'jpeg', isDark);
      showSuccess('JPEG 이미지로 내보냈습니다.');
    } catch (err: any) {
      alert(`이미지 생성 오류: ${err?.message || '알 수 없는 오류'}`);
    } finally {
      setIsExportingImage(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div
        className={`w-full max-w-md rounded-2xl shadow-2xl border overflow-hidden ${
          isDark
            ? 'bg-neutral-950 border-neutral-800 text-neutral-100'
            : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="font-bold text-base">문서 내보내기</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-neutral-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {exportSuccessMsg ? (
            <div className="py-8 flex flex-col items-center justify-center space-y-2 text-emerald-500">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <Check className="w-6 h-6" />
              </div>
              <p className="font-bold text-sm">{exportSuccessMsg}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2.5">
              {/* Markdown File */}
              <button
                onClick={handleExportMd}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-neutral-800 hover:border-slate-400 dark:hover:border-neutral-600 hover:bg-slate-50 dark:hover:bg-neutral-900 transition-all group text-left"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-white"
                    style={{ backgroundColor: styleConfig.boldColor }}
                  >
                    <FileCode className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-slate-900 dark:text-white">
                      마크다운 파일 (.md)
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-neutral-400">
                      원본 마크다운 소스 텍스트 저장
                    </p>
                  </div>
                </div>
                <Download className="w-4 h-4 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-neutral-200" />
              </button>

              {/* Text File */}
              <button
                onClick={handleExportTxt}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-neutral-800 hover:border-slate-400 dark:hover:border-neutral-600 hover:bg-slate-50 dark:hover:bg-neutral-900 transition-all group text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-slate-900 dark:text-white">
                      일반 텍스트 (.txt)
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-neutral-400">
                      호환성이 높은 플레인 텍스트 문맥
                    </p>
                  </div>
                </div>
                <Download className="w-4 h-4 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-neutral-200" />
              </button>

              {/* HTML Webpage */}
              <button
                onClick={handleExportHtml}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-neutral-800 hover:border-slate-400 dark:hover:border-neutral-600 hover:bg-slate-50 dark:hover:bg-neutral-900 transition-all group text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-slate-900 dark:text-white">
                      웹페이지 파일 (.html)
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-neutral-400">
                      설정한 강조 색상이 적용된 단독 HTML
                    </p>
                  </div>
                </div>
                <Download className="w-4 h-4 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-neutral-200" />
              </button>

              {/* PNG / JPEG Image */}
              <div className="p-3 rounded-xl border border-slate-200 dark:border-neutral-800 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-pink-500/10 text-pink-600 flex items-center justify-center shrink-0">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-slate-900 dark:text-white">
                      이미지 파일로 내보내기 (PNG / JPEG)
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-neutral-400">
                      현재 결과물 미리보기 화면을 고해상도 이미지로 저장
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={handleExportPng}
                    disabled={isExportingImage}
                    className="py-1.5 px-3 rounded-lg bg-slate-100 dark:bg-neutral-900 hover:bg-slate-200 dark:hover:bg-neutral-800 text-slate-800 dark:text-neutral-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    {isExportingImage ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Download className="w-3.5 h-3.5" />
                    )}
                    <span>PNG 내보내기</span>
                  </button>

                  <button
                    onClick={handleExportJpeg}
                    disabled={isExportingImage}
                    className="py-1.5 px-3 rounded-lg bg-slate-100 dark:bg-neutral-900 hover:bg-slate-200 dark:hover:bg-neutral-800 text-slate-800 dark:text-neutral-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    {isExportingImage ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Download className="w-3.5 h-3.5" />
                    )}
                    <span>JPEG 내보내기</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
