import { config } from '@/config/env';
import { client, mockDelay } from '@/api/client';
import { endpoints } from '@/api/endpoints';

/** يطابق UploadSessionAttachmentRequest في الباك اند: PDF وصور وWord، 10 ميغابايت */
export const ATTACHMENT_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'];
export const ATTACHMENT_MAX_BYTES = 10 * 1024 * 1024;
export const ATTACHMENT_ACCEPT = ATTACHMENT_EXTENSIONS.map((ext) => `.${ext}`).join(',');

/**
 * الفحص بالامتداد لا بـ file.type — المتصفح يعطي نوعاً فارغاً لملفات Word على بعض
 * الأنظمة فيُرفض ملف سليم. الفحص الحاسم يبقى في الباك اند.
 */
function assertAttachment(file) {
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (!ATTACHMENT_EXTENSIONS.includes(ext)) {
    throw {
      status: 422,
      message: 'حدث خطأ في التحقق من صحة البيانات',
      errors: { file: ['صيغة الملف غير مدعومة — يُسمح فقط بـ PDF أو صورة (JPG/PNG) أو Word'] },
    };
  }
  if (file.size > ATTACHMENT_MAX_BYTES) {
    throw {
      status: 422,
      message: 'حدث خطأ في التحقق من صحة البيانات',
      errors: { file: ['حجم الملف أكبر من الحد المسموح (10 ميغابايت كحد أقصى)'] },
    };
  }
}

/** مرفقات الجلسة: تبادل الملفات بين المعلم والطالب مباشرة بلا موظف وسيط */
export const sessionAttachmentService = {
  async list(sessionId) {
    if (config.useMocks) {
      await mockDelay(300);
      return [];
    }
    const { data } = await client.get(endpoints.classSessions.attachments(sessionId));
    return data.data;
  },

  async upload(sessionId, { file, title }) {
    assertAttachment(file);
    const form = new FormData();
    form.append('file', file);
    if (title?.trim()) form.append('title', title.trim());
    const { data } = await client.post(endpoints.classSessions.attachments(sessionId), form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data;
  },

  async remove(attachmentId) {
    const { data } = await client.delete(endpoints.sessionAttachments.delete(attachmentId));
    return data.data;
  },
};
