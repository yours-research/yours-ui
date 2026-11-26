import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import {
  APERTURE_ICON_NAMES,
  ApertureIcon,
  ComposeIcon,
  HistoryIcon,
  LocalDeviceIcon,
  MatrixOrb,
  NotchEar,
  SendIcon,
  ShieldIcon,
  TabStackIcon,
  ToolStatusIcon,
  type ToolStatusKind,
  YoursMark,
} from '../src/icons/index.js';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let mounted: { container: HTMLElement; root: Root } | null = null;

function renderNode(node: React.ReactNode) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => {
    root.render(node);
  });
  mounted = { container, root };
  return container;
}

afterEach(() => {
  if (mounted) {
    const { container, root } = mounted;
    act(() => {
      root.unmount();
    });
    container.remove();
    mounted = null;
  }
});

describe('@yours/ui Aperture icons & brand SVGs', () => {
  it('exports and renders all 48 Aperture icons cleanly without errors', () => {
    expect(APERTURE_ICON_NAMES).toHaveLength(48);
    const el = renderNode(
      <div>
        {APERTURE_ICON_NAMES.map((name) => (
          <ApertureIcon key={name} name={name} size={16} data-icon={name} />
        ))}
      </div>,
    );
    const svgs = el.querySelectorAll('svg');
    expect(svgs.length).toBe(48);
    for (const svg of svgs) {
      expect(svg.children.length).toBeGreaterThan(0);
    }
  });

  it('renders named icon exports, MatrixOrb states, NotchEar curves, and YoursMark', () => {
    const el = renderNode(
      <div>
        <ComposeIcon size={14} />
        <HistoryIcon size={14} />
        <TabStackIcon size={14} />
        <LocalDeviceIcon size={14} />
        <ShieldIcon size={14} />
        <SendIcon size={14} />
        <MatrixOrb state="idle" size={28} />
        <MatrixOrb state="thinking" size={16} />
        <MatrixOrb state="streaming" size={16} />
        <NotchEar side="left" />
        <NotchEar side="right" />
        <YoursMark size={24} />
      </div>,
    );

    expect(el.querySelectorAll('.yui-icon').length).toBe(6);
    expect(el.querySelectorAll('.yui-matrix-orb').length).toBe(3);
    expect(el.querySelectorAll('.yui-matrix-orb--idle circle').length).toBe(21);
    expect(el.querySelectorAll('.yui-notch-ear').length).toBe(2);
    expect(el.querySelectorAll('.yui-brand-mark path').length).toBe(2);
  });

  it('renders all 12 ToolStatusIcon states cleanly in active and static modes with zero inline styles', () => {
    const kinds: ToolStatusKind[] = [
      'thinking',
      'reading',
      'searching',
      'researching',
      'tabs',
      'analyzing',
      'calculating',
      'writing',
      'memory',
      'done',
      'blocked',
      'error',
    ];
    const el = renderNode(
      <div>
        <div data-batch="active">
          {kinds.map((k) => (
            <ToolStatusIcon key={k} kind={k} active data-kind={k} />
          ))}
        </div>
        <div data-batch="static">
          {kinds.map((k) => (
            <ToolStatusIcon key={k} kind={k} active={false} data-kind={k} />
          ))}
        </div>
      </div>,
    );

    const activeSvgs = el.querySelectorAll('[data-batch="active"] svg.yui-tsi');
    const staticSvgs = el.querySelectorAll('[data-batch="static"] svg.yui-tsi');
    expect(activeSvgs.length).toBe(12);
    expect(staticSvgs.length).toBe(12);
    expect(el.querySelectorAll('[data-batch="active"] .yui-tsi.is-active').length).toBe(12);
    expect(el.querySelectorAll('[data-batch="static"] .yui-tsi.is-active').length).toBe(0);
    expect(el.querySelectorAll('.yui-tsi--done').length).toBe(2);
    expect(el.querySelectorAll('.yui-tsi--blocked').length).toBe(2);
    expect(el.querySelectorAll('.yui-tsi--error').length).toBe(2);
    expect(el.querySelectorAll('[style]').length).toBe(0);
  });
});
