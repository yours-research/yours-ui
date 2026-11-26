import { useState } from 'react';
import { ComposeIcon, CopyIcon, InsertPageIcon } from '../icons/ApertureIcon.js';

export interface DraftToneOption {
  id: string;
  label: string;
  content: string;
}

export interface DraftCardProps {
  title?: string;
  tones: readonly DraftToneOption[];
  activeToneId?: string;
  onSelectTone?: (id: string) => void;
  onCopy?: (content: string) => void;
  onPrimaryAction?: (content: string) => void;
  primaryActionLabel?: string;
}

/** Inline multi-tone reply draft composer (`GenUI.DraftCard`). */
export function DraftCard({
  title = 'Reply draft',
  tones,
  activeToneId,
  onSelectTone,
  onCopy,
  onPrimaryAction,
  primaryActionLabel = 'Insert into page',
}: DraftCardProps) {
  const [internalToneId, setInternalToneId] = useState(tones[0]?.id ?? '');
  const selectedId = activeToneId ?? internalToneId;
  const activeTone = tones.find((t) => t.id === selectedId) ?? tones[0];

  return (
    <div className="yui-genui-card">
      <div className="yui-genui-head">
        <div className="yui-genui-title-row">
          <ComposeIcon size={13} />
          <span className="yui-genui-title">{title}</span>
        </div>
        <div className="yui-tone-group" role="tablist" aria-label="Draft tone">
          {tones.map((tone) => {
            const active = tone.id === activeTone?.id;
            return (
              <button
                key={tone.id}
                type="button"
                role="tab"
                aria-selected={active}
                className={active ? 'yui-tone-btn is-active' : 'yui-tone-btn'}
                onClick={() => {
                  setInternalToneId(tone.id);
                  onSelectTone?.(tone.id);
                }}
              >
                {tone.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="yui-drawer-body">
        <div className="yui-draft-well">{activeTone?.content ?? ''}</div>
      </div>

      <div className="yui-genui-foot">
        {onCopy ? (
          <button
            type="button"
            className="yui-micro-pill"
            onClick={() => activeTone && onCopy(activeTone.content)}
          >
            <CopyIcon size={11} />
            <span>Copy</span>
          </button>
        ) : (
          <span />
        )}
        {onPrimaryAction ? (
          <button
            type="button"
            className="yui-pill-btn yui-pill-btn--primary"
            onClick={() => activeTone && onPrimaryAction(activeTone.content)}
          >
            <InsertPageIcon size={12} />
            <span>{primaryActionLabel}</span>
          </button>
        ) : null}
      </div>
    </div>
  );
}
