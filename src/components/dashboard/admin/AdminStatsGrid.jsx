import { Link } from 'react-router-dom';
import { GraduationCap, Clock4, Package, MessageSquareWarning, Users, Wallet } from 'lucide-react';
import { formatNumber, formatPrice } from '@/lib/formatters';
import { useT } from '@/hooks/useT';

const STAT_CONFIG = [
  { key: 'statVerifiedTeachers', icon: GraduationCap, bg: '#E3F5EC', color: '#2E9E6B', valueKey: 'verifiedTeachersCount', format: 'number' },
  { key: 'statPendingVerifications', icon: Clock4, bg: '#FEF3E2', color: '#B7791F', valueKey: 'pendingVerificationsCount', format: 'number', linkTo: '/dashboard/admin/teachers' },
  { key: 'statPendingApprovals', icon: Package, bg: '#F7E6EE', color: '#B00852', valueKey: 'pendingApprovalsCount', format: 'number', linkTo: '/dashboard/admin/listings' },
  { key: 'statOpenComplaints', icon: MessageSquareWarning, bg: '#FDEFF2', color: '#7E57C2', valueKey: 'openComplaintsCount', format: 'number', linkTo: '/dashboard/admin/complaints' },
  { key: 'statTotalStudents', icon: Users, bg: '#EDF0F5', color: '#4B6898', valueKey: 'totalStudents', format: 'number' },
  { key: 'statMonthlyRevenue', icon: Wallet, bg: '#F0FAFD', color: '#2F80ED', valueKey: 'monthlyRevenue', format: 'price' },
];

export function AdminStatsGrid({ stats }) {
  const t = useT();

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {STAT_CONFIG.map((stat) => {
        const Icon = stat.icon;
        const raw = stats?.[stat.valueKey] ?? 0;
        const value = stat.format === 'price' ? formatPrice(raw) : formatNumber(raw);
        const Wrapper = stat.linkTo ? Link : 'div';
        const wrapperProps = stat.linkTo ? { to: stat.linkTo } : {};

        return (
          <Wrapper
            key={stat.key}
            {...wrapperProps}
            className={`flex items-center gap-3 rounded-2xl border border-[#F2F2F7] bg-white p-4 shadow-card ${
              stat.linkTo ? 'transition-shadow hover:shadow-lift' : ''
            }`}
          >
            <div className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-xl" style={{ background: stat.bg }}>
              <Icon size={28} style={{ color: stat.color }} />
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-[#2D2D2D]">{t(`dashboard.adminOverview.${stat.key}`)}</div>
              <div className="text-2xl font-bold text-[#2D2D2D]">{value}</div>
            </div>
          </Wrapper>
        );
      })}
    </div>
  );
}
