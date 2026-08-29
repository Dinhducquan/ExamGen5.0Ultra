import { asBlob } from 'html-docx-js-typescript';
import { generateAutoFilename, FilenameMetadata } from './filenameUtils';

export interface DocxExportOptions {
  filename: string | FilenameMetadata;
  title?: string;
  creator?: string;
  subject?: string;
  grade?: string;
  examType?: string;
  schoolYear?: string;
}

/**
 * Clean up HTML content for HTML-to-DOCX conversion.
 * Ensures inline styles, tables, headings, and paragraphs are formatted properly.
 */
export function cleanHtmlForDocx(rawHtml: string): string {
  // Wrap content in a clean HTML structure
  let cleaned = rawHtml
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')   // Remove internal styles if any
    .replace(/class="[^"]*"/g, '');                                      // Remove Tailwind utility classes that might break parser

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Exam Document</title>
  <style>
    body { font-family: 'Times New Roman', serif; font-size: 13pt; line-height: 1.5; }
    h1, h2, h3, h4 { font-weight: bold; font-family: 'Times New Roman', serif; margin-top: 12pt; margin-bottom: 6pt; }
    table { border-collapse: collapse; width: 100%; margin-top: 10pt; margin-bottom: 10pt; }
    th, td { border: 1px solid #000000; padding: 6pt; font-size: 11pt; text-align: left; vertical-align: top; }
    th { font-weight: bold; background-color: #f2f2f2; }
    p { margin-bottom: 6pt; margin-top: 0; }
    strong, b { font-weight: bold; }
    em, i { font-style: italic; }
  </style>
</head>
<body>
  ${cleaned}
</body>
</html>`;
}

/**
 * Generates and downloads a real Microsoft Word (.docx) file (OpenXML standard ZIP format).
 * Opens natively in Word 2013-2021, Word 365, Google Docs, WPS Office without corruption errors.
 */
export async function exportToDocx(htmlContent: string, options: DocxExportOptions): Promise<void> {
  const formattedHtml = cleanHtmlForDocx(htmlContent);

  const docxBlob = await asBlob(formattedHtml, {
    orientation: 'portrait',
    margins: {
      top: 1440,    // 1 inch
      right: 1440,  // 1 inch
      bottom: 1440, // 1 inch
      left: 1440,   // 1 inch
    },
  });

  // Ensure blob is typed correctly
  const blob = docxBlob instanceof Blob 
    ? docxBlob 
    : new Blob([docxBlob as any], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });

  const filename = generateAutoFilename(options.filename, 'docx', {
    subject: options.subject,
    grade: options.grade,
    examType: options.examType,
    schoolYear: options.schoolYear,
  });

  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

/**
 * Legacy HTML-MIME Word Export (.doc format).
 */
export function exportToDoc(htmlContent: string, filename: string | FilenameMetadata): void {
  const styles = `
    body { font-family: 'Times New Roman', Times, serif; font-size: 13pt; line-height: 1.5; }
    table { border-collapse: collapse; width: 100%; margin-bottom: 1em; }
    th, td { border: 1px solid black; padding: 5px; text-align: left; vertical-align: top; }
    th { font-weight: bold; text-align: center; background-color: #f2f2f2; }
    p, li, div { margin: 0; padding: 0; line-height: 1.5; }
    h1, h2, h3, h4, h5, h6 { margin: 12pt 0 3pt 0; font-weight: bold; page-break-after: avoid; }
    strong, b { font-weight: bold; }
    em, i { font-style: italic; }
  `;

  const fullHtml = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>ExamGen Ultra Export</title>
      <style>${styles}</style>
    </head>
    <body>${htmlContent}</body>
  </html>`;

  const safeFilename = generateAutoFilename(filename, 'doc');
  const blob = new Blob(['\uFEFF' + fullHtml], { type: 'application/msword;charset=utf-8;' });

  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = safeFilename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}
