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

export function preprocessMathContent(html: string): string {
  if (!html) return '';
  let processed = html;

  // Convert MathML elements to clean Word-compatible HTML representations
  processed = processed.replace(/<msup[^>]*>\s*<mi[^>]*>(.*?)<\/mi>\s*<mn[^>]*>(.*?)<\/mn>\s*<\/msup>/gi, '<i>$1</i><sup>$2</sup>');
  processed = processed.replace(/<msup[^>]*>\s*<mrow[^>]*>(.*?)<\/mrow>\s*<mn[^>]*>(.*?)<\/mn>\s*<\/msup>/gi, '($1)<sup>$2</sup>');
  processed = processed.replace(/<msup[^>]*>(.*?)<\/msup>/gi, '$1');

  processed = processed.replace(/<msub[^>]*>\s*<mi[^>]*>(.*?)<\/mi>\s*<mn[^>]*>(.*?)<\/mn>\s*<\/sub>/gi, '<i>$1</i><sub>$2</sub>');
  processed = processed.replace(/<msub[^>]*>(.*?)<\/msub>/gi, '$1');

  processed = processed.replace(/<mfrac[^>]*>\s*<mrow[^>]*>(.*?)<\/mrow>\s*<mrow[^>]*>(.*?)<\/mrow>\s*<\/mfrac>/gi, '($1)/($2)');
  processed = processed.replace(/<mfrac[^>]*>(.*?)<\/mfrac>/gi, '($1)');

  processed = processed.replace(/<msqrt[^>]*>(.*?)<\/msqrt>/gi, '√($1)');

  // Clean remaining MathML tags
  processed = processed
    .replace(/<\/?(math|mrow|mi|mn|mo|mroot|mstack|mtable|mtr|mtd)\b[^>]*>/gi, '');

  return processed;
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

  cleaned = preprocessMathContent(cleaned);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Exam Document</title>
  <style>
    * { font-family: 'Times New Roman', Times, serif !important; }
    body { 
      font-family: 'Times New Roman', Times, serif !important; 
      font-size: 13pt !important; 
      line-height: 1.15 !important; 
      color: #000000; 
      margin: 0; 
      padding: 0; 
    }
    p, div, span, li, a { 
      font-family: 'Times New Roman', Times, serif !important; 
      font-size: 13pt !important; 
      line-height: 1.15 !important; 
      margin-top: 0pt !important; 
      margin-bottom: 2pt !important; 
    }
    h1, h2, h3, h4, h5, h6 { 
      font-weight: bold; 
      font-family: 'Times New Roman', Times, serif !important; 
      font-size: 13pt !important; 
      line-height: 1.15 !important; 
      margin-top: 0pt !important; 
      margin-bottom: 2pt !important; 
      text-align: center; 
    }
    table { 
      border-collapse: collapse; 
      width: 100%; 
      margin-top: 0pt !important; 
      margin-bottom: 2pt !important; 
      font-family: 'Times New Roman', Times, serif !important; 
      font-size: 13pt !important; 
    }
    th, td { 
      border: 1px solid #000000; 
      padding: 4pt 6pt; 
      font-size: 13pt !important; 
      font-family: 'Times New Roman', Times, serif !important; 
      line-height: 1.15 !important; 
      margin-top: 0pt !important; 
      margin-bottom: 0pt !important; 
      text-align: left; 
      vertical-align: top; 
    }
    th { 
      font-weight: bold; 
      background-color: #f2f2f2; 
      text-align: center; 
      font-size: 13pt !important; 
    }
    p { margin-top: 0pt !important; margin-bottom: 3pt !important; font-size: 13pt !important; font-family: 'Times New Roman', Times, serif !important; line-height: 1.15 !important; text-align: justify !important; }
    strong, b { font-weight: bold; }
    em, i { font-style: italic; }
    .page-break { page-break-before: always; mso-break-type: section-break; }
  </style>
</head>
<body>
  ${cleaned}
</body>
</html>`;
}

export async function generateDocxBlob(
  htmlContent: string,
  orientation: 'portrait' | 'landscape' = 'portrait'
): Promise<Blob> {
  const formattedHtml = cleanHtmlForDocx(htmlContent);

  const docxBlob = await asBlob(formattedHtml, {
    orientation,
    margins: {
      top: 1134,    // 2 cm (Nghị định 30/2020/NĐ-CP)
      right: 1134,  // 2 cm (Nghị định 30/2020/NĐ-CP)
      bottom: 1134, // 2 cm (Nghị định 30/2020/NĐ-CP)
      left: 1701,   // 3 cm (Nghị định 30/2020/NĐ-CP)
    },
  });

  return docxBlob instanceof Blob 
    ? docxBlob 
    : new Blob([docxBlob as any], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
}

/**
 * Generates and downloads a real Microsoft Word (.docx) file (OpenXML standard ZIP format).
 * Opens natively in Word 2013-2021, Word 365, Google Docs, WPS Office without corruption errors.
 */
export async function exportToDocx(
  htmlContent: string,
  options: DocxExportOptions,
  orientation: 'portrait' | 'landscape' = 'portrait'
): Promise<void> {
  const blob = await generateDocxBlob(htmlContent, orientation);

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
    * { font-family: 'Times New Roman', Times, serif !important; }
    body, p, div, span, td, th, li, a { font-family: 'Times New Roman', Times, serif !important; font-size: 13pt !important; line-height: 1.15 !important; margin-top: 0pt !important; margin-bottom: 2pt !important; }
    table { border-collapse: collapse; width: 100%; margin-top: 0pt !important; margin-bottom: 2pt !important; font-family: 'Times New Roman', Times, serif !important; font-size: 13pt !important; }
    th, td { border: 1px solid black; padding: 4pt 5pt; text-align: left; vertical-align: top; font-size: 13pt !important; font-family: 'Times New Roman', Times, serif !important; line-height: 1.15 !important; margin-top: 0pt !important; margin-bottom: 0pt !important; }
    th { font-weight: bold; text-align: center; background-color: #f2f2f2; font-size: 13pt !important; }
    p, li, div { margin-top: 0pt !important; margin-bottom: 2pt !important; line-height: 1.15 !important; font-size: 13pt !important; font-family: 'Times New Roman', Times, serif !important; }
    h1, h2, h3, h4, h5, h6 { margin-top: 0pt !important; margin-bottom: 2pt !important; font-weight: bold; page-break-after: avoid; font-size: 13pt !important; font-family: 'Times New Roman', Times, serif !important; line-height: 1.15 !important; }
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
