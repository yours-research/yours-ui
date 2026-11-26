import { useId, useState, type ReactNode } from 'react';
import { ShieldIcon, TrashIcon, UploadIcon } from '../icons/ApertureIcon.js';
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
  const rowClass = ['yui-setting-row', disabled ? 'is-disabled' : '', className]
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
        {description ? <p className="yui-setting-desc">{description}</p> : null}
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
  const cardClass = ['yui-settings-card', className].filter(Boolean).join(' ');

  return (
    <section data-slot="settings-section" className={cardClass} aria-label={title}>
      <header className="yui-settings-head">
        <div className="yui-col-min">
          <div className="yui-setting-title-row">
            <h3 className="yui-genui-title">{title}</h3>
            {badge ? <StatusBadge tone={badgeTone}>{badge}</StatusBadge> : null}
          </div>
          {subtitle ? <p className="yui-genui-muted">{subtitle}</p> : null}
        </div>
      </header>
      <div className="yui-settings-list">{children}</div>
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
  onWipeAll,
  exportLabel = 'Export vault',
  importLabel = 'Import',
  wipeLabel = 'Wipe local memory',
  wipeConfirmPrompt = 'Erase all local memory shards?',
  wipeConfirmActionLabel = 'Confirm wipe',
  className,
}: LocalVaultExportCardProps) {
  const inputId = useId();
  const [passphrase, setPassphrase] = useState('');
  const [confirmWipe, setConfirmWipe] = useState(false);

  const validPassphrase = passphrase.trim().length >= minPassphraseLength;
  const cardClass = ['yui-vault-card', className].filter(Boolean).join(' ');

  return (
    <section data-slot="local-vault-export-card" className={cardClass} aria-label={title}>
      <div className="yui-vault-head">
        <div className="yui-col-min">
          <div className="yui-setting-title-row">
            <ShieldIcon size={13} className="yui-hw-icon" />
            <h3 className="yui-genui-title">{title}</h3>
          </div>
          {subtitle ? <p className="yui-genui-muted">{subtitle}</p> : null}
        </div>
        {recordCountLabel ? (
          <StatusBadge tone="neutral">{recordCountLabel}</StatusBadge>
        ) : null}
      </div>

      <div className="yui-vault-field">
        <label htmlFor={inputId} className="yui-vault-label">
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

      {error ? (
        <div className="yui-vault-feedback yui-vault-feedback--error" role="alert">
          {error}
        </div>
      ) : statusMessage ? (
        <div className="yui-vault-feedback" role="status">
          {statusMessage}
        </div>
      ) : null}

      <div className="yui-vault-actions">
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
            <button
              type="button"
              disabled={busy}
              className="yui-micro-pill yui-micro-pill--danger"
              onClick={() => setConfirmWipe(true)}
            >
              <TrashIcon size={11} />
              <span>{wipeLabel}</span>
            </button>
          )}
        </div>
      ) : null}
    </section>
  );
}
