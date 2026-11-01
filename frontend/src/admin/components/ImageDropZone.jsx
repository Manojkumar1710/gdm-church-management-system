/**
 * ImageDropZone
 *
 * A shared upload area that supports three input methods:
 *   1. Click  — opens the native file picker
 *   2. Drag   — drop image files onto the zone
 *   3. Paste  — Ctrl+V / Cmd+V while the zone is focused or hovered
 *
 * Props
 * ─────
 *   onFiles(File[])   — called with validated File objects
 *   multiple          — allow multiple files (default false)
 *   disabled          — disable all interaction
 *   preview           — current preview URL string (single-image mode)
 *   previewAlt        — alt text for the preview image
 *   className         — extra wrapper classes
 *
 * Validation (front-end only; backend validates again)
 * ─────────────────────────────────────────────────────
 *   Types : image/jpeg, image/jpg, image/png, image/webp
 *   Size  : max 10 MB per file
 *
 * Translation keys used
 * ──────────────────────
 *   admin.upload.clickOrDrag
 *   admin.upload.pasteHint
 *   admin.upload.dropNow
 *   admin.upload.multipleHint
 *   admin.upload.singleHint
 *   admin.upload.typeError
 *   admin.upload.sizeError
 *   admin.upload.pasteNoImage
 */

import { useRef, useState, useCallback, useEffect } from 'react';
import { CloudArrowUpIcon, PhotoIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useLanguage } from '../../context/LanguageContext';

const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_BYTES      = 10 * 1024 * 1024; // 10 MB

function validateFiles(files, t) {
  const valid   = [];
  const skipped = [];

  for (const file of files) {
    if (!ACCEPTED_TYPES.includes(file.type.toLowerCase())) {
      skipped.push({ file, reason: t('admin.upload.typeError', { name: file.name }) });
    } else if (file.size > MAX_BYTES) {
      skipped.push({ file, reason: t('admin.upload.sizeError', { name: file.name }) });
    } else {
      valid.push(file);
    }
  }

  return { valid, skipped };
}

export default function ImageDropZone({
  onFiles,
  multiple    = false,
  disabled    = false,
  preview     = null,
  previewAlt  = 'Preview',
  className   = '',
}) {
  const { t }             = useLanguage();
  const fileRef           = useRef(null);
  const zoneRef           = useRef(null);
  const [dragOver, setDragOver]   = useState(false);
  const [pasting,  setPasting]    = useState(false); // brief flash when paste fires

  // ── File processing ──────────────────────────────────────────────
  const processFiles = useCallback((rawFiles) => {
    if (!rawFiles?.length) return;
    const { valid, skipped } = validateFiles(Array.from(rawFiles), t);

    skipped.forEach(s => toast.error(s.reason, { duration: 4000 }));

    if (!valid.length) return;

    if (!multiple) {
      // Single-image mode: only take the first valid file
      onFiles([valid[0]]);
    } else {
      onFiles(valid);
    }
  }, [onFiles, multiple, t]);

  // ── Click ────────────────────────────────────────────────────────
  const handleClick = () => {
    if (disabled) return;
    fileRef.current?.click();
  };

  const handleFileChange = (e) => {
    processFiles(e.target.files);
    // Reset input so the same file can be re-selected after removal
    e.target.value = '';
  };

  // ── Drag & Drop ──────────────────────────────────────────────────
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Only clear when leaving the zone entirely, not a child element
    if (!zoneRef.current?.contains(e.relatedTarget)) {
      setDragOver(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    if (disabled) return;
    processFiles(e.dataTransfer.files);
  };

  // ── Clipboard paste ──────────────────────────────────────────────
  // We listen on the zone element itself. The paste event fires when:
  //   a) the zone div is focused (tabIndex=0), or
  //   b) focus is inside the zone (e.g. on the hidden file input).
  // This means paste only works when the admin is interacting with the
  // upload area, NOT when they are typing in unrelated text fields.
  const handlePaste = useCallback((e) => {
    if (disabled) return;

    const items = Array.from(e.clipboardData?.items || []);
    const imageItems = items.filter(item => ACCEPTED_TYPES.includes(item.type.toLowerCase()));

    if (!imageItems.length) {
      // Clipboard has content but no image — give a helpful hint
      const hasAnyContent = items.length > 0;
      if (hasAnyContent) {
        toast(t('admin.upload.pasteNoImage'), { icon: '📋', duration: 3000 });
      }
      return;
    }

    // Flash "Pasting…" for visual feedback
    setPasting(true);
    setTimeout(() => setPasting(false), 800);

    const files = imageItems
      .map(item => {
        const file = item.getAsFile();
        // Clipboard images often have no useful name — give one
        if (file && (!file.name || file.name === 'image.png')) {
          const ext = file.type === 'image/jpeg' ? 'jpg'
                    : file.type === 'image/webp'  ? 'webp'
                    : 'png';
          return new File([file], `pasted-${Date.now()}.${ext}`, { type: file.type });
        }
        return file;
      })
      .filter(Boolean);

    processFiles(files);
  }, [disabled, processFiles, t]);

  // Also listen for window paste when the zone is hovered (pointer over it).
  // This catches Ctrl+V when focus is on the backdrop or modal overlay.
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (!hovered) return;
    const handler = (e) => {
      // Don't hijack paste from actual text inputs/textareas
      const tag = document.activeElement?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
      handlePaste(e);
    };
    window.addEventListener('paste', handler);
    return () => window.removeEventListener('paste', handler);
  }, [hovered, handlePaste]);

  // ── Render ───────────────────────────────────────────────────────
  const isDragActive = dragOver && !disabled;
  const isPasteFlash = pasting && !disabled;

  const zoneBase = [
    'relative flex flex-col items-center justify-center gap-2',
    'rounded-2xl border-2 border-dashed p-6 text-center',
    'cursor-pointer select-none outline-none',
    'transition-all duration-200',
    disabled
      ? 'cursor-not-allowed opacity-50 border-church-border bg-church-light'
      : isDragActive
        ? 'border-church-blue bg-church-blue/5 scale-[1.01]'
        : isPasteFlash
          ? 'border-church-gold bg-church-gold/5'
          : 'border-church-border hover:border-church-blue hover:bg-church-light focus:border-church-blue focus:bg-church-light',
    className,
  ].filter(Boolean).join(' ');

  // Icon changes based on state
  const Icon = isDragActive    ? CloudArrowUpIcon
             : isPasteFlash    ? ClipboardDocumentIcon
             : preview         ? PhotoIcon
             : CloudArrowUpIcon;

  const iconColor = isDragActive  ? 'text-church-blue'
                  : isPasteFlash  ? 'text-church-gold'
                  : preview       ? 'text-church-blue/50'
                  : 'text-gray-300';

  return (
    <div
      ref={zoneRef}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label={t('admin.upload.clickOrDrag')}
      className={zoneBase}
      onClick={handleClick}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(); } }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onPaste={handlePaste}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Hidden file input */}
      <input
        ref={fileRef}
        type="file"
        multiple={multiple}
        accept="image/jpeg,image/jpg,image/png,image/webp"
        className="sr-only"
        onChange={handleFileChange}
        tabIndex={-1}
        disabled={disabled}
        aria-hidden="true"
      />

      {/* Current single-image preview */}
      {preview && !isDragActive && !isPasteFlash && (
        <img
          src={preview}
          alt={previewAlt}
          className="mb-2 h-28 w-full max-w-[200px] rounded-xl border border-church-border object-cover shadow-sm"
        />
      )}

      {/* Icon */}
      <Icon className={`h-10 w-10 ${iconColor} transition-colors duration-200`} aria-hidden="true" />

      {/* Primary label */}
      <p className="text-sm text-gray-600">
        {isDragActive ? (
          <span className="font-semibold text-church-blue">{t('admin.upload.dropNow')}</span>
        ) : isPasteFlash ? (
          <span className="font-semibold text-church-gold">{t('admin.upload.pasting')}</span>
        ) : (
          <>
            <span className="font-semibold text-church-blue">{t('admin.upload.clickOrDrag')}</span>
          </>
        )}
      </p>

      {/* Paste hint */}
      {!isDragActive && !isPasteFlash && (
        <p className="text-xs text-gray-400">{t('admin.upload.pasteHint')}</p>
      )}

      {/* Size/format hint */}
      {!isDragActive && !isPasteFlash && (
        <p className="text-xs text-gray-400">
          {multiple ? t('admin.upload.multipleHint') : t('admin.upload.singleHint')}
        </p>
      )}
    </div>
  );
}
