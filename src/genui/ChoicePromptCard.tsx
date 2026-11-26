export interface ChoiceOption {
  id: string;
  title: string;
  description?: string;
}

export interface ChoicePromptCardProps {
  question: string;
  hint?: string;
  options: readonly ChoiceOption[];
  selectedId?: string;
  onSelect: (id: string) => void;
}

/** Inline multiple-choice disambiguation card (`GenUI.ChoicePrompt`). */
export function ChoicePromptCard({
  question,
  hint = 'Choose one option to continue',
  options,
  selectedId,
  onSelect,
}: ChoicePromptCardProps) {
  return (
    <div className="yui-genui-card">
      <div className="yui-drawer-body">
        <div>
          <div className="yui-genui-title">{question}</div>
          {hint ? <div className="yui-genui-muted">{hint}</div> : null}
        </div>
        <div className="yui-starter-stack" role="radiogroup" aria-label={question}>
          {options.map((opt) => {
            const selected = opt.id === selectedId;
            return (
              <button
                key={opt.id}
                type="button"
                role="radio"
                aria-checked={selected}
                className={selected ? 'yui-choice-row is-selected' : 'yui-choice-row'}
                onClick={() => onSelect(opt.id)}
              >
                <div>
                  <div className="yui-prompt-capsule-title">{opt.title}</div>
                  {opt.description ? (
                    <div className="yui-genui-muted">{opt.description}</div>
                  ) : null}
                </div>
                <span className={selected ? 'yui-radio-ring is-checked' : 'yui-radio-ring'} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
