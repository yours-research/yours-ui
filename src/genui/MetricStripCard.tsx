import { SparkTrendIcon } from '../icons/ApertureIcon.js';

export interface MetricStripCardProps {
  label: string;
  averageLabel?: string;
  primaryValue: string;
  unitLabel?: string;
  deltaLabel?: string;
  values: readonly number[];
  lowLabel?: string;
  highLabel?: string;
  footnote?: string;
}

function buildSparklineGeometry(values: readonly number[], width = 318, height = 56) {
  if (values.length === 0) {
    return {
      pathD: 'M 4 28 L 314 28',
      areaD: '',
      avgY: 28,
      lastX: 314,
      lastY: 28,
    };
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const padX = 4;
  const padY = 8;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;

  const points = values.map((val, idx) => {
    const x =
      values.length === 1
        ? width / 2
        : padX + (idx / (values.length - 1)) * innerW;
    const norm = (val - min) / span;
    const y = padY + (1 - norm) * innerH;
    return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
  });

  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const avgY = Math.round((padY + (1 - (avg - min) / span) * innerH) * 10) / 10;

  const pathD = points
    .map((pt, idx) => `${idx === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`)
    .join(' ');
  const first = points[0] ?? { x: width / 2, y: height / 2 };
  const last = points[points.length - 1] ?? { x: width / 2, y: height / 2 };
  const areaD =
    points.length >= 2
      ? `${pathD} L ${last.x} ${height - 4} L ${first.x} ${height - 4} Z`
      : '';

  return { pathD, areaD, avgY, lastX: last.x, lastY: last.y };
}

/**
 * Sparkline and metric strip (`GenUI.MetricStrip`) for tracking throughput,
 * latency, pricing history, or token budgets inline in the side panel.
 */
export function MetricStripCard({
  label,
  averageLabel,
  primaryValue,
  unitLabel,
  deltaLabel,
  values,
  lowLabel,
  highLabel,
  footnote,
}: MetricStripCardProps) {
  const { pathD, areaD, avgY, lastX, lastY } = buildSparklineGeometry(values);
  const rangeText = [lowLabel ? `Low ${lowLabel}` : '', highLabel ? `High ${highLabel}` : '']
    .filter(Boolean)
    .join(' · ');

  return (
    <div className="yui-genui-card">
      <div className="yui-genui-head">
        <div className="yui-genui-title-row">
          <SparkTrendIcon size={14} />
          <span className="yui-genui-title">{label}</span>
        </div>
        {averageLabel ? <span className="yui-speed-readout">{averageLabel}</span> : null}
      </div>

      <div className="yui-genui-body">
        <div className="yui-action-row">
          <div className="yui-action-group">
            <strong className="yui-metric-primary">{primaryValue}</strong>
            {unitLabel ? <span className="yui-genui-muted">{unitLabel}</span> : null}
          </div>
          {deltaLabel ? <span className="yui-delta-pill">{deltaLabel}</span> : null}
        </div>

        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height={56}
          viewBox="0 0 318 56"
          fill="none"
          aria-hidden="true"
        >
          {areaD ? <path d={areaD} className="yui-spark-area" /> : null}
          <line
            x1="4"
            y1={avgY}
            x2="314"
            y2={avgY}
            className="yui-spark-ref-line"
            strokeWidth="1"
            strokeDasharray="3 3"
          />
          <path
            d={pathD}
            className="yui-spark-path"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx={lastX} cy={lastY} r="3.5" className="yui-spark-marker" strokeWidth="1.75" />
        </svg>
      </div>

      {rangeText || footnote ? (
        <div className="yui-genui-foot">
          <span className="yui-speed-readout">{rangeText}</span>
          {footnote ? <span className="yui-genui-muted">{footnote}</span> : null}
        </div>
      ) : null}
    </div>
  );
}
