export const STUDENT_TARGETS = [
  "Phổ thông",
  "Nội Trú/Bán Trú",
  "Chất Lượng Cao",
  "Trường Chuyên/Ôn thi ĐH"
];

export function getStudentTargetContextDirective(studentTarget?: string): string {
  const target = studentTarget || 'Phổ thông';

  switch (target) {
    case 'Nội Trú/Bán Trú':
      return `
[CHỈ THỊ CÁ NHÂN HÓA ĐỀ THI - ĐỐI TƯỢNG: HỌC SINH NỘI TRÚ / BÁN TRÚ]
- Bối cảnh câu hỏi: Ưu tiên bối cảnh thực tế thân thuộc, thiết thực, dễ hình dung, gắn liền với đời sống sinh hoạt, trải nghiệm và học tập hằng ngày của học sinh.
- Mức độ tư duy: Diễn đạt câu hỏi rõ ràng, trực quan, hạn chế tối đa các câu chữ rườm rà hay lắt léo không cần thiết. Các bài toán nhiều bước cần có câu chữ dẫn dắt mạch lạc.
- Tính toán & Logic: Phép tính gọn gàng, tập trung kiểm tra bản chất khái niệm và kỹ năng ứng dụng cơ bản.
- Phương án nhiễu (Distractors): Xây dựng dựa trên các nhầm lẫn khái niệm căn bản, giúp học sinh nhận diện rõ nguyên nhân sai.
- LƯU Ý BẮT BUỘC: Giữ nguyên cấu trúc ma trận nhận thức (Nhận biết, Thông hiểu, Vận dụng, Vận dụng cao) đã quy định, chỉ điều chỉnh bối cảnh và độ diễn đạt cho phù hợp trình độ nhóm học sinh này.`;

    case 'Chất Lượng Cao':
      return `
[CHỈ THỊ CÁ NHÂN HÓA ĐỀ THI - ĐỐI TƯỢNG: HỌC SINH CHẤT LƯỢNG CAO]
- Bối cảnh câu hỏi: Bối cảnh phong phú, có tính mở và thực tiễn cao, có thể tích hợp dữ liệu thực tế, biểu đồ, bảng số liệu hoặc tình huống thực tiễn đa chiều.
- Mức độ tư duy: Tăng cường tư duy đa bước (multi-step reasoning). Yêu cầu học sinh phải liên kết kiến thức giữa các bài học, phân tích và tổng hợp thông tin sâu hơn ở cùng một mức độ nhận thức.
- Tính toán & Logic: Tăng tính biến hóa và độ lắt léo trong các bước giải trung gian, đòi hỏi kỹ năng biến đổi linh hoạt và tư duy tối ưu cách giải.
- Phương án nhiễu (Distractors): Rất tinh vi. Các phương án nhiễu được xây dựng từ các lỗi bẫy điều kiện biên, biến đổi công thức gần đúng, bẫy đơn vị hoặc bẫy logic nâng cao.
- LƯU Ý BẮT BUỘC: Giữ nguyên tỷ lệ ma trận nhận thức (NB/TH/VD/VDC) đã thiết lập, nhưng khai thác tối đa độ sâu tư duy, tính toán lắt léo và bối cảnh ở ngưỡng cao nhất của từng mức độ.`;

    case 'Trường Chuyên/Ôn thi ĐH':
      return `
[CHỈ THỊ CÁ NHÂN HÓA ĐỀ THI - ĐỐI TƯỢNG: HỌC SINH TRƯỜNG CHUYÊN / ÔN THI ĐẠI HỌC (PHÂN HÓA CAO)]
- Bối cảnh câu hỏi: Bối cảnh mang tính chuyên sâu, học thuật, tiệm cận các kỳ thi Học sinh giỏi, kỳ thi Đánh giá năng lực / Đánh giá tư duy và các câu phân hóa điểm 9-10 tốt nghiệp THPT.
- Mức độ tư duy: Đòi hỏi tư duy logic phức tạp, phân tích đa chiều, tổng hợp kiến thức liên chủ đề, giải quyết vấn đề qua nhiều công đoạn suy luận khắt khe.
- Tính toán & Logic: Các bài toán có độ ẩn biến cao, phương pháp giải yêu cầu biến đổi khéo léo, cẩn trọng trong lập luận toán học / khoa học.
- Phương án nhiễu (Distractors): Cực kỳ tinh vi và mang tính bẫy cao. Các phương án nhiễu chính là kết quả của những hướng đi "có vẻ đúng" nhưng vấp phải bẫy điều kiện ẩn, bẫy khái niệm nâng cao hoặc bẫy kỹ thuật tính toán.
- LƯU Ý BẮT BUỘC: Giữ nguyên tỷ lệ ma trận nhận thức (NB/TH/VD/VDC) đã thiết lập, nhưng phát huy độ tinh vi, tính toán lắt léo và tính phân hóa đỉnh cao ở từng mức độ.`;

    case 'Phổ thông':
    default:
      return `
[CHỈ THỊ CÁ NHÂN HÓA ĐỀ THI - ĐỐI TƯỢNG: HỌC SINH PHỔ THÔNG (ĐẠI TRÀ)]
- Bối cảnh câu hỏi: Bối cảnh chuẩn hóa theo chương trình GDPT, cân bằng giữa lý thuyết cốt lõi và ứng dụng thực tiễn phù hợp với mặt bằng chung.
- Mức độ tư duy: Đảm bảo độ phân hóa vừa phải. Các câu Nhận biết/Thông hiểu bám sát chuẩn kiến thức; các câu Vận dụng yêu cầu 2-3 bước tư duy mạch lạc.
- Tính toán & Logic: Độ phức tạp vừa phải, đòi hỏi nắm vững công thức và quy trình xử lý chuẩn.
- Phương án nhiễu (Distractors): Dựa trên những nhầm lẫn kiến thức thông thường của học sinh đại trà.
- LƯU Ý BẮT BUỘC: Tuân thủ tuyệt đối khung ma trận nhận thức (NB/TH/VD/VDC) đã thiết lập.`;
  }
}
