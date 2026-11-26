import { ArrowRightIcon } from '../icons/ApertureIcon.js';

export interface FollowUpSuggestionsProps {
  suggestions: readonly string[];
  onSelect: (suggestion: string) => void;
}

/** Follow-up prompt list anchored cleanly after an assistant turn. */
export function FollowUpSuggestions({ suggestions, onSelect }: FollowUpSuggestionsProps) {
  if (suggestions.length === 0) return null;
  return (
    <div className="yui-starter-stack">
      {suggestions.map((suggestion) => (
        <button
          key={suggestion}
          type="button"
          className="yui-prompt-capsule"
          onClick={() => onSelect(suggestion)}
        >
          <span className="yui-prompt-capsule-left">
            <span className="yui-prompt-capsule-title">{suggestion}</span>
          </span>
          <ArrowRightIcon size={12} />
        </button>
      ))}
    </div>
  );
}
