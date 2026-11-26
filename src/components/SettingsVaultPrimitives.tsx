import { useId, useState, type ReactNode } from 'react';
import { CheckIcon, ShieldIcon, TrashIcon, UploadIcon } from '../icons/ApertureIcon.js';
import { CardHeaderChrome, cn } from './CardChrome.js';
import { KbdHint } from './KbdHint.js';
import { StatusBadge, type StatusBadgeTone } from './StatusBadge.js';

export interface SettingsToggleRowProps {
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
  badge?: string;
  badgeTone?: StatusBadgeTone;
  shortcut?: string | readonly string[];
  disabled?: boolean;
  className?: string;
}

/**
 * Minimalist Page 9 preference toggle row with monochrome hardware switch,
 * optional status badge, keyboard shortcut chip, and concise description.
 */
export function SettingsToggleRow({
  label,
  description,
  checked,
  onCheckedChange,
  badge,
  badgeTone = 'neutral',
  shortcut,
  disabled = false,
  className,
}: SettingsToggleRowProps) {
  const rowClass = ['yui-row-between', 'yui-setting-row', disabled ? 'is-disabled' : '', className]
    .filter(Boolean)
    .join(' ');
  const switchClass = ['yui-switch', checked ? 'is-checked' : ''].filter(Boolean).join(' ');

  return (
    <div data-slot="settings-toggle-row" className={rowClass}>
      <div className="yui-setting-copy">
        <div className="yui-setting-title-row">
          <span className="yui-setting-title">{label}</span>
          {badge ? <StatusBadge tone={badgeTone}>{badge}</StatusBadge> : null}
          {shortcut ? <KbdHint keys={shortcut} /> : null}
        </div>
        {description ? <p className="yui-muted-note">{description}</p> : null}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        className={switchClass}
        onClick={() => onCheckedChange(!checked)}
      >
        <span className="yui-switch-thumb" aria-hidden="true" />
      </button>
    </div>
  );
}

export interface SettingsSectionProps {
  title: string;
  subtitle?: string;
  badge?: string;
  badgeTone?: StatusBadgeTone;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

/**
 * Grouped preference section housing `SettingsToggleRow` items cleanly inside
 * Cotton Paper & Obsidian Dark hairline surfaces.
 */
export function SettingsSection({
  title,
  subtitle,
  badge,
  badgeTone = 'neutral',
  children,
  footer,
  className,
}: SettingsSectionProps) {
  const cardClass = cn('yui-card-shell yui-settings-card', className);

  return (
    <section data-slot="settings-section" className={cardClass} aria-label={title}>
      <CardHeaderChrome
        title={title}
        subtitle={subtitle}
        right={badge ? <StatusBadge tone={badgeTone}>{badge}</StatusBadge> : null}
      />
      <div className="yui-list-plain yui-div-list">{children}</div>
      {footer ? <footer className="yui-settings-foot">{footer}</footer> : null}
    </section>
  );
}

export interface LocalVaultExportCardProps {
  title?: string;
  subtitle?: string;
  recordCountLabel?: string;
  passphraseLabel?: string;
  passphrasePlaceholder?: string;
  minPassphraseLength?: number;
  busy?: boolean;
  statusMessage?: string | null;
  error?: string | null;
  onExportEncrypted?: (passphrase: string) => void;
  onImportEncrypted?: (passphrase: string) => void;
  onImportFile?: (file: File) => void;
  importAccept?: string;
  selectedFileName?: string | null;
  fileDropLabel?: string;
  onWipeAll?: () => void;
  exportLabel?: string;
  importLabel?: string;
  wipeLabel?: string;
  wipeConfirmPrompt?: string;
  wipeConfirmActionLabel?: string;
  className?: string;
}

/**
 * Encrypted local vault backup, restore, and two-step wipe panel aligned
 * with `@yours/memory`'s `exportEncrypted`, `importEncrypted`, and `wipeAll` contract.
 */
export function LocalVaultExportCard({
  title = 'Encrypted local vault',
  subtitle = 'AES-GCM backup of local SQLite FTS5 & HNSW memory.',
  recordCountLabel,
  passphraseLabel = 'Vault passphrase',
  passphrasePlaceholder = 'Enter passphrase (8+ characters)',
  minPassphraseLength = 8,
  busy = false,
  statusMessage,
  error,
  onExportEncrypted,
  onImportEncrypted,
  onImportFile,
  importAccept = '.yvlt,.json,.bin',
  selectedFileName,
  fileDropLabel = 'Drop .yvlt backup or choose file',
  onWipeAll,
  exportLabel = 'Export vault',
  importLabel = 'Import',
  wipeLabel = 'Wipe local memory',
  wipeConfirmPrompt = 'Erase all local memory shards?',
  wipeConfirmActionLabel = 'Confirm wipe',
  className,
}: LocalVaultExportCardProps) {
  const inputId = useId();
  const fileInputId = useId();
  const [passphrase, setPassphrase] = useState('');
  const [confirmWipe, setConfirmWipe] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const validPassphrase = passphrase.trim().length >= minPassphraseLength;
  const cardClass = ['yui-card-shell', 'yui-vault-card', className].filter(Boolean).join(' ');
  const dropClass = ['yui-vault-drop', isDragging ? 'is-dragging' : '']
    .filter(Boolean)
    .join(' ');
  const hasDualActions = Boolean(onImportEncrypted && onExportEncrypted);
  const actionsClass = [
    'yui-vault-actions',
    hasDualActions ? 'yui-vault-actions--dual' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <section data-slot="local-vault-export-card" className={cardClass} aria-label={title}>
      <CardHeaderChrome
        icon={<ShieldIcon size={13} className="yui-privacy-icon" />}
        title={title}
        subtitle={subtitle}
        right={recordCountLabel ? <StatusBadge tone="neutral">{recordCountLabel}</StatusBadge> : null}
      />

      <div className="yui-vault-field">
        <label htmlFor={inputId} className="yui-params-label">
          {passphraseLabel}
        </label>
        <input
          id={inputId}
          type="password"
          autoComplete="off"
          value={passphrase}
          disabled={busy}
          placeholder={passphrasePlaceholder}
          className="yui-vault-input"
          onChange={(event) => setPassphrase(event.target.value)}
        />
      </div>

      {onImportFile ? (
        <label
          htmlFor={fileInputId}
          data-slot="vault-file-drop"
          className={dropClass}
          onDragOver={(event) => {
            event.preventDefault();
            if (!busy) setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            if (busy) return;
            const file = event.dataTransfer.files?.[0];
            if (file) onImportFile(file);
          }}
        >
          <UploadIcon size={12} />
          <span className="yui-vault-drop-label">
            {selectedFileName ?? fileDropLabel}
          </span>
          <input
            id={fileInputId}
            type="file"
            accept={importAccept}
            disabled={busy}
            className="yui-vault-file-input"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onImportFile(file);
            }}
          />
        </label>
      ) : null}

      {error ? (
        <div className="yui-vault-feedback yui-vault-feedback--error" role="alert">
          {error}
        </div>
      ) : statusMessage ? (
        <div className="yui-vault-feedback" role="status">
          <CheckIcon size={12} />
          <span>{statusMessage}</span>
        </div>
      ) : null}

      {onImportEncrypted || onExportEncrypted ? (
        <div className={actionsClass}>
          {onImportEncrypted ? (
            <button
              type="button"
              disabled={busy || !validPassphrase}
              className="yui-pill-btn yui-pill-btn--ghost"
              onClick={() => onImportEncrypted(passphrase)}
            >
              <UploadIcon size={12} />
              <span>{importLabel}</span>
            </button>
          ) : null}
          {onExportEncrypted ? (
            <button
              type="button"
              disabled={busy || !validPassphrase}
              className="yui-pill-btn yui-pill-btn--primary"
              onClick={() => onExportEncrypted(passphrase)}
            >
              <span>{exportLabel}</span>
            </button>
          ) : null}
        </div>
      ) : null}

      {onWipeAll ? (
        <div className="yui-vault-danger-zone">
          {confirmWipe ? (
            <div className="yui-vault-confirm-row">
              <span className="yui-vault-confirm-copy">{wipeConfirmPrompt}</span>
              <div className="yui-action-group">
                <button
                  type="button"
                  disabled={busy}
                  className="yui-micro-pill"
                  onClick={() => setConfirmWipe(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={busy}
                  className="yui-micro-pill yui-micro-pill--danger"
                  onClick={() => {
                    setConfirmWipe(false);
                    onWipeAll();
                  }}
                >
                  {wipeConfirmActionLabel}
                </button>
              </div>
            </div>
          ) : (
            <>
              <span className="yui-muted-note">Irreversible local reset</span>
              <button
                type="button"
                disabled={busy}
                className="yui-micro-pill yui-micro-pill--danger"
                onClick={() => setConfirmWipe(true)}
              >
                <TrashIcon size={11} />
                <span>{wipeLabel}</span>
              </button>
            </>
          )}
        </div>
      ) : null}
    </section>
  );
}
