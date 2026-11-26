import { useState, type ReactNode } from 'react';
import { CopyIcon, PageIcon, RetryIcon } from '../icons/ApertureIcon.js';

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

  if (isEditing) {
    return (
      <div className="yui-edit-card">
        <textarea
          className="yui-edit-textarea"
          value={draft}
          aria-label="Edit message"
          onChange={(e) => setDraft(e.target.value)}
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
          <div className="yui-user-context">
            <PageIcon size={11} />
            <span>{contextLabel}</span>
          </div>
        ) : null}
        <div className="yui-user-text">{content}</div>
      </div>
      {onStartEdit || onCopy ? (
        <div className="yui-action-group">
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
      <div>{children}</div>
      {footer}
    </div>
  );
}
