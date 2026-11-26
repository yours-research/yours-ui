import { SearchIcon } from '../icons/ApertureIcon.js';

export interface NotchDrawerSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  count?: number;
}

/**
 * Compact headerless filter input with hairline count badge designed to sit
 * directly inside the expanded TopNotch drawer.
 */
export function NotchDrawerSearch({
  value,
  onChange,
  placeholder = 'Search...',
  count,
}: NotchDrawerSearchProps) {
  return (
    <div className="yui-drawer-search-row">
      <div className="yui-drawer-search-left">
        <SearchIcon size={12} />
        <input
          type="text"
          className="yui-drawer-search-input"
          placeholder={placeholder}
          value={value}
          aria-label={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
      {count !== undefined ? <span className="yui-drawer-count">{count}</span> : null}
    </div>
  );
}
