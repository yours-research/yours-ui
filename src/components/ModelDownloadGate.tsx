import { MatrixOrb } from '../icons/MatrixOrb.js';

export interface ModelCatalogChoice {
  id: string;
  label: string;
  subtitle: string;
  sizeLabel: string;
  cached?: boolean;
  recommended?: boolean;
}

export interface ModelDownloadProgress {
  percent: number;
  loadedLabel: string;
  totalLabel: string;
  verifiedChunks: number;
  totalChunks: number;
}

export interface ModelDownloadGateProps {
  title?: string;
  subtitle?: string;
  models: readonly ModelCatalogChoice[];
  selectedModelId: string;
  onSelectModel: (id: string) => void;
  hardwareLabel?: string;
  isDownloading?: boolean;
  progress?: ModelDownloadProgress | null;
  error?: string | null;
  onStartDownload: () => void;
  onCancelDownload?: () => void;
  footnote?: string;
}

/**
 * Opt-in model selection and OPFS download gate displaying hardware readiness
 * and live chunk verification progress compatible with `@yours/models`.
 */
export function ModelDownloadGate({
  title = 'Try Pragma locally.',
  subtitle = 'Opt in to cache weights directly into browser OPFS storage.',
  models,
  selectedModelId,
  onSelectModel,
  hardwareLabel,
  isDownloading = false,
  progress,
  error,
  onStartDownload,
  onCancelDownload,
  footnote,
}: ModelDownloadGateProps) {
  const selected = models.find((m) => m.id === selectedModelId) ?? models[0];
  const pct = progress?.percent ?? 0;

  return (
    <div className="yui-optin-gate">
      <MatrixOrb state={isDownloading ? 'thinking' : 'idle'} size={28} />
      <div>
        <h2 className="yui-optin-title">{title}</h2>
        <p className="yui-optin-sub">{subtitle}</p>
      </div>

      <div className="yui-starter-stack" role="radiogroup" aria-label="Select local model weights">
        {models.map((m) => {
          const checked = m.id === selectedModelId;
          return (
            <button
              key={m.id}
              type="button"
              role="radio"
              aria-checked={checked}
              disabled={isDownloading}
              className="yui-prompt-capsule"
              onClick={() => onSelectModel(m.id)}
            >
              <span className="yui-prompt-capsule-left">
                <span
                  className={checked ? 'yui-radio-ring is-checked' : 'yui-radio-ring'}
                  aria-hidden="true"
                />
                <span>
                  <span className="yui-prompt-capsule-title">{m.label}</span>
                  <div className="yui-prompt-capsule-sub">{m.subtitle}</div>
                </span>
              </span>
              {m.cached ? (
                <span className="yui-badge yui-badge--ready">Cached</span>
              ) : m.recommended ? (
                <span className="yui-badge">Recommended</span>
              ) : (
                <span className="yui-badge">{m.sizeLabel}</span>
              )}
            </button>
          );
        })}
      </div>

      {hardwareLabel ? <div className="yui-speed-readout">{hardwareLabel}</div> : null}
      {error ? (
        <div className="yui-error-card" role="alert">
          <span>{error}</span>
        </div>
      ) : null}

      {isDownloading ? (
        <div className="yui-download-card" aria-live="polite">
          <div className="yui-action-row">
            <span className="yui-prompt-capsule-title">
              Verifying {selected?.label ?? selectedModelId}...
            </span>
            <span className="yui-speed-readout">{pct}%</span>
          </div>
          <progress className="yui-download-progress" max={100} value={pct} />
          <div className="yui-action-row">
            <span className="yui-speed-readout">
              {progress?.loadedLabel ?? '0 GB'} / {progress?.totalLabel ?? selected?.sizeLabel ?? ''} &middot; chunk{' '}
              {progress?.verifiedChunks ?? 0}/{progress?.totalChunks ?? 0}
            </span>
            {onCancelDownload ? (
              <button type="button" className="yui-icon-btn" onClick={onCancelDownload}>
                Cancel
              </button>
            ) : null}
          </div>
        </div>
      ) : (
        <button type="button" className="yui-pill-btn yui-pill-btn--primary" onClick={onStartDownload}>
          Download &amp; verify weights ({selected?.sizeLabel ?? ''})
        </button>
      )}

      {footnote ? <div className="yui-genui-muted">{footnote}</div> : null}
    </div>
  );
}
