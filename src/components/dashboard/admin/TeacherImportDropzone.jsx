import { useRef, useState } from 'react';
import { FileSpreadsheet, UploadCloud, X } from 'lucide-react';
import { useT } from '@/hooks/useT';

const ACCEPTED_EXTENSIONS = ['.csv', '.xlsx', '.xls'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // mirrors the backend's max:5120 (KB) rule

function isAcceptedFile(file) {
  return ACCEPTED_EXTENSIONS.some((ext) => file.name.toLowerCase().endsWith(ext));
}

export function TeacherImportDropzone({ file, onFileChange }) {
  const t = useT();
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);

  const validateAndSet = (selected) => {
    if (!selected) return;
    if (!isAcceptedFile(selected)) {
      setError(t('dashboard.adminTeacherImport.errorType'));
      return;
    }
    if (selected.size > MAX_SIZE_BYTES) {
      setError(t('dashboard.adminTeacherImport.errorSize'));
      return;
    }
    setError(null);
    onFileChange(selected);
  };

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          validateAndSet(e.dataTransfer.files?.[0]);
        }}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-10 text-center transition-colors ${
          isDragging ? 'border-primary bg-primary-light/40' : 'border-line bg-white hover:bg-canvas'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_EXTENSIONS.join(',')}
          className="hidden"
          onChange={(e) => validateAndSet(e.target.files?.[0])}
        />

        {file ? (
          <>
            <FileSpreadsheet size={32} className="text-primary" />
            <div>
              <p className="font-semibold text-ink">{file.name}</p>
              <p className="text-xs text-ink-soft">{(file.size / 1024).toFixed(0)} KB</p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onFileChange(null);
              }}
              className="flex items-center gap-1 text-xs font-medium text-accent-pink hover:opacity-70"
            >
              {t('dashboard.adminTeacherImport.remove')}
              <X size={13} />
            </button>
          </>
        ) : (
          <>
            <UploadCloud size={32} className="text-ink-soft" />
            <p className="font-semibold text-ink">{t('dashboard.adminTeacherImport.dropzoneTitle')}</p>
            <p className="text-xs text-ink-soft">{t('dashboard.adminTeacherImport.dropzoneHint')}</p>
          </>
        )}
      </div>

      {error && <p className="mt-2 text-right text-xs text-accent-pink">{error}</p>}
    </div>
  );
}
