import { useId, useState } from 'react';
import { RetryIcon, SlidersIcon } from '../icons/ApertureIcon.js';
import { CardHeaderChrome } from './CardChrome.js';
import { SegmentedControl, type SegmentedOption } from './SegmentedControl.js';

export type ThinkingMode = 'auto' | 'fast' | 'deep';
export type GpuPacingMode = 'balanced' | 'smooth';

export interface ModelParametersValue {
  thinkingMode: ThinkingMode;
  gpuPacing: GpuPacingMode;
  temperature: number;
  topP: number;
  maxTokens: number;
}

export interface ModelParametersCardProps {
  title?: string;
  subtitle?: string;
  modelLabel?: string;
  thinkingMode?: ThinkingMode;
  onThinkingModeChange?: (mode: ThinkingMode) => void;
  gpuPacing?: GpuPacingMode;
  onGpuPacingChange?: (mode: GpuPacingMode) => void;
  temperature?: number;
  onTemperatureChange?: (value: number) => void;
  topP?: number;
  onTopPChange?: (value: number) => void;
  maxTokens?: number;
  maxTokensLimit?: number;
  onMaxTokensChange?: (value: number) => void;
  onReset?: (defaults: ModelParametersValue) => void;
  resetLabel?: string;
  className?: string;
}

const DEFAULTS: ModelParametersValue = {
  thinkingMode: 'auto',
  gpuPacing: 'balanced',
  temperature: 0.7,
  topP: 0.9,
  maxTokens: 2048,
};

const THINKING_OPTIONS: readonly SegmentedOption<ThinkingMode>[] = [
  { value: 'auto', label: 'Auto' },
  { value: 'fast', label: 'Fast' },
  { value: 'deep', label: 'Deep' },
];

const PACING_OPTIONS: readonly SegmentedOption<GpuPacingMode>[] = [
  { value: 'balanced', label: 'Balanced' },
  { value: 'smooth', label: 'Smooth UI' },
];

function useCtrl<T>(controlled: T | undefined, fallback: T, onChange?: (v: T) => void) {
  const [state, setState] = useState(fallback);
  const val = controlled ?? state;
  const set = (next: T) => {
    if (controlled === undefined) setState(next);
    onChange?.(next);
  };
  return [val, set] as const;
}

/**
 * Tactile local inference parameters card with Thinking mode & GPU pacing
 * `SegmentedControl` selectors, native `<input type="range">` sliders with
 * `tabular-nums` readouts, zero inline styles, and `Reset defaults`.
 */
export function ModelParametersCard({
  title = 'Inference parameters',
  subtitle = 'Local WebGPU sampling & pacing',
  modelLabel,
  thinkingMode: cThinking,
  onThinkingModeChange,
  gpuPacing: cPacing,
  onGpuPacingChange,
  temperature: cTemp,
  onTemperatureChange,
  topP: cTopP,
  onTopPChange,
  maxTokens: cMaxTokens,
  maxTokensLimit = 8192,
  onMaxTokensChange,
  onReset,
  resetLabel = 'Reset defaults',
  className,
}: ModelParametersCardProps) {
  const baseId = useId();
  const [thinkingMode, setThinking] = useCtrl(cThinking, DEFAULTS.thinkingMode, onThinkingModeChange);
  const [gpuPacing, setPacing] = useCtrl(cPacing, DEFAULTS.gpuPacing, onGpuPacingChange);
  const [temperature, setTemp] = useCtrl(cTemp, DEFAULTS.temperature, onTemperatureChange);
  const [topP, setTop] = useCtrl(cTopP, DEFAULTS.topP, onTopPChange);
  const [maxTokens, setTokens] = useCtrl(cMaxTokens, DEFAULTS.maxTokens, onMaxTokensChange);

  const handleReset = () => {
    setThinking(DEFAULTS.thinkingMode);
    setPacing(DEFAULTS.gpuPacing);
    setTemp(DEFAULTS.temperature);
    setTop(DEFAULTS.topP);
    setTokens(DEFAULTS.maxTokens);
    onReset?.(DEFAULTS);
  };

  const sliders = [
    ['temp', 'Temperature', 0, 2, 0.05, temperature, (n: number) => setTemp(n), temperature.toFixed(2)],
    ['topp', 'Top-P', 0.1, 1, 0.05, topP, (n: number) => setTop(n), topP.toFixed(2)],
    ['tok', 'Max tokens', 256, maxTokensLimit, 256, maxTokens, (n: number) => setTokens(Math.round(n)), maxTokens.toLocaleString()],
  ] as const;

  return (
    <section
      data-slot="model-parameters-card"
      className={['yui-card-shell', 'yui-params-card', className].filter(Boolean).join(' ')}
      aria-label={title}
    >
      <CardHeaderChrome
        icon={<SlidersIcon size={13} className="yui-privacy-icon" />}
        title={title}
        subtitle={subtitle}
        right={modelLabel ? <span className="yui-badge">{modelLabel}</span> : null}
      />

      <div className="yui-params-groups">
        <div className="yui-params-field">
          <span className="yui-params-label">Thinking mode</span>
          <SegmentedControl
            size="sm"
            fullWidth
            ariaLabel="Thinking mode"
            options={THINKING_OPTIONS}
            value={thinkingMode}
            onChange={setThinking}
          />
        </div>
        <div className="yui-params-field">
          <span className="yui-params-label">GPU pacing</span>
          <SegmentedControl
            size="sm"
            fullWidth
            ariaLabel="GPU pacing"
            options={PACING_OPTIONS}
            value={gpuPacing}
            onChange={setPacing}
          />
        </div>
      </div>

      <div className="yui-params-sliders">
        {sliders.map(([key, label, min, max, step, val, setter, readout]) => (
          <div key={key} className="yui-slider-row">
            <div className="yui-slider-head">
              <label htmlFor={`${baseId}-${key}`} className="yui-params-label">
                {label}
              </label>
              <span className="yui-slider-val">{readout}</span>
            </div>
            <input
              id={`${baseId}-${key}`}
              type="range"
              className="yui-range-input"
              min={min}
              max={max}
              step={step}
              value={val}
              onChange={(e) => setter(parseFloat(e.target.value))}
            />
          </div>
        ))}
      </div>

      <footer className="yui-params-foot">
        <span className="yui-storage-privacy">
          {thinkingMode.toUpperCase()} · {gpuPacing === 'smooth' ? 'Smooth UI' : 'Balanced'}
        </span>
        <button type="button" className="yui-micro-pill yui-params-reset-btn" onClick={handleReset}>
          <RetryIcon size={10.5} />
          <span>{resetLabel}</span>
        </button>
      </footer>
    </section>
  );
}
