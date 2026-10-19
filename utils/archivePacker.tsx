import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import JSZip from 'jszip';
import fileSaver from 'file-saver';
import { GeneratedExamData, MixedExam } from '../types';
import { AppSettings } from '../contexts/SettingsContext';
import { ExamCreationState } from '../contexts/ExamCreationContext';
import { generateDocxBlob } from './docxExporter';
import { generateZipArchiveFilename } from './filenameUtils';
import { sanitizeStudentExamContent } from '../components/mix/MixExamWorkspace';
import { ExamHeader } from '../components/exam/ExamHeader';
import { ExamFooter } from '../components/exam/ExamFooter';
import { Cv7991Matrix } from '../components/exam/Cv7991Matrix';
import { Cv7991Spec } from '../components/exam/Cv7991Spec';
import { NguVanMatrix } from '../components/exam/NguVanMatrix';
import { NguVanSpec } from '../components/exam/NguVanSpec';
import StructureReport from '../components/results/StructureReport';

const saveAsFn = (fileSaver as any)?.saveAs || fileSaver;

function downloadBlobSafely(blob: Blob, filename: string) {
  try {
    if (typeof saveAsFn === 'function') {
      saveAsFn(blob, filename);
      return;
    }
  } catch (err) {
    console.warn('saveAs failed, falling back to anchor click:', err);
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

function wrapStandardLayout(params: {
  settings: AppSettings;
  docTitle?: string;
  showCode?: string;
  questionCount?: number;
  bodyContentHtml: string;
}): string {
  const headerHtml = renderToStaticMarkup(
    <ExamHeader
      province={params.settings.province?.toUpperCase() || '[TỈNH/THÀNH PHỐ]'}
      school={params.settings.school?.toUpperCase() || '[TÊN TRƯỜNG]'}
      group={params.settings.profGroup?.toUpperCase() || '[TỔ CHUYÊN MÔN]'}
      year={params.settings.year || '2026-2027'}
      subject={params.settings.subject?.toUpperCase() || '[MÔN HỌC]'}
      grade={params.settings.grade || '[KHỐI]'}
      duration={parseInt(params.settings.duration) || 0}
      questionCount={params.questionCount}
      examType={params.settings.examType?.toUpperCase() || 'ĐỀ KIỂM TRA'}
    />
  );

  const codeHtml = params.showCode
    ? `<div style="text-align: center; font-weight: bold; font-size: 13pt; margin-top: 0pt; margin-bottom: 2pt; padding: 4pt 12pt; border: 1.5pt solid black; width: 220px; font-family: 'Times New Roman', Times, serif; line-height: 1.15;">MÃ ĐỀ THI: ${params.showCode}</div>`
    : '';

  const titleHtml = params.docTitle
    ? `<h2 style="text-align: center; font-size: 13pt; font-weight: bold; text-transform: uppercase; margin-top: 0pt; margin-bottom: 2pt; font-family: 'Times New Roman', Times, serif; line-height: 1.15;">${params.docTitle}</h2>`
    : '';

  const footerHtml = renderToStaticMarkup(
    <ExamFooter
      place={params.settings.signPlace || '[Nơi ký]'}
      vicePrincipalName={params.settings.signer || '[Tên P. Hiệu trưởng]'}
      groupLeaderName={params.settings.groupLeader || '[Tên Tổ trưởng]'}
      creatorName={params.settings.teacher || '[Tên người ra đề]'}
    />
  );

  return `
    <div style="font-family: 'Times New Roman', Times, serif; font-size: 13pt; line-height: 1.15; color: #000000; margin-top: 0pt; margin-bottom: 2pt;">
      ${headerHtml}
      ${codeHtml}
      ${titleHtml}
      <div style="margin-top: 0pt; margin-bottom: 2pt; font-family: 'Times New Roman', Times, serif; font-size: 13pt; line-height: 1.15;">
        ${params.bodyContentHtml}
      </div>
      <div style="margin-top: 12pt; margin-bottom: 2pt; page-break-inside: avoid; font-family: 'Times New Roman', Times, serif; font-size: 13pt; line-height: 1.15;">
        ${footerHtml}
      </div>
    </div>
  `;
}

export interface PackExamArchiveParams {
  examData: GeneratedExamData | null;
  outlineData: string | null;
  mixedExamData: MixedExam[] | null;
  settings: AppSettings;
  examSettings: ExamCreationState;
  questionCount?: number;
  outlineQuestionCount?: number;
  onProgress?: (status: string) => void;
}

/**
 * Packs all exam documents into a single organized ZIP archive containing Word (.DOCX) files:
 * - 01_Ma_tran_de_thi.docx
 * - 02_Ban_dac_ta_ky_thuat.docx
 * - 03_Bao_cao_cau_truc_de.docx
 * - 04_De_kiem_tra_chinh_Giao_vien.docx (giữ nguyên mức độ & địa chỉ kiến thức)
 * - 05_Dap_an_huong_dan_cham_De_chinh.docx
 * - 06_Cac_de_tron_Hoc_sinh.docx (đã làm sạch thông tin mức độ & địa chỉ)
 * - 07_Dap_an_cac_ma_de_tron.docx
 * - 08_De_cuong_on_tap.docx (nếu có dữ liệu)
 * Plus individual files for each mixed exam code in subfolders for convenient printing.
 */
export async function packExamArchive({
  examData,
  outlineData,
  mixedExamData,
  settings,
  examSettings,
  questionCount,
  outlineQuestionCount,
  onProgress,
}: PackExamArchiveParams): Promise<string> {
  const zip = new JSZip();
  const isNguVan = settings.subject === 'Ngữ văn';

  // 1. 01_Ma_tran_de_thi.docx (Landscape)
  onProgress?.('Đang tạo 01_Ma_tran_de_thi.docx...');
  const matrixContentHtml = isNguVan
    ? renderToStaticMarkup(<NguVanMatrix examSettings={examSettings} />)
    : renderToStaticMarkup(<Cv7991Matrix data={examData} examSettings={examSettings} generalSettings={settings} />);
  
  const fullMatrixHtml = wrapStandardLayout({
    settings,
    docTitle: isNguVan ? 'MA TRẬN ĐỀ KIỂM TRA MÔN NGỮ VĂN' : 'MA TRẬN ĐỀ KIỂM TRA ĐỊNH KÌ',
    questionCount,
    bodyContentHtml: matrixContentHtml,
  });
  const matrixBlob = await generateDocxBlob(fullMatrixHtml, 'landscape');
  zip.file('01_Ma_tran_de_thi.docx', matrixBlob);

  // 2. 02_Ban_dac_ta_ky_thuat.docx (Landscape)
  onProgress?.('Đang tạo 02_Ban_dac_ta_ky_thuat.docx...');
  const specContentHtml = isNguVan
    ? renderToStaticMarkup(<NguVanSpec examSettings={examSettings} />)
    : renderToStaticMarkup(<Cv7991Spec data={examData} examSettings={examSettings} generalSettings={settings} />);
  
  const fullSpecHtml = wrapStandardLayout({
    settings,
    docTitle: isNguVan ? 'BẢN ĐẶC TẢ KĨ THUẬT ĐỀ KIỂM TRA NGỮ VĂN' : 'BẢNG ĐẶC TẢ ĐỀ KIỂM TRA ĐỊNH KÌ',
    questionCount,
    bodyContentHtml: specContentHtml,
  });
  const specBlob = await generateDocxBlob(fullSpecHtml, 'landscape');
  zip.file('02_Ban_dac_ta_ky_thuat.docx', specBlob);

  // 3. 03_Bao_cao_cau_truc_de.docx (Portrait)
  onProgress?.('Đang tạo 03_Bao_cao_cau_truc_de.docx...');
  let structureReportHtml = '';
  if (examData?.validationReport && examData?.topics) {
    structureReportHtml = renderToStaticMarkup(
      <StructureReport
        report={examData.validationReport}
        topics={examData.topics}
        settings={settings}
      />
    );
  } else {
    structureReportHtml = wrapStandardLayout({
      settings,
      docTitle: 'BÁO CÁO ĐỐI CHIẾU CẤU TRÚC ĐỀ THI',
      questionCount,
      bodyContentHtml: '<p style="text-align: center; font-style: italic;">Chưa có dữ liệu đối chiếu ma trận.</p>',
    });
  }
  const reportBlob = await generateDocxBlob(structureReportHtml, 'portrait');
  zip.file('03_Bao_cao_cau_truc_de.docx', reportBlob);

  // 4. 04_De_kiem_tra_chinh_Giao_vien.docx (Portrait)
  onProgress?.('Đang tạo 04_De_kiem_tra_chinh_Giao_vien.docx...');
  const mainExamContent = examData?.examContent || '<p style="text-align: center; font-style: italic;">Chưa có nội dung đề thi chính.</p>';
  const fullMainExamHtml = wrapStandardLayout({
    settings,
    docTitle: settings.examType?.toUpperCase() || 'ĐỀ KIỂM TRA CHÍNH THỨC',
    questionCount,
    bodyContentHtml: `<div class="whitespace-pre-wrap">${mainExamContent}</div>`,
  });
  const mainExamBlob = await generateDocxBlob(fullMainExamHtml, 'portrait');
  zip.file('04_De_kiem_tra_chinh_Giao_vien.docx', mainExamBlob);

  // 5. 05_Dap_an_huong_dan_cham_De_chinh.docx (Portrait)
  onProgress?.('Đang tạo 05_Dap_an_huong_dan_cham_De_chinh.docx...');
  const mainAnswerContent = examData?.answerContent || '<p style="text-align: center; font-style: italic;">Chưa có hướng dẫn chấm và đáp án.</p>';
  const fullMainAnswerHtml = wrapStandardLayout({
    settings,
    docTitle: `HƯỚNG DẪN CHẤM & ĐÁP ÁN ${settings.examType?.toUpperCase() || 'ĐỀ KIỂM TRA'}`,
    questionCount,
    bodyContentHtml: `<div class="whitespace-pre-wrap">${mainAnswerContent}</div>`,
  });
  const mainAnswerBlob = await generateDocxBlob(fullMainAnswerHtml, 'portrait');
  zip.file('05_Dap_an_huong_dan_cham_De_chinh.docx', mainAnswerBlob);

  // 6. 06_Cac_de_tron_Hoc_sinh.docx (Portrait)
  onProgress?.('Đang tạo 06_Cac_de_tron_Hoc_sinh.docx...');
  const mixedFolder = zip.folder('06_Cac_de_tron_chi_tiet');
  const answersFolder = zip.folder('07_Dap_an_cac_ma_de_tron_chi_tiet');

  if (mixedExamData && mixedExamData.length > 0) {
    // Generate combined document with all mixed exams separated by page breaks
    const combinedExamsHtmlArray: string[] = [];
    const combinedAnswersHtmlArray: string[] = [];

    for (let i = 0; i < mixedExamData.length; i++) {
      const item = mixedExamData[i];
      const cleanExamContent = sanitizeStudentExamContent(item.examContent || '');
      
      const singleExamHtml = wrapStandardLayout({
        settings,
        docTitle: settings.examType?.toUpperCase() || 'ĐỀ KIỂM TRA',
        showCode: item.code,
        questionCount,
        bodyContentHtml: `<div class="whitespace-pre-wrap">${cleanExamContent}</div>`,
      });

      const singleAnswerHtml = wrapStandardLayout({
        settings,
        docTitle: `ĐÁP ÁN & HƯỚNG DẪN CHẤM - MÃ ĐỀ: ${item.code}`,
        showCode: item.code,
        questionCount,
        bodyContentHtml: `<div class="whitespace-pre-wrap">${item.answerContent || ''}</div>`,
      });

      // Add to combined html
      const pageBreakPrefix = i > 0 ? '<div class="page-break" style="page-break-before: always; mso-break-type: section-break; height: 1px;"></div>' : '';
      combinedExamsHtmlArray.push(`${pageBreakPrefix}${singleExamHtml}`);
      combinedAnswersHtmlArray.push(`${pageBreakPrefix}${singleAnswerHtml}`);

      // Also create individual DOCX in folder
      const singleExamBlob = await generateDocxBlob(singleExamHtml, 'portrait');
      mixedFolder?.file(`De_Tron_Ma_${item.code}.docx`, singleExamBlob);

      const singleAnswerBlob = await generateDocxBlob(singleAnswerHtml, 'portrait');
      answersFolder?.file(`Dap_An_Ma_${item.code}.docx`, singleAnswerBlob);
    }

    const combinedExamsBlob = await generateDocxBlob(combinedExamsHtmlArray.join(''), 'portrait');
    zip.file('06_Cac_de_tron_Hoc_sinh.docx', combinedExamsBlob);

    // 7. 07_Dap_an_cac_ma_de_tron.docx
    onProgress?.('Đang tạo 07_Dap_an_cac_ma_de_tron.docx...');
    const combinedAnswersBlob = await generateDocxBlob(combinedAnswersHtmlArray.join(''), 'portrait');
    zip.file('07_Dap_an_cac_ma_de_tron.docx', combinedAnswersBlob);

  } else {
    // Fallback if no mixed exams have been generated yet: clean student exam from main exam
    const cleanStudentExam = sanitizeStudentExamContent(examData?.examContent || '');
    const studentExamHtml = wrapStandardLayout({
      settings,
      docTitle: settings.examType?.toUpperCase() || 'ĐỀ KIỂM TRA',
      questionCount,
      bodyContentHtml: `<div class="whitespace-pre-wrap">${cleanStudentExam}</div>`,
    });
    const studentExamBlob = await generateDocxBlob(studentExamHtml, 'portrait');
    zip.file('06_Cac_de_tron_Hoc_sinh.docx', studentExamBlob);
  }

  // 8. 08_De_cuong_on_tap.docx (Portrait, only if outline data exists)
  if (outlineData && outlineData.trim().length > 0) {
    onProgress?.('Đang tạo 08_De_cuong_on_tap.docx...');
    const outlineHtml = wrapStandardLayout({
      settings,
      docTitle: 'ĐỀ CƯƠNG ÔN TẬP KIỂM TRA',
      questionCount: outlineQuestionCount,
      bodyContentHtml: `<div class="whitespace-pre-wrap">${outlineData}</div>`,
    });
    const outlineBlob = await generateDocxBlob(outlineHtml, 'portrait');
    zip.file('08_De_cuong_on_tap.docx', outlineBlob);
  }

  // Pack and compress ZIP
  onProgress?.('Đang nén toàn bộ tệp vào file ZIP...');
  const zipBlob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: {
      level: 6,
    },
  });

  const zipFilename = generateZipArchiveFilename(settings);
  downloadBlobSafely(zipBlob, zipFilename);

  return zipFilename;
}
