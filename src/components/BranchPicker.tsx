import { ChevronLeftIcon, ChevronRightIcon } from '../icons/ApertureIcon.js';

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
