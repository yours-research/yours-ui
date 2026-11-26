import { useRef, useState, type KeyboardEvent } from 'react';
import { ArrowDownIcon, LocalDeviceIcon } from '../icons/ApertureIcon.js';

export type ModelCheckpointState = 'active' | 'cached' | 'download';

export interface ModelRosterItem {
  id: string;
  name: string;
  quantLabel?: string;
  sizeLabel: string;
  vramLabel?: string;
  speedLabel?: string;
  state: ModelCheckpointState;
  disabled?: boolean;
}

export interface ModelRosterListProps {
  models: readonly ModelRosterItem[];
  selectedId?: string;
  label?: string;
  onSelectModel: (id: string) => void;
  onDownloadModel?: (id: string) => void;
  className?: string;
}

function findNextFocusableIndex(
  items: readonly ModelRosterItem[],
  startIndex: number,
  step: 1 | -1,
): number {
  if (items.length === 0) return -1;
  for (let offset = 1; offset <= items.length; offset++) {
    const idx = (startIndex + step * offset + items.length) % items.length;
    if (!items[idx]?.disabled) return idx;
  }
  return -1;
}

/**
 * Accessible Paper Page 9 radiogroup for switching local WebGPU/OPFS checkpoints
 * inside the Models notch drawer, displaying state pills (`Active`, `Cached`, `Download`),
 * `tabular-nums` size/VRAM/tok/s specs, and keyboard Arrow/Enter navigation.
 */
export function ModelRosterList({
  models,
  selectedId,
  label = 'Local model checkpoints',
  onSelectModel,
  onDownloadModel,
  className,
}: ModelRosterListProps) {
  const radioRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const initialFocus = Math.max(
    0,
    models.findIndex((m) => (selectedId ? m.id === selectedId : !m.disabled)),
  );
  const [focusedIndex, setFocusedIndex] = useState(initialFocus);

  const resolvedFocusIndex =
    focusedIndex >= 0 && focusedIndex < models.length && !models[focusedIndex]?.disabled
      ? focusedIndex
      : Math.max(
          0,
          models.findIndex((m) => !m.disabled),
        );

  const rootClass = ['yui-model-roster', className].filter(Boolean).join(' ');

  const handleRadioKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const item = models[index];
    if (!item || item.disabled) return;

    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      event.preventDefault();
      const next = findNextFocusableIndex(models, index, 1);
      if (next !== -1) {
        setFocusedIndex(next);
        radioRefs.current[next]?.focus();
        const nextItem = models[next];
        if (nextItem && nextItem.state !== 'download') {
          onSelectModel(nextItem.id);
        }
      }
      return;
    }

    if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      event.preventDefault();
      const prev = findNextFocusableIndex(models, index, -1);
      if (prev !== -1) {
        setFocusedIndex(prev);
        radioRefs.current[prev]?.focus();
        const prevItem = models[prev];
        if (prevItem && prevItem.state !== 'download') {
          onSelectModel(prevItem.id);
        }
      }
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (item.state === 'download' && onDownloadModel) {
        onDownloadModel(item.id);
      } else {
        onSelectModel(item.id);
      }
    }
  };

  return (
    <div
      data-slot="model-roster-list"
      role="radiogroup"
      aria-label={label}
      className={rootClass}
    >
      {models.map((item, idx) => {
        const isSelected = selectedId ? item.id === selectedId : item.state === 'active';
        const isTabTarget = idx === resolvedFocusIndex;
        const specs = [item.sizeLabel, item.vramLabel, item.speedLabel].filter(Boolean);
        const rowClass = ['yui-model-row', isSelected ? 'is-selected' : '', item.disabled ? 'is-disabled' : '']
          .filter(Boolean)
          .join(' ');

        return (
          <div key={item.id} className={rowClass} data-model-id={item.id} data-state={item.state}>
            <button
              ref={(el) => {
                radioRefs.current[idx] = el;
              }}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-disabled={item.disabled || undefined}
              disabled={item.disabled}
              tabIndex={isTabTarget ? 0 : -1}
              className="yui-model-radio-btn"
              onFocus={() => setFocusedIndex(idx)}
              onKeyDown={(e) => handleRadioKeyDown(e, idx)}
              onClick={() => {
                setFocusedIndex(idx);
                if (item.state === 'download' && onDownloadModel) {
                  onDownloadModel(item.id);
                } else {
                  onSelectModel(item.id);
                }
              }}
            >
              <span className="yui-model-left">
                <span className={isSelected ? 'yui-model-dot is-checked' : 'yui-model-dot'} aria-hidden="true" />
                <LocalDeviceIcon size={13.5} className="yui-model-icon" />
                <span className="yui-col-min">
                  <span className="yui-model-name-row">
                    <span className="yui-model-name">{item.name}</span>
                    {item.quantLabel ? <span className="yui-model-quant">{item.quantLabel}</span> : null}
                  </span>
                  <span className="yui-model-specs">{specs.join(' · ')}</span>
                </span>
              </span>
            </button>

            <span className="yui-model-right">
              {item.state === 'active' ? (
                <span className="yui-model-pill is-active">Active</span>
              ) : item.state === 'cached' ? (
                <span className="yui-model-pill is-cached">Cached</span>
              ) : (
                <button
                  type="button"
                  className="yui-model-dl-btn"
                  disabled={item.disabled}
                  aria-label={`Download ${item.name}`}
                  onClick={() => {
                    if (onDownloadModel) {
                      onDownloadModel(item.id);
                    } else {
                      onSelectModel(item.id);
                    }
                  }}
                >
                  <ArrowDownIcon size={11} />
                  <span>Download</span>
                </button>
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
}
