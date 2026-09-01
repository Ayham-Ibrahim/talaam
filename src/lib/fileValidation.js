/**
 * يتحقق من حجم/نوع الملف محلياً قبل إرساله — يوازي حدود الباك اند بالضبط
 * (UploadAvatarRequest/UploadVerificationDocumentRequest: max:5120 كيلوبايت)
 * فلا يصل طلب رفع ملف كبير للسيرفر أصلاً لينتظر المستخدم رداً بطيئاً لا فائدة
 * منه (خصوصاً مع رفع حقيقي لملف كبير عبر الشبكة، لا مجرد طلب JSON صغير).
 * يرمي خطأ بنفس شكل تطبيع client.js ({status, message, errors}) كي تعرضه
 * ApiErrorList بلا أي تمييز عن خطأ حقيقي راجع من الباك اند.
 */
export function assertFileWithinLimits(file, { maxBytes, mimeTypes, field, sizeMessage, typeMessage }) {
  if (mimeTypes && !mimeTypes.includes(file.type)) {
    throw { status: 422, message: 'حدث خطأ في التحقق من صحة البيانات', errors: { [field]: [typeMessage] } };
  }
  if (file.size > maxBytes) {
    throw { status: 422, message: 'حدث خطأ في التحقق من صحة البيانات', errors: { [field]: [sizeMessage] } };
  }
}
