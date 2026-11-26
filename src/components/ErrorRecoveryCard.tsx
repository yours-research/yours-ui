import { useId, useState } from 'react';
import {
  AlertIcon,
  CheckIcon,
  ChevronDownIcon,
  CopyIcon,
  LocalDeviceIcon,
  RetryIcon,
} from '../icons/ApertureIcon.js';
import { MatrixOrb } from '../icons/MatrixOrb.js';
import { useCopyFeedback } from '../utils/clipboard.js';

export interface ErrorRecoveryCardProps {
  title: string;
  diagnosis: string;
  badgeLabel?: string;
  diagnostics?: string;
  diagnosticsLabel?: string;
  defaultDiagnosticsOpen?: boolean;
  retryLabel?: string;
  switchModelLabel?: string;
  retrying?: boolean;
  disabled?: boolean;
  onRetry?: () => void;
  onSwitchModel?: () => void;
  onCopyDiagnostics?: (diagnostics: string) => void;
  className?: string;
}

/**
 * Calm Cotton Paper / Obsidian Dark local runtime failure & recovery card
 * for WebGPU adapter loss, VRAM pressure, checksum mismatch, or sandbox errors
 * with collapsible monospace diagnostics and one-click recovery actions.
 */
export function ErrorRecoveryCard({
  title,
  diagnosis,
  badgeLabel = 'Runtime interrupted',
  diagnostics,
  diagnosticsLabel = 'Diagnostic trace',
  defaultDiagnosticsOpen = false,
  retryLabel = 'Retry',
  switchModelLabel = 'Switch model',
  retrying = false,
  disabled = false,
  onRetry,
  onSwitchModel,
  onCopyDiagnostics,
  className,
}: ErrorRecoveryCardProps) {
  const [traceOpen, setTraceOpen] = useState(defaultDiagnosticsOpen);
  const { copied, triggerCopy } = useCopyFeedback();
  const traceId = useId();

  const handleCopy = () => {
    if (!diagnostics) return;
    triggerCopy(diagnostics);
    onCopyDiagnostics?.(diagnostics);
  };

  const rootClass = ['yui-recovery-card', className].filter(Boolean).join(' ');
  const chevronClass = ['yui-recovery-chevron', traceOpen ? 'is-open' : '']
    .filter(Boolean)
    .join(' ');

  return (
    <section
      data-slot="error-recovery-card"
      role="region"
      aria-label={title}
      className={rootClass}
    >
      <div className="yui-recovery-top" role="alert">
        <div className="yui-recovery-head">
          <span className="yui-recovery-icon" aria-hidden="true">
            <AlertIcon size={14} />
          </span>
          <div className="yui-col-min">
            {badgeLabel ? (
              <span className="yui-recovery-badge">
                <span className="yui-recovery-badge-dot" aria-hidden="true" />
                <span>{badgeLabel}</span>
              </span>
            ) : null}
            <h3 className="yui-recovery-title">{title}</h3>
          </div>
        </div>
        <p className="yui-recovery-diagnosis">{diagnosis}</p>
      </div>

      {diagnostics ? (
        <div className="yui-recovery-trace-wrap">
          <button
            type="button"
            className="yui-recovery-toggle"
            aria-expanded={traceOpen}
            aria-controls={traceId}
            onClick={() => setTraceOpen((prev) => !prev)}
          >
            <span className="yui-recovery-toggle-label">{diagnosticsLabel}</span>
            <ChevronDownIcon size={12} className={chevronClass} />
          </button>

          {traceOpen ? (
            <div id={traceId} className="yui-recovery-trace">
              <div className="yui-recovery-trace-bar">
                <span className="yui-recovery-trace-cap">LOCAL TRACE</span>
                <button
                  type="button"
                  className="yui-recovery-copy"
                  aria-label="Copy diagnostics"
                  onClick={handleCopy}
                >
                  {copied ? <CheckIcon size={11.5} /> : <CopyIcon size={11.5} />}
                  <span>{copied ? 'Copied' : 'Copy diagnostics'}</span>
                </button>
              </div>
              <pre className="yui-recovery-pre">
                <code>{diagnostics}</code>
              </pre>
            </div>
          ) : null}
        </div>
      ) : null}

      {onRetry || onSwitchModel ? (
        <div className="yui-recovery-actions">
          {onSwitchModel ? (
            <button
              type="button"
              className="yui-pill-btn yui-recovery-switch"
              disabled={disabled}
              onClick={onSwitchModel}
            >
              <LocalDeviceIcon size={12} />
              <span>{switchModelLabel}</span>
            </button>
          ) : null}
          {onRetry ? (
            <button
              type="button"
              className="yui-pill-btn yui-pill-btn--primary yui-recovery-retry"
              disabled={disabled || retrying}
              onClick={onRetry}
            >
              {retrying ? <MatrixOrb state="streaming" size={12} /> : <RetryIcon size={12} />}
              <span>{retryLabel}</span>
            </button>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
