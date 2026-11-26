import { useEffect, useState, type ReactNode } from 'react';
import {
  ApertureIcon,
  ArrowDownIcon,
  ArrowRightIcon,
  BookmarkIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronUpIcon,
  ChevronRightIcon,
  CopyIcon,
  DocumentIcon,
  ImageIcon,
  PageIcon,
  RetryIcon,
  ThumbDownIcon,
  ThumbUpIcon,
  UploadIcon,
  VolumeIcon,
  XIcon,
} from '../icons/ApertureIcon.js';
import type { ApertureIconName } from '../icons/iconData.js';
import { MatrixOrb } from '../icons/MatrixOrb.js';
import { useCopyFeedback } from '../utils/clipboard.js';

export interface AttachmentItem {
  id: string;
  name: string;
  kind?: 'image' | 'file';
  status?: 'ready' | 'uploading';
  progressPercent?: number;
}

export interface AttachmentStripProps {
  items: readonly AttachmentItem[];
  onRemove?: (id: string) => void;
}

/** Compact chip strip for queued documents and image attachments. */
export function AttachmentStrip({ items, onRemove }: AttachmentStripProps) {
  if (items.length === 0) return null;
  return (
    <div className="yui-attachment-strip">
      {items.map((item) => (
        <div key={item.id} className="yui-attachment-chip">
          {item.kind === 'image' ? <ImageIcon size={13} /> : <DocumentIcon size={13} />}
          <span>{item.name}</span>
          {item.status === 'uploading' && item.progressPercent !== undefined ? (
            <span className="yui-speed-readout">{item.progressPercent}%</span>
          ) : null}
          {onRemove ? (
            <button
              type="button"
              className="yui-icon-btn"
              aria-label={`Remove ${item.name}`}
              onClick={() => onRemove(item.id)}
            >
              <XIcon size={11} />
            </button>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export interface AttachmentDropzoneProps {
  active?: boolean;
  label?: string;
}

/** Drag-and-drop overlay feedback target for local documents and PDFs. */
export function AttachmentDropzone({
  active = false,
  label = 'Drop PDF, Markdown, CSV, or image to read locally',
}: AttachmentDropzoneProps) {
  return (
    <div className={active ? 'yui-dropzone is-active' : 'yui-dropzone'}>
      <UploadIcon size={15} className="yui-icon" />
      <span>{label}</span>
    </div>
  );
}

export interface PromptStarterItem {
  id: string;
  label: string;
  prompt?: string;
  subtitle?: string;
  icon?: ApertureIconName;
}

export interface PromptCapsuleStackProps {
  items: readonly PromptStarterItem[];
  onSelect: (item: PromptStarterItem) => void;
}

/** Stacked Page 9 starter prompt capsules anchored beneath the 21-dot MatrixOrb. */
export function PromptCapsuleStack({ items, onSelect }: PromptCapsuleStackProps) {
  return (
    <div className="yui-w-full yui-col-8">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className="yui-prompt-capsule"
          onClick={() => onSelect(item)}
        >
          <span className="yui-prompt-capsule-left">
            {item.icon ? <ApertureIcon name={item.icon} size={14} /> : null}
            <span>
              <span className="yui-prompt-capsule-title">{item.label}</span>
              {item.subtitle ? <div className="yui-prompt-capsule-sub">{item.subtitle}</div> : null}
            </span>
          </span>
          <ArrowRightIcon size={12} />
        </button>
      ))}
    </div>
  );
}

export interface FollowUpSuggestionsProps {
  suggestions: readonly string[];
  onSelect: (suggestion: string) => void;
}

/** Follow-up prompt list anchored cleanly after an assistant turn. */
export function FollowUpSuggestions({ suggestions, onSelect }: FollowUpSuggestionsProps) {
  if (suggestions.length === 0) return null;
  return (
    <PromptCapsuleStack
      items={suggestions.map((s) => ({ id: s, label: s }))}
      onSelect={(item) => onSelect(item.label)}
    />
  );
}

export interface SuggestionChipRowProps {
  items: readonly PromptStarterItem[];
  onSelect: (item: PromptStarterItem) => void;
}

/** Horizontal wrapping row of compact rounded suggestion pills. */
export function SuggestionChipRow({ items, onSelect }: SuggestionChipRowProps) {
  return (
    <div className="yui-row yui-wrap">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className="yui-suggestion-pill"
          onClick={() => onSelect(item)}
        >
          {item.icon ? <ApertureIcon name={item.icon} size={12} /> : null}
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );
}

export interface ScrollToBottomButtonProps {
  onClick: () => void;
  ariaLabel?: string;
}

/** Tactile circular scroll-to-latest control. */
export function ScrollToBottomButton({
  onClick,
  ariaLabel = 'Scroll to bottom',
}: ScrollToBottomButtonProps) {
  return (
    <button
      type="button"
      className="yui-scroll-bottom-btn"
      aria-label={ariaLabel}
      onClick={onClick}
    >
      <ArrowDownIcon size={14} strokeWidth={2} />
    </button>
  );
}

export interface QuotedContextBannerProps {
  quote: string;
  onDismiss?: () => void;
}

/** Selected text quote block anchored at the top of the composer. */
export function QuotedContextBanner({ quote, onDismiss }: QuotedContextBannerProps) {
  return (
    <div className="yui-quote-banner">
      <div className="yui-quote-accent" aria-hidden="true" />
      <div className="yui-flex-1 yui-sub-12">{quote}</div>
      {onDismiss ? (
        <button
          type="button"
          className="yui-icon-btn"
          aria-label="Remove quote"
          onClick={onDismiss}
        >
          <XIcon size={12} />
        </button>
      ) : null}
    </div>
  );
}

export interface UserMessageBubbleProps {
  content: string;
  contextLabel?: string;
  isEditing?: boolean;
  onStartEdit?: () => void;
  onSaveEdit?: (nextContent: string) => void;
  onCancelEdit?: () => void;
  onCopy?: () => void;
}

/**
 * Right-aligned user turn capsule with optional origin context tag and inline
 * edit-and-branch mode.
 */
export function UserMessageBubble({
  content,
  contextLabel,
  isEditing = false,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onCopy,
}: UserMessageBubbleProps) {
  const [draft, setDraft] = useState(content);

  useEffect(() => {
    if (!isEditing) {
      setDraft(content);
    }
  }, [content, isEditing]);

  if (isEditing) {
    return (
      <div className="yui-edit-card">
        <textarea
          className="yui-edit-textarea"
          value={draft}
          aria-label="Edit message"
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setDraft(content);
              onCancelEdit?.();
            }
          }}
        />
        <div className="yui-btn-row">
          <button
            type="button"
            className="yui-pill-btn yui-pill-btn--ghost"
            onClick={() => {
              setDraft(content);
              onCancelEdit?.();
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            className="yui-pill-btn yui-pill-btn--primary"
            onClick={() => {
              if (draft.trim()) onSaveEdit?.(draft.trim());
            }}
          >
            Save &amp; resend
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="yui-user-row">
      <div className="yui-user-bubble">
        {contextLabel ? (
          <div className="yui-dl-telemetry-item yui-muted-note">
            <PageIcon size={11} />
            <span>{contextLabel}</span>
          </div>
        ) : null}
        <div className="yui-user-text">{content}</div>
      </div>
      {onStartEdit || onCopy ? (
        <div className="yui-action-group yui-user-actions">
          {onStartEdit ? (
            <button
              type="button"
              className="yui-icon-btn"
              aria-label="Edit prompt"
              onClick={() => {
                setDraft(content);
                onStartEdit();
              }}
            >
              <RetryIcon size={12} />
            </button>
          ) : null}
          {onCopy ? (
            <button
              type="button"
              className="yui-icon-btn"
              aria-label="Copy prompt"
              onClick={onCopy}
            >
              <CopyIcon size={12} />
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export interface AssistantMessageProps {
  children: ReactNode;
  footer?: ReactNode;
}

/** Editorial assistant turn container aligned cleanly to the recessed stage. */
export function AssistantMessage({ children, footer }: AssistantMessageProps) {
  return (
    <div className="yui-assistant-turn">
      <div className="yui-assistant-body">{children}</div>
      {footer}
    </div>
  );
}

export interface SpeedMetricsSummary {
  tokensPerSec?: number;
  ttftMs?: number;
  outputTokens?: number;
  /** Speculative decoding speedup multiplier (e.g. `1.58` -> `1.58x`). */
  speedupMultiplier?: number;
  /** Mean accepted tokens per verify step (e.g. `3.4` -> `3.4 tok/step`). */
  acceptedTokPerStep?: number;
  /** Quantized VRAM footprint delta label (e.g. `"-254 MiB"`). */
  vramDeltaLabel?: string;
}

export interface ActionBarProps {
  onCopy?: () => void;
  onRegenerate?: () => void;
  onSpeak?: () => void;
  onSave?: () => void;
  onThumbUp?: () => void;
  onThumbDown?: () => void;
  feedback?: 'up' | 'down' | null;
  speedMetrics?: SpeedMetricsSummary;
  rightSlot?: ReactNode;
}

/**
 * Monochrome icon action bar (`copy`, `retry`, `thumb-up`, `thumb-down`, `bookmark`,
 * `volume`) with optional tabular-nums local inference speed telemetry.
 */
export function ActionBar({
  onCopy,
  onRegenerate,
  onSpeak,
  onSave,
  onThumbUp,
  onThumbDown,
  feedback = null,
  speedMetrics,
  rightSlot,
}: ActionBarProps) {
  const { copied, triggerCopy } = useCopyFeedback(1200);

  const handleCopy = () => {
    onCopy?.();
    triggerCopy();
  };

  const parts: string[] = [];
  if (speedMetrics?.tokensPerSec !== undefined) {
    parts.push(`${speedMetrics.tokensPerSec.toFixed(1)} tok/s`);
  }
  if (speedMetrics?.ttftMs !== undefined) {
    parts.push(`${Math.round(speedMetrics.ttftMs)}ms TTFT`);
  }
  if (speedMetrics?.outputTokens !== undefined) {
    parts.push(`${speedMetrics.outputTokens} tok`);
  }

  const chips: { label: string; spec?: boolean }[] = [];
  if (
    speedMetrics?.speedupMultiplier !== undefined &&
    Number.isFinite(speedMetrics.speedupMultiplier)
  ) {
    chips.push({ label: `${speedMetrics.speedupMultiplier.toFixed(2)}x`, spec: true });
  }
  if (
    speedMetrics?.acceptedTokPerStep !== undefined &&
    Number.isFinite(speedMetrics.acceptedTokPerStep)
  ) {
    chips.push({ label: `${speedMetrics.acceptedTokPerStep.toFixed(1)} tok/step` });
  }
  if (speedMetrics?.vramDeltaLabel) {
    chips.push({ label: speedMetrics.vramDeltaLabel });
  }

  const telemetryNode =
    chips.length > 0 ? (
      <div className="yui-speed-cluster" data-slot="speed-telemetry">
        {parts.length > 0 ? <span className="yui-speed-readout">{parts.join(' · ')}</span> : null}
        {chips.map((chip) => (
          <span key={chip.label} className={chip.spec ? 'yui-telem-chip is-spec' : 'yui-telem-chip'}>
            {chip.label}
          </span>
        ))}
      </div>
    ) : parts.length > 0 ? (
      <span className="yui-speed-readout">{parts.join(' · ')}</span>
    ) : null;

  return (
    <div className="yui-action-row">
      <div className="yui-action-group">
        {onCopy ? (
          <button
            type="button"
            className="yui-icon-btn"
            aria-label={copied ? 'Copied response' : 'Copy response'}
            onClick={handleCopy}
          >
            {copied ? <CheckIcon size={13} /> : <CopyIcon size={13} />}
          </button>
        ) : null}
        {onRegenerate ? (
          <button
            type="button"
            className="yui-icon-btn"
            aria-label="Regenerate response"
            onClick={onRegenerate}
          >
            <RetryIcon size={13} />
          </button>
        ) : null}
        {onThumbUp ? (
          <button
            type="button"
            className="yui-icon-btn"
            aria-label="Thumbs up"
            aria-pressed={feedback === 'up'}
            onClick={onThumbUp}
          >
            <ThumbUpIcon size={13} strokeWidth={feedback === 'up' ? 2.1 : 1.75} />
          </button>
        ) : null}
        {onThumbDown ? (
          <button
            type="button"
            className="yui-icon-btn"
            aria-label="Thumbs down"
            aria-pressed={feedback === 'down'}
            onClick={onThumbDown}
          >
            <ThumbDownIcon size={13} strokeWidth={feedback === 'down' ? 2.1 : 1.75} />
          </button>
        ) : null}
        {onSave ? (
          <button
            type="button"
            className="yui-icon-btn"
            aria-label="Save response"
            onClick={onSave}
          >
            <BookmarkIcon size={13} />
          </button>
        ) : null}
        {onSpeak ? (
          <button
            type="button"
            className="yui-icon-btn"
            aria-label="Read aloud"
            onClick={onSpeak}
          >
            <VolumeIcon size={13} />
          </button>
        ) : null}
      </div>

      {rightSlot ?? telemetryNode}
    </div>
  );
}

export interface BranchPickerProps {
  currentIndex: number;
  total: number;
  onPrevious?: () => void;
  onNext?: () => void;
}

/** Compact version switcher (`2 / 3`) for branched conversation turns. */
export function BranchPicker({
  currentIndex,
  total,
  onPrevious,
  onNext,
}: BranchPickerProps) {
  if (total <= 1) return null;
  return (
    <div className="yui-branch-picker">
      <button
        type="button"
        className="yui-icon-btn"
        aria-label="Previous version"
        disabled={currentIndex <= 1}
        onClick={onPrevious}
      >
        <ChevronLeftIcon size={12} strokeWidth={2} />
      </button>
      <span>
        {currentIndex} / {total}
      </span>
      <button
        type="button"
        className="yui-icon-btn"
        aria-label="Next version"
        disabled={currentIndex >= total}
        onClick={onNext}
      >
        <ChevronRightIcon size={12} strokeWidth={2} />
      </button>
    </div>
  );
}

export interface ReasoningTraceProps {
  status: 'thinking' | 'done';
  durationLabel?: string;
  content?: string;
  defaultExpanded?: boolean;
}

/**
 * Collapsible reasoning trace displaying an active MatrixOrb while thinking
 * and a dotted vertical guide rail when expanded.
 */
export function ReasoningTrace({
  status,
  durationLabel,
  content,
  defaultExpanded = false,
}: ReasoningTraceProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const hasContent = Boolean(content && content.trim().length > 0);
  const isThinking = status === 'thinking';

  if (isThinking && !hasContent) {
    return (
      <div className="yui-reasoning">
        <div className="yui-reasoning-trigger">
          <MatrixOrb state="thinking" size={15} />
          <span>Thinking</span>
          {durationLabel ? <span className="yui-speed-readout">{durationLabel}</span> : null}
        </div>
      </div>
    );
  }

  return (
    <div className="yui-reasoning">
      <button
        type="button"
        className="yui-reasoning-trigger"
        aria-expanded={expanded}
        onClick={() => setExpanded((prev) => !prev)}
      >
        {isThinking ? (
          <>
            <MatrixOrb state="thinking" size={15} />
            <span>Thinking</span>
            {durationLabel ? <span className="yui-speed-readout">{durationLabel}</span> : null}
          </>
        ) : (
          <>
            <CheckIcon size={13} />
            <span>Thought{durationLabel ? ` for ${durationLabel}` : ''}</span>
          </>
        )}
        {expanded ? <ChevronUpIcon size={12} /> : <ChevronDownIcon size={12} />}
      </button>
      {hasContent ? (
        <div
          className={expanded ? 'yui-disclosure is-open' : 'yui-disclosure'}
          aria-hidden={!expanded}
          inert={!expanded ? true : undefined}
        >
          <div className="yui-disclosure-inner">
            <div className="yui-reasoning-body">
              <div className="yui-reasoning-rail" aria-hidden="true" />
              <div className="yui-reasoning-text">{content}</div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
