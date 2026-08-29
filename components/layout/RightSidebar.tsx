

import React, { useState } from "react";
import {
  FileText,
  Copy,
  FileSpreadsheet,
  FileType,
  Printer,
  ChevronLeft,
  ChevronRight,
  Download,
} from "../icons";
import { Button } from "../ui/Button";
import { useTheme } from "../../hooks/useTheme";
import { useToast } from "../../hooks/useToast";
import { useSettings } from "../../hooks/useSettings";
import { useI18n } from "../../hooks/useI18n";
import { exportToDocx, exportToDoc } from "../../utils/docxExporter";
import { exportMatrixToExcel } from "../../utils/excelExporter";
import { generateAutoFilename } from "../../utils/filenameUtils";

export default function RightSidebar() {
  const [open, setOpen] = useState(() => {
    try {
      const saved = localStorage.getItem('examgen_right_sidebar_open');
      return saved !== null ? JSON.parse(saved) : true;
    } catch (e) {
      return true;
    }
  });

  const toggleSidebar = () => {
    setOpen((prevOpen: boolean) => {
      const nextOpen = !prevOpen;
      try {
        localStorage.setItem('examgen_right_sidebar_open', JSON.stringify(nextOpen));
      } catch (e) {}
      return nextOpen;
    });
  };

  const { theme } = useTheme();
  const { addToast } = useToast();
  const { settings } = useSettings();
  const { t } = useI18n();

  const sanitize = (str: string) => {
    if (!str) return '';
    return str
      .replace(/\s+/g, '_') // replace spaces with underscores
      .replace(/[\\/:"*?<>|]/g, '-'); // replace invalid filename characters
  };

  const generateFilename = (descriptor: string) => {
    return generateAutoFilename({
      docType: descriptor,
      subject: settings.subject,
      grade: settings.grade,
      examType: settings.examType,
      schoolYear: settings.year,
    });
  };

  const getActiveContentElement = (): HTMLElement | null => {
    return document.getElementById('printable-content');
  };

  const downloadFile = (filename: string, content: string, mimeType: string) => {
    const isTextBased = mimeType.startsWith('text/') || mimeType.includes('csv');
    const contentWithBOM = isTextBased ? '\uFEFF' + content : content;
    const blob = new Blob([contentWithBOM], { type: `${mimeType};charset=utf-8;` });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  const htmlTableToCsv = (tableEl: HTMLTableElement): string | null => {
    if (!tableEl) return null;
    const rows = Array.from(tableEl.querySelectorAll('tr'));
    return rows.map(row => {
      const cells = Array.from(row.querySelectorAll<HTMLElement>('th, td'));
      return cells.map(cell => {
        let text = cell.innerText.replace(/"/g, '""').replace(/\n/g, " ");
        if (text.includes(',')) {
          text = `"${text}"`;
        }
        return text;
      }).join(',');
    }).join('\n');
  };
  
  const handleNotImplemented = () => {
    addToast(t('rightSidebar.notImplemented', "Tính năng này đang được phát triển."));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    const contentEl = getActiveContentElement();
    const previewEl = contentEl?.querySelector('[data-doc-type]');
    const exportContentEl = previewEl || contentEl;

    if (exportContentEl) {
      // FIX: Cast exportContentEl to HTMLElement to access the 'innerText' property.
      navigator.clipboard.writeText((exportContentEl as HTMLElement).innerText).then(() => {
        addToast(t('toasts.copiedToClipboard', "Đã sao chép nội dung vào clipboard."));
      }).catch(err => {
        addToast(t('toasts.copyError', "Lỗi: Không thể sao chép nội dung."));
        console.error('Could not copy text: ', err);
      });
    } else {
      addToast(t('toasts.noContentToCopy', "Không tìm thấy nội dung để sao chép."));
    }
  };

  const handleExportDocx = async () => {
    const contentEl = getActiveContentElement();
    if (contentEl) {
      const previewEl = contentEl.querySelector('[data-doc-type]');
      const descriptor = previewEl?.getAttribute('data-doc-type') || 'TaiLieu';
      const htmlContent = previewEl?.innerHTML || contentEl.innerHTML;
      const filename = generateFilename(descriptor);
      
      addToast(t('toasts.exportingFile', 'Đang xuất file {fileType}...', { fileType: '.DOCX' }));
      try {
        await exportToDocx(htmlContent, { filename, title: descriptor });
      } catch (err) {
        console.error('Error generating .docx file, falling back to .doc:', err);
        exportToDoc(htmlContent, filename);
      }
    } else {
      addToast(t('toasts.exportError', "Không tìm thấy nội dung để xuất file."));
    }
  };

  const handleExportDoc = () => {
    const contentEl = getActiveContentElement();
    if (contentEl) {
      const previewEl = contentEl.querySelector('[data-doc-type]');
      const descriptor = previewEl?.getAttribute('data-doc-type') || 'TaiLieu';
      const htmlContent = previewEl?.innerHTML || contentEl.innerHTML;
      const filename = generateFilename(descriptor);
      
      addToast(t('toasts.exportingFile', 'Đang xuất file {fileType}...', { fileType: '.DOC' }));
      exportToDoc(htmlContent, filename);
    } else {
      addToast(t('toasts.exportError', "Không tìm thấy nội dung để xuất file."));
    }
  };

  const handleExportXlsx = () => {
    const contentEl = getActiveContentElement();
    const previewEl = contentEl?.querySelector('[data-doc-type*="MaTrận"], [data-doc-type*="BaoCao"]') || contentEl?.querySelector('[data-doc-type]');
    const targetEl = previewEl || contentEl;
    const tableEl = targetEl?.querySelector('table');
    
    if (tableEl || targetEl) {
      let descriptor = 'MaTran_DeThi';
      if (previewEl) {
        descriptor = previewEl.getAttribute('data-doc-type') || descriptor;
      }
      const filename = generateFilename(descriptor);
      addToast(t('toasts.exportingFile', 'Đang xuất file {fileType}...', { fileType: '.XLSX' }));

      exportMatrixToExcel(tableEl || (targetEl as HTMLElement), {
        filename,
        sheetName: 'MaTrận',
      });
    } else {
      addToast(t('toasts.exportNoTableError', "Không tìm thấy ma trận/bảng để xuất file."));
    }
  };
  
  const handleExport = (format: 'md' | 'txt' | 'rtf' | 'csv') => {
      const contentEl = getActiveContentElement();
      if (!contentEl) {
          addToast(t('toasts.exportError', "Không tìm thấy nội dung để xuất file."));
          return;
      }
      
      const previewEl = contentEl.querySelector('[data-doc-type]');
      const exportContentEl = previewEl || contentEl;
      const descriptor = previewEl?.getAttribute('data-doc-type') || 'NoiDung';
      
      // FIX: Cast exportContentEl to HTMLElement to access the 'innerText' property.
      let content = (exportContentEl as HTMLElement).innerText;
      let mimeType = 'text/plain';
      let fileDescriptor = descriptor;

      switch (format) {
          case 'md':
              mimeType = 'text/markdown';
              break;
          case 'txt':
              break;
          case 'rtf':
              // FIX: Cast exportContentEl to HTMLElement to access the 'innerText' property.
              content = `{\\rtf1\\ansi\\deff0 {\\fonttbl{\\f0 Times New Roman;}} \\fs24 ${(exportContentEl as HTMLElement).innerText.replace(/\n/g, '\\par ')}}`;
              mimeType = 'application/rtf';
              break;
          case 'csv':
              const tableEl = exportContentEl.querySelector('table');
              if (tableEl) {
                  const csvContent = htmlTableToCsv(tableEl);
                  if (csvContent) {
                      content = csvContent;
                      mimeType = 'text/csv';
                      fileDescriptor = `Bang_${descriptor}`;
                  } else {
                      addToast(t('toasts.exportTableToCsvError', "Không thể chuyển đổi bảng thành CSV."));
                      return;
                  }
              } else {
                  addToast(t('toasts.exportNoTableError', "Không tìm thấy bảng để xuất CSV."));
                  return;
              }
              break;
      }
      const filenameBase = generateFilename(fileDescriptor);
      downloadFile(`${filenameBase}.${format}`, content, mimeType);
      addToast(t('toasts.exportingFile', 'Đang xuất file {fileType}...', { fileType: `.${format.toUpperCase()}` }));
  };

  const handleOneClickExport = async () => {
    addToast(t('toasts.oneClickExportStarted', "Bắt đầu quá trình xuất đa định dạng..."));

    const contentEl = getActiveContentElement();
    if (!contentEl) {
        addToast(t('toasts.exportError', "Không tìm thấy nội dung để xuất file."));
        return;
    }

    // A small delay to allow the first toast to show
    await new Promise(resolve => setTimeout(resolve, 300));

    // 1. Export as DOC
    handleExportDocx();
    await new Promise(resolve => setTimeout(resolve, 800)); // Delay between downloads

    // 2. Export as TXT
    handleExport('txt');
    await new Promise(resolve => setTimeout(resolve, 800));

    // 3. Export as CSV (if applicable)
    const previewEl = contentEl.querySelector('[data-doc-type]');
    const tableEl = previewEl?.querySelector('table') || contentEl?.querySelector('table');
    if (tableEl) {
        handleExportXlsx();
        await new Promise(resolve => setTimeout(resolve, 800));
    }
    
    // 4. Trigger Print to PDF
    addToast(t('toasts.oneClickExportPdf', "Mở hộp thoại In để lưu dưới dạng PDF."));
    await new Promise(resolve => setTimeout(resolve, 500));
    handlePrint();
  };


  return (
      <aside
        className={`relative shadow-sm z-10 flex flex-col justify-between transition-all duration-300 ease-in-out no-print flex-shrink-0 h-full
          ${open ? "w-72" : "w-12"} 
          border-l border-[#E7E1D8] dark:border-white/[0.08] bg-[#F9F6F0]/95 dark:bg-[#0C1120]/95 text-[#1C1917] dark:text-slate-100 backdrop-blur-xl`}
      >
        <button
          onClick={toggleSidebar}
          className="absolute -left-3.5 top-1/2 transform -translate-y-1/2 bg-indigo-600 text-white p-1 rounded-full shadow-md hover:bg-indigo-700 transition cursor-pointer z-20"
          title={open ? "Thu gọn Thanh thông tin & Tác vụ" : "Mở rộng Thanh thông tin & Tác vụ"}
        >
          {open ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        <div className={`p-4 space-y-4 overflow-y-auto transition-opacity duration-300 scrollbar-thin ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          {open && (
            <>
              <div className="flex items-center justify-between pb-3 border-b border-[#E7E1D8] dark:border-white/[0.08]">
                <h2 className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-2">
                  <span>🧾</span>
                  <span>{t('rightSidebar.title', 'Thanh thông tin & Tác vụ')}</span>
                </h2>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 font-semibold font-mono">v5.0</span>
              </div>
              
               <Button onClick={handleOneClickExport} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 via-indigo-600 to-amber-500 hover:from-violet-500 hover:via-indigo-500 hover:to-amber-400 text-white shadow-md transition-all font-semibold text-xs py-2.5">
                  <Download size={15} /> {t('rightSidebar.oneClickExport', 'One-Click Export Tất Cả')}
                </Button>

              <div className="space-y-3">
                <div className="rounded-xl p-3 bg-white/80 dark:bg-white/[0.03] border border-[#E0D8CD] dark:border-white/[0.06] shadow-xs">
                  <p className="font-semibold mb-2 text-xs text-stone-700 dark:text-slate-300 flex items-center gap-1.5">
                    <span>🖨️</span>
                    <span>{t('rightSidebar.print', 'In & Xuất PDF')}</span>
                  </p>
                  <Button onClick={handlePrint} variant="secondary" size="sm" className="w-full flex items-center justify-center gap-2">
                    <Printer size={14} /> {t('rightSidebar.printButton', 'In đề thi & đáp án')}
                  </Button>
                </div>

                <div className="rounded-xl p-3 bg-white/80 dark:bg-white/[0.03] border border-[#E0D8CD] dark:border-white/[0.06] shadow-xs">
                  <p className="font-semibold mb-2 text-xs text-stone-700 dark:text-slate-300 flex items-center justify-between gap-1.5">
                    <span className="flex items-center gap-1.5">
                      <span>📄</span>
                      <span>{t('rightSidebar.wordExport', 'Xuất file Word')}</span>
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium">.DOCX / .DOC</span>
                  </p>
                  <div className="flex flex-col gap-1.5">
                    <Button onClick={handleExportDocx} variant="secondary" size="sm" className="w-full flex items-center justify-center gap-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/80 font-semibold shadow-2xs cursor-pointer">
                      <FileText size={14} className="text-indigo-600 dark:text-indigo-400" /> {t('rightSidebar.docxExportButton', 'Xuất .DOCX (Định dạng mới)')}
                    </Button>
                    <Button onClick={handleExportDoc} variant="outline" size="sm" className="w-full flex items-center justify-center gap-2 text-stone-600 dark:text-slate-400 text-xs hover:bg-stone-100 dark:hover:bg-slate-800 cursor-pointer">
                      <FileText size={14} /> {t('rightSidebar.docExportButton', 'Xuất .DOC (Định dạng cũ)')}
                    </Button>
                  </div>
                </div>

                <div className="rounded-xl p-3 bg-white/80 dark:bg-white/[0.03] border border-[#E0D8CD] dark:border-white/[0.06] shadow-xs">
                  <p className="font-semibold mb-2 text-xs text-stone-700 dark:text-slate-300 flex items-center justify-between gap-1.5">
                    <span className="flex items-center gap-1.5">
                      <span>📊</span>
                      <span>{t('rightSidebar.matrixExport', 'Xuất ma trận')}</span>
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium">.XLSX</span>
                  </p>
                  <Button onClick={handleExportXlsx} variant="secondary" size="sm" className="w-full flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80 font-semibold shadow-2xs cursor-pointer">
                    <FileSpreadsheet size={14} className="text-emerald-600 dark:text-emerald-400" /> {t('rightSidebar.matrixExportButton', 'Xuất Excel (.XLSX)')}
                  </Button>
                </div>
                
                <div className="rounded-xl p-3 bg-white/80 dark:bg-white/[0.03] border border-[#E0D8CD] dark:border-white/[0.06] shadow-xs">
                  <p className="font-semibold mb-2 text-xs text-stone-700 dark:text-slate-300 flex items-center gap-1.5">
                    <span>📤</span>
                    <span>{t('rightSidebar.lmsExport', 'Xuất sang LMS')}</span>
                  </p>
                  <div className="grid grid-cols-3 gap-1.5">
                    <Button onClick={handleNotImplemented} size="sm" variant="outline" className="px-1 text-[11px]">Moodle</Button>
                    <Button onClick={handleNotImplemented} size="sm" variant="outline" className="px-1 text-[11px]">Classroom</Button>
                    <Button onClick={handleNotImplemented} size="sm" variant="outline" className="px-1 text-[11px]">Teams</Button>
                  </div>
                </div>

                <div className="rounded-xl p-3 bg-white/80 dark:bg-white/[0.03] border border-[#E0D8CD] dark:border-white/[0.06] shadow-xs">
                  <p className="font-semibold mb-2 text-xs text-stone-700 dark:text-slate-300 flex items-center gap-1.5">
                    <span>📋</span>
                    <span>{t('rightSidebar.copy', 'Sao chép nhanh')}</span>
                  </p>
                  <Button onClick={handleCopy} variant="secondary" size="sm" className="w-full flex items-center justify-center gap-2">
                    <Copy size={14} /> {t('rightSidebar.copyButton', 'Sao chép toàn bộ')}
                  </Button>
                </div>

                <div className="rounded-xl p-3 bg-white/80 dark:bg-white/[0.03] border border-[#E0D8CD] dark:border-white/[0.06] shadow-xs">
                  <p className="font-semibold mb-2 text-xs text-stone-700 dark:text-slate-300 flex items-center gap-1.5">
                    <span>🧩</span>
                    <span>{t('rightSidebar.otherFormats', 'Định dạng khác')}</span>
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    <Button onClick={() => handleExport('md')} size="sm" variant="outline" className="text-xs">.MD</Button>
                    <Button onClick={() => handleExport('txt')} size="sm" variant="outline" className="text-xs">.TXT</Button>
                    <Button onClick={() => handleExport('rtf')} size="sm" variant="outline" className="text-xs">.RTF</Button>
                    <Button onClick={() => handleExport('csv')} size="sm" variant="outline" className="text-xs">.CSV</Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {open && (
          <div className="p-3 border-t border-[#E7E1D8] dark:border-white/[0.08] text-center text-[11px] text-stone-500 dark:text-slate-400 font-medium">
            ExamGen Ultra 5.0 • AI Assessment
          </div>
        )}
      </aside>
  );
}