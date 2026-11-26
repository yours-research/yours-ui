import { ApertureIcon, ArrowDownIcon, ArrowRightIcon } from '../icons/ApertureIcon.js';
import type { ApertureIconName } from '../icons/iconData.js';

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

/**
 * Stacked Page 9 starter prompt capsules anchored beneath the 21-dot MatrixOrb.
 */
export function PromptCapsuleStack({ items, onSelect }: PromptCapsuleStackProps) {
  return (
    <div className="yui-starter-stack">
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
              {item.subtitle ? (
                <div className="yui-prompt-capsule-sub">{item.subtitle}</div>
              ) : null}
            </span>
          </span>
          <ArrowRightIcon size={12} />
        </button>
      ))}
    </div>
  );
}

export interface SuggestionChipRowProps {
  items: readonly PromptStarterItem[];
  onSelect: (item: PromptStarterItem) => void;
}

/** Horizontal wrapping row of compact rounded suggestion pills. */
export function SuggestionChipRow({ items, onSelect }: SuggestionChipRowProps) {
  return (
    <div className="yui-suggestion-row">
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
