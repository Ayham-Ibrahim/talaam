import { SettingRow } from './SettingRow';

export function SettingsCategorySection({ title, settings, isPending, onSave }) {
  return (
    <div className="rounded-2xl border border-[#F2F2F7] bg-white p-5 shadow-card sm:p-6">
      <h3 className="text-right text-base font-bold text-ink">{title}</h3>
      <div className="mt-2">
        {settings.map((setting) => (
          <SettingRow key={setting.key} setting={setting} isPending={isPending} onSave={onSave} />
        ))}
      </div>
    </div>
  );
}
