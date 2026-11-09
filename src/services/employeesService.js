import { config } from '@/config/env';
import { client, mockDelay } from '@/api/client';
import { endpoints } from '@/api/endpoints';

const EMPTY_REPORT = {
  summary: {
    activeEmployees: 0,
    currentMonthlyBasePayroll: 0,
    baseTotal: 0,
    bonusesTotal: 0,
    deductionsTotal: 0,
    netTotal: 0,
    paidAmount: 0,
    outstandingAmount: 0,
  },
  rows: [],
  months: [],
};

const XLSX_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

/** حقول النموذج (camelCase) ← حقول الباك (snake_case) — الحقول الفارغة الاختيارية تُرسل null */
function toEmployeePayload(form) {
  return {
    name: form.name,
    job_title: form.jobTitle || null,
    phone: form.phone || null,
    email: form.email || null,
    base_salary: form.baseSalary,
    hired_at: form.hiredAt || null,
    is_active: form.isActive,
    notes: form.notes || null,
  };
}

/** الموظفون الإداريون (بلا حساب دخول) ورواتبهم الشهرية وبونصاتهم — EmployeeController/EmployeePayrollController */
export const employeesService = {
  async getEmployees({ search, isActive, page } = {}) {
    if (config.useMocks) {
      await mockDelay(300);
      return { data: [], summary: { activeEmployees: 0, monthlyBasePayroll: 0 }, meta: null };
    }
    const { data } = await client.get(endpoints.employees.list, {
      params: { search: search || undefined, is_active: isActive === '' ? undefined : isActive, page, per_page: 100 },
    });
    return { data: data.data, summary: data.additional_data, meta: data.meta };
  },

  /** الموظف مع سجل كشوفه وبونصاته/خصوماته */
  async getEmployee(id) {
    if (config.useMocks) {
      await mockDelay(300);
      return null;
    }
    const { data } = await client.get(endpoints.employees.detail(id));
    return data.data;
  },

  async createEmployee(form) {
    const { data } = await client.post(endpoints.employees.list, toEmployeePayload(form));
    return data.data;
  },

  async updateEmployee(id, form) {
    const { data } = await client.put(endpoints.employees.detail(id), toEmployeePayload(form));
    return data.data;
  },

  async deleteEmployee(id) {
    await client.delete(endpoints.employees.detail(id));
  },

  /** بونص أو خصم لشهر (YYYY-MM) — ينعكس فوراً على كشف ذلك الشهر إن كان غير مدفوع */
  async addAdjustment(employeeId, { month, type, amount, reason }) {
    const { data } = await client.post(endpoints.employees.adjustments(employeeId), {
      month,
      type,
      amount,
      reason: reason || null,
    });
    return data.data;
  },

  async deleteAdjustment(id) {
    await client.delete(endpoints.employees.deleteAdjustment(id));
  },

  async getPayroll({ month, status, page } = {}) {
    if (config.useMocks) {
      await mockDelay(300);
      return { data: [], summary: null, meta: null };
    }
    const { data } = await client.get(endpoints.payroll.list, {
      params: { month: month || undefined, status: status || undefined, page, per_page: 100 },
    });
    return { data: data.data, summary: data.additional_data, meta: data.meta };
  },

  /** كشوف الشهر لكل الموظفين النشطين — يُرجع { month, created } */
  async generatePayroll(month) {
    const { data } = await client.post(endpoints.payroll.generate, { month });
    return data.data;
  },

  async markSalaryPaid(id, notes) {
    const { data } = await client.post(endpoints.payroll.markPaid(id), { notes: notes || null });
    return data.data;
  },

  async getPayrollReport({ from, to, employeeId } = {}) {
    if (config.useMocks) {
      await mockDelay(300);
      return EMPTY_REPORT;
    }
    const { data } = await client.get(endpoints.payroll.report, {
      params: { from: from || undefined, to: to || undefined, employee_id: employeeId || undefined },
    });
    return data.data;
  },

  async exportPayroll({ month, from, to, status } = {}) {
    if (config.useMocks) {
      await mockDelay(500);
      return new Blob(['Demo mode — no real export available.'], { type: XLSX_TYPE });
    }
    const { data } = await client.get(endpoints.payroll.export, {
      params: { month: month || undefined, from: from || undefined, to: to || undefined, status: status || undefined },
      responseType: 'blob',
    });
    return data;
  },

  /** التقرير الشامل: ملف بثلاث أوراق (حسب الموظف، حسب الشهر، التفاصيل) — PayrollReportExport */
  async exportPayrollReport({ from, to, employeeId } = {}) {
    if (config.useMocks) {
      await mockDelay(500);
      return new Blob(['Demo mode — no real export available.'], { type: XLSX_TYPE });
    }
    const { data } = await client.get(endpoints.payroll.exportReport, {
      params: { from: from || undefined, to: to || undefined, employee_id: employeeId || undefined },
      responseType: 'blob',
    });
    return data;
  },
};
