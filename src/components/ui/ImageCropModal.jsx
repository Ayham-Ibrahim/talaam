import { useEffect, useRef, useState } from "react";
import { Check, X, ZoomIn } from "lucide-react";
import { useT } from "@/hooks/useT";

const VIEWPORT_SIZE = 280;
const OUTPUT_SIZE = 512;

/**
 * Square avatar cropper — drag to re-center, slider to zoom, confined so the
 * image can never leave the crop frame. Output is always a fixed-size square
 * JPEG regardless of the source image's original aspect ratio.
 */
export function ImageCropModal({ file, onCancel, onConfirm, isSaving }) {
  const t = useT();
  const [imgSrc, setImgSrc] = useState(null);
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });
  const [scale, setScale] = useState(1);
  const [minScale, setMinScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragRef = useRef(null);
  const imgRef = useRef(null);

  useEffect(() => {
    if (!file) return undefined;
    const url = URL.createObjectURL(file);
    setImgSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const clampOffset = (next, s, size = naturalSize) => {
    const w = size.width * s;
    const h = size.height * s;
    const maxX = Math.max(0, (w - VIEWPORT_SIZE) / 2);
    const maxY = Math.max(0, (h - VIEWPORT_SIZE) / 2);
    return {
      x: Math.min(maxX, Math.max(-maxX, next.x)),
      y: Math.min(maxY, Math.max(-maxY, next.y)),
    };
  };

  const handleImgLoad = () => {
    const img = imgRef.current;
    const size = { width: img.naturalWidth, height: img.naturalHeight };
    const cover = Math.max(VIEWPORT_SIZE / size.width, VIEWPORT_SIZE / size.height);
    setNaturalSize(size);
    setMinScale(cover);
    setScale(cover);
    setOffset({ x: 0, y: 0 });
  };

  const onPointerDown = (e) => {
    dragRef.current = { startX: e.clientX, startY: e.clientY, offset };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setOffset(clampOffset({ x: dragRef.current.offset.x + dx, y: dragRef.current.offset.y + dy }, scale));
  };
  const onPointerUp = () => {
    dragRef.current = null;
  };

  const handleZoom = (e) => {
    const next = Number(e.target.value);
    setScale(next);
    setOffset((o) => clampOffset(o, next));
  };

  const handleConfirm = () => {
    const img = imgRef.current;
    if (!img) return;

    const drawnW = naturalSize.width * scale;
    const drawnH = naturalSize.height * scale;
    const viewLeft = (drawnW - VIEWPORT_SIZE) / 2 - offset.x;
    const viewTop = (drawnH - VIEWPORT_SIZE) / 2 - offset.y;
    const sx = viewLeft / scale;
    const sy = viewTop / scale;
    const sSize = VIEWPORT_SIZE / scale;

    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, sx, sy, sSize, sSize, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
    canvas.toBlob(
      (blob) => {
        if (blob) onConfirm(new File([blob], "avatar.jpg", { type: "image/jpeg" }));
      },
      "image/jpeg",
      0.92,
    );
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4" onClick={onCancel}>
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-lift"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-ink">{t("imageCrop.title")}</h3>
          <button
            type="button"
            onClick={onCancel}
            aria-label={t("imageCrop.cancel")}
            className="rounded-full p-1 text-ink-soft hover:bg-line/50"
          >
            <X size={18} />
          </button>
        </div>

        <p className="mt-1 text-xs text-ink-soft">{t("imageCrop.hint")}</p>

        <div
          className="relative mx-auto mt-4 touch-none select-none overflow-hidden rounded-2xl bg-canvas ring-2 ring-primary/30"
          style={{ width: VIEWPORT_SIZE, height: VIEWPORT_SIZE, cursor: dragRef.current ? "grabbing" : "grab" }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
        >
          {imgSrc && (
            <img
              ref={imgRef}
              src={imgSrc}
              alt=""
              onLoad={handleImgLoad}
              draggable={false}
              className="pointer-events-none absolute left-1/2 top-1/2 max-w-none"
              style={{
                width: naturalSize.width * scale || undefined,
                height: naturalSize.height * scale || undefined,
                transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px)`,
              }}
            />
          )}
        </div>

        <div className="mt-4 flex items-center gap-3">
          <ZoomIn size={16} className="shrink-0 text-ink-soft" />
          <input
            type="range"
            min={minScale}
            max={minScale * 3}
            step={0.01}
            value={scale}
            onChange={handleZoom}
            className="w-full accent-primary"
          />
        </div>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-line py-2.5 text-sm font-medium text-ink transition-colors hover:bg-canvas"
          >
            {t("imageCrop.cancel")}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSaving || !imgSrc}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <Check size={16} />
            {isSaving ? t("imageCrop.saving") : t("imageCrop.save")}
          </button>
        </div>
      </div>
    </div>
  );
}
