import * as XLSX from 'xlsx';
import { generateAutoFilename, FilenameMetadata } from './filenameUtils';

export interface ExcelExportOptions {
  filename: string | FilenameMetadata;
  sheetName?: string;
  subject?: string;
  grade?: string;
  examType?: string;
  schoolYear?: string;
}

/**
 * Cleans HTML to optimize for Excel parsing and rendering.
 */
function cleanHtmlForExcel(rawHtml: string): string {
  return rawHtml
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<button\b[^<]*(?:(?!<\/button>)<[^<]*)*<\/button>/gi, '');
}

/**
 * Export HTML table or HTML string to standard OpenXML Excel (.xlsx) file using SheetJS (xlsx),
 * preserving table structures, cell merges (rowspan & colspan), and numerical values.
 */
export function exportTableToXlsx(tableElementOrHtml: HTMLTableElement | string, options: ExcelExportOptions): void {
  const filename = generateAutoFilename(options.filename, 'xlsx', {
    subject: options.subject,
    grade: options.grade,
    examType: options.examType,
    schoolYear: options.schoolYear,
  });

  const sheetName = (options.sheetName || 'MaTrận').slice(0, 31);

  let wb: XLSX.WorkBook;

  if (typeof tableElementOrHtml === 'string') {
    const cleanedHtml = cleanHtmlForExcel(tableElementOrHtml);
    wb = XLSX.read(cleanedHtml, { type: 'string' });
  } else {
    wb = XLSX.utils.table_to_book(tableElementOrHtml, { raw: false });
  }

  // Ensure sheet exists and has proper name
  const currentSheetName = wb.SheetNames[0] || 'Sheet1';
  if (currentSheetName !== sheetName) {
    wb.Sheets[sheetName] = wb.Sheets[currentSheetName];
    delete wb.Sheets[currentSheetName];
    wb.SheetNames[0] = sheetName;
  }

  const ws = wb.Sheets[sheetName];

  // Auto-fit column widths if sheet exists
  if (ws && ws['!ref']) {
    const range = XLSX.utils.decode_range(ws['!ref']);
    const colWidths: { wch: number }[] = [];
    for (let C = range.s.c; C <= range.e.c; ++C) {
      let maxLen = 12;
      for (let R = range.s.r; R <= range.e.r; ++R) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        const cell = ws[cellAddress];
        if (cell && cell.v !== undefined && cell.v !== null) {
          const valStr = String(cell.v).trim();
          maxLen = Math.max(maxLen, Math.min(valStr.length + 3, 60));
        }
      }
      colWidths.push({ wch: maxLen });
    }
    ws['!cols'] = colWidths;
  }

  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  downloadBlob(blob, filename);
}

/**
 * Fallback / Styled Excel exporter: Exports full HTML table structure to application/vnd.ms-excel.
 * Preserves 100% exact visual styling (font-weight: bold, text-align, background colors, borders, rowspans, colspans).
 */
export function exportTableToExcelHtml(htmlContent: string, options: ExcelExportOptions): void {
  const filename = generateAutoFilename(options.filename, 'xlsx', {
    subject: options.subject,
    grade: options.grade,
    examType: options.examType,
    schoolYear: options.schoolYear,
  });

  const sheetName = options.sheetName || 'MaTrận';

  const excelDoc = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8">
  <!--[if gte mso 9]>
  <xml>
    <x:ExcelWorkbook>
      <x:ExcelWorksheets>
        <x:ExcelWorksheet>
          <x:Name>${sheetName}</x:Name>
          <x:WorksheetOptions>
            <x:DisplayGridlines/>
          </x:WorksheetOptions>
        </x:ExcelWorksheet>
      </x:ExcelWorksheets>
    </x:ExcelWorkbook>
  </xml>
  <![endif]-->
  <style>
    body { font-family: 'Times New Roman', Arial, sans-serif; font-size: 11pt; }
    table { border-collapse: collapse; width: 100%; margin-bottom: 15px; font-family: 'Times New Roman', Arial, sans-serif; }
    th, td { border: 0.5pt solid #000000; padding: 6px 8px; font-size: 11pt; text-align: center; vertical-align: middle; }
    th { font-weight: bold; background-color: #EFEFEF; text-align: center; }
    .text-left { text-align: left !important; }
    .text-center { text-align: center !important; }
    .text-right { text-align: right !important; }
    .font-bold { font-weight: bold !important; }
    .bg-gray-100, .bg-slate-100, .bg-stone-100 { background-color: #F3F4F6 !important; }
  </style>
</head>
<body>
  ${cleanHtmlForExcel(htmlContent)}
</body>
</html>`;

  const blob = new Blob(['\uFEFF' + excelDoc], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  downloadBlob(blob, filename);
}

/**
 * High-level Excel matrix exporter that attempts SheetJS native .xlsx first,
 * and falls back to Excel HTML format if needed.
 */
export function exportMatrixToExcel(
  elementOrHtml: HTMLTableElement | HTMLElement | string,
  options: ExcelExportOptions
): void {
  try {
    if (elementOrHtml instanceof HTMLTableElement) {
      exportTableToXlsx(elementOrHtml, options);
    } else if (elementOrHtml instanceof HTMLElement) {
      const tableEl = elementOrHtml.querySelector('table');
      if (tableEl) {
        exportTableToXlsx(tableEl, options);
      } else {
        exportTableToExcelHtml(elementOrHtml.innerHTML, options);
      }
    } else if (typeof elementOrHtml === 'string') {
      exportTableToExcelHtml(elementOrHtml, options);
    }
  } catch (err) {
    console.error('Error exporting to XLSX with SheetJS, falling back to Excel HTML format:', err);
    const rawHtml = typeof elementOrHtml === 'string'
      ? elementOrHtml
      : (elementOrHtml as HTMLElement).innerHTML || '';
    exportTableToExcelHtml(rawHtml, options);
  }
}

function downloadBlob(blob: Blob, filename: string): void {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}
