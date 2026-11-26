import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  HookSidebarList,
  NotchDrawerSearch,
  NotchOptionRow,
  NotchStatusPill,
  SidePanelShell,
  TopNotch,
} from '../src/layout/index.js';

interface FsModule {
  readFileSync(path: URL, encoding: 'utf8'): string;
}

async function readStyleFile(relativePath: string): Promise<string> {
  const fsId = 'node:fs';
  const fs = (await import(/* @vite-ignore */ fsId)) as FsModule;
  return fs.readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let mounted: { container: HTMLElement; root: Root } | null = null;
const origElementAnimate = Element.prototype.animate;
const origMatchMedia = window.matchMedia;
const origResizeObserver = globalThis.ResizeObserver;

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

function rerenderNode(node: React.ReactNode) {
  if (!mounted) {
    return renderNode(node);
  }
  act(() => {
    mounted!.root.render(node);
  });
  return mounted.container;
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
  Object.defineProperty(Element.prototype, 'animate', {
    configurable: true,
    writable: true,
    value: origElementAnimate,
  });
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: origMatchMedia,
  });
  globalThis.ResizeObserver = origResizeObserver;
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('@yours/ui layout & TopNotch primitives', () => {
  it('renders SidePanelShell with theme override and veil interaction', () => {
    const onVeilClick = vi.fn();
    const el = renderNode(
      <SidePanelShell
        theme="dark"
        veilOpen
        onVeilClick={onVeilClick}
        sheet={<div>Context Sheet Tray</div>}
        footer={<div>Composer</div>}
      >
        <div>Stage Content</div>
      </SidePanelShell>,
    );

    const shell = el.querySelector('.yui-shell');
    expect(shell?.getAttribute('data-theme')).toBe('dark');
    expect(el.querySelector('.yui-sheet-region')?.textContent).toBe('Context Sheet Tray');
    const veil = el.querySelector('.yui-veil.is-open') as HTMLElement;
    expect(veil).toBeTruthy();
    act(() => {
      veil.click();
    });
    expect(onVeilClick).toHaveBeenCalledTimes(1);
  });

  it('expands TopNotch drawer on click and closes on Escape key', () => {
    const onClose = vi.fn();
    const onSelect = vi.fn();
    const el = renderNode(
      <TopNotch
        expandedId="threads"
        onSelectItem={onSelect}
        onClose={onClose}
        items={[
          { id: 'new', icon: 'compose', label: 'New' },
          { id: 'threads', icon: 'history', label: 'Threads' },
          { id: 'tabs', icon: 'tab-stack', label: '1 tab', badgeDot: 'green' },
          { id: 'saved', icon: 'bookmark', label: 'Saved' },
        ]}
        drawerContent={<div>Unified Drawer Content</div>}
      />,
    );

    expect(el.querySelector('.yui-notch-housing.is-expanded')).toBeTruthy();
    expect(el.textContent).toContain('Unified Drawer Content');
    expect(el.querySelector('.yui-notch-btn.is-active')?.getAttribute('aria-label')).toBe('Threads');

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders HookSidebarList dashed active & hover guide rails and NotchDrawerSearch', () => {
    const onSelect = vi.fn();
    const onSearch = vi.fn();
    const el = renderNode(
      <div>
        <NotchDrawerSearch value="pro" onChange={onSearch} placeholder="Search..." count={2} />
        <HookSidebarList
          activeId="a"
          onSelect={onSelect}
          items={[
            { id: 'a', title: 'Pro vs. Team pricing', meta: 'Now', hasLiveDot: true },
            { id: 'b', title: 'Landlord renewal', meta: '2h' },
          ]}
        />
      </div>,
    );

    expect(el.querySelector('.yui-drawer-count')?.textContent).toBe('2');

    const nav = el.querySelector('[data-slot="hook-sidebar"]');
    expect(nav?.tagName).toBe('NAV');
    expect(nav?.getAttribute('aria-label')).toBe('Threads');

    const hoverRail = el.querySelector('.yui-hook-rail-layer--hover');
    const activeRail = el.querySelector('.yui-hook-rail-layer--active');
    expect(hoverRail).toBeTruthy();
    expect(activeRail).toBeTruthy();
    expect(hoverRail?.getAttribute('aria-hidden')).toBe('true');
    expect(activeRail?.getAttribute('aria-hidden')).toBe('true');
    expect(hoverRail?.getAttribute('data-visible')).toBe('false');
    expect(activeRail?.getAttribute('data-visible')).toBe('true');

    const paths = el.querySelectorAll('.yui-hook-corner path');
    expect(paths.length).toBe(2);
    expect(paths[0].getAttribute('d')).toBe('M0.5 0a6 6 0 0 0 6 6H12');
    expect(paths[1].getAttribute('d')).toBe('M0.5 0a6 6 0 0 0 6 6H12');
    expect(paths[1].getAttribute('stroke-dasharray')).toBe('2 2');
    expect(el.querySelectorAll('.yui-hook-stem--dashed').length).toBe(2);

    const rows = el.querySelectorAll('[data-slot="hook-sidebar-item"]');
    expect(rows.length).toBe(2);
    expect(rows[0].getAttribute('data-active')).toBe('true');
    expect(rows[0].getAttribute('aria-current')).toBe('true');
    expect(rows[1].getAttribute('data-active')).toBe('false');
    expect(rows[1].getAttribute('aria-current')).toBeNull();
    expect(rows[0].querySelector('.yui-status-dot--sm')).toBeTruthy();
    expect(rows[0].querySelector('.yui-hook-row-title')?.textContent).toBe('Pro vs. Team pricing');
    expect(rows[0].querySelector('.yui-hook-row-meta')?.textContent).toBe('Now');

    const secondRow = rows[1] as HTMLButtonElement;
    act(() => {
      secondRow.click();
    });
    expect(onSelect).toHaveBeenCalledWith('b');
  });

  it('renders all NotchStatusPill modes cleanly', () => {
    const el = renderNode(
      <div>
        <NotchStatusPill mode="idle" onPrimaryAction={() => {}} onSecondaryAction={() => {}} />
        <NotchStatusPill mode="thinking" metric="2s" />
        <NotchStatusPill mode="streaming" metric="84 tok/s" />
        <NotchStatusPill mode="voice" onSecondaryAction={() => {}} />
        <NotchStatusPill mode="drawer" onSecondaryAction={() => {}} />
      </div>,
    );
    expect(el.querySelectorAll('.yui-status-notch-pill').length).toBe(5);
    expect(el.textContent).toContain('84 tok/s');
  });

  it('supports light theme override and bleed mode on SidePanelShell', () => {
    const el = renderNode(
      <div>
        <SidePanelShell theme="light" bleed className="custom-shell">
          <div>Bleed Light</div>
        </SidePanelShell>
        <SidePanelShell>
          <div>Default Shell</div>
        </SidePanelShell>
      </div>,
    );

    const shells = el.querySelectorAll('.yui-shell');
    expect(shells.length).toBe(2);
    expect(shells[0].getAttribute('data-theme')).toBe('light');
    expect(shells[0].classList.contains('yui-shell--bleed')).toBe(true);
    expect(shells[0].classList.contains('custom-shell')).toBe(true);
    expect(shells[1].getAttribute('data-theme')).toBeNull();
    expect(shells[1].classList.contains('yui-shell--bleed')).toBe(false);
  });

  it('adds yui-notch-housing--wide when TopNotch has 5 or more items', () => {
    const el = renderNode(
      <div>
        <div data-case="four">
          <TopNotch
            expandedId={null}
            items={[
              { id: 'new', icon: 'compose', label: 'New' },
              { id: 'threads', icon: 'history', label: 'Threads' },
              { id: 'tabs', icon: 'tab-stack', label: 'Tabs' },
              { id: 'saved', icon: 'bookmark', label: 'Saved' },
            ]}
          />
        </div>
        <div data-case="five">
          <TopNotch
            expandedId={null}
            items={[
              { id: 'new', icon: 'compose', label: 'New' },
              { id: 'threads', icon: 'history', label: 'Threads' },
              { id: 'tabs', icon: 'tab-stack', label: 'Tabs' },
              { id: 'saved', icon: 'bookmark', label: 'Saved' },
              { id: 'settings', icon: 'sliders', label: 'Settings' },
            ]}
          />
        </div>
      </div>,
    );

    const fourHousing = el.querySelector('[data-case="four"] .yui-notch-housing');
    const fiveHousing = el.querySelector('[data-case="five"] .yui-notch-housing');
    expect(fourHousing?.classList.contains('yui-notch-housing--wide')).toBe(false);
    expect(fiveHousing?.classList.contains('yui-notch-housing--wide')).toBe(true);
  });

  it('orders explicit theme blocks after prefers-color-scheme: dark in tokens.css and defines shell/notch/chip modifiers', async () => {
    const tokensCss = await readStyleFile('../src/styles/tokens.css');
    const componentsCss = await readStyleFile('../src/styles/components.css');

    const mediaIdx = tokensCss.indexOf('@media (prefers-color-scheme: dark)');
    const lightIdx = tokensCss.indexOf('[data-theme="light"] {');
    const darkIdx = tokensCss.indexOf('[data-theme="dark"] {');

    expect(mediaIdx).toBeGreaterThan(-1);
    expect(lightIdx).toBeGreaterThan(mediaIdx);
    expect(darkIdx).toBeGreaterThan(lightIdx);

    const lightBlock = tokensCss.slice(lightIdx, darkIdx);
    expect(lightBlock).toContain('color-scheme: light;');
    expect(lightBlock).toContain('--bg-canvas: #FAF8F5;');
    expect(lightBlock).toContain('--shadow-sheet:');
    expect(lightBlock).toContain('--yui-outer-bg: #FFFFFF;');
    expect(lightBlock).toContain('--yui-notch-shadow:');

    expect(componentsCss).toContain('.yui-shell--bleed');
    expect(componentsCss).toContain('.yui-notch-housing--wide');
    expect(componentsCss).toContain('.yui-chip-btn.is-active');
    expect(componentsCss).toContain('.yui-chip-btn.is-recording');
  });

  it('tracks pointer hover, smart hoverFrom above/below active row, keyboard focus, and mouseleave', () => {
    const items = [
      { id: 'a', title: 'Alpha' },
      { id: 'b', title: 'Beta' },
      { id: 'c', title: 'Gamma' },
    ];
    const el = renderNode(<HookSidebarList items={items} activeId="b" />);

    const wrap = el.querySelector('.yui-hook-wrap') as HTMLDivElement;
    const rows = Array.from(el.querySelectorAll('[data-slot="hook-sidebar-item"]')) as HTMLButtonElement[];
    const hoverRail = el.querySelector('.yui-hook-rail-layer--hover') as HTMLElement;
    const hoverStem = hoverRail.querySelector('.yui-hook-stem') as HTMLElement;
    const hoverCorner = hoverRail.querySelector('.yui-hook-corner') as SVGElement;
    const activeRail = el.querySelector('.yui-hook-rail-layer--active') as HTMLElement;

    // Default active row is index 1 (center = 1 * 32 + 15 = 47)
    expect(activeRail.getAttribute('data-visible')).toBe('true');
    expect(activeRail.getAttribute('data-y')).toBe('47');
    expect(activeRail.querySelector('.yui-hook-stem')?.getAttribute('data-top')).toBe('0');
    expect(activeRail.querySelector('.yui-hook-stem')?.getAttribute('data-height')).toBe('41');
    expect(activeRail.querySelector('.yui-hook-corner')?.getAttribute('data-top')).toBe('41');

    // Hover below active row (idx 2, center = 79): stem runs from activeY (47) down to 73
    act(() => {
      rows[2].dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
    });
    expect(hoverRail.getAttribute('data-visible')).toBe('true');
    expect(hoverRail.getAttribute('data-from')).toBe('47');
    expect(hoverStem.getAttribute('data-top')).toBe('47');
    expect(hoverStem.getAttribute('data-height')).toBe('26');
    expect(hoverCorner.getAttribute('data-top')).toBe('73');

    // Hover above active row (idx 0, center = 15): hoverFrom = max(0, 15 - 6) = 9 -> corner-only (height = 0)
    act(() => {
      rows[0].dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
    });
    expect(hoverRail.getAttribute('data-visible')).toBe('true');
    expect(hoverRail.getAttribute('data-from')).toBe('9');
    expect(hoverStem.getAttribute('data-top')).toBe('9');
    expect(hoverStem.getAttribute('data-height')).toBe('0');
    expect(hoverCorner.getAttribute('data-top')).toBe('9');

    // Hovering active row hides hover rail
    act(() => {
      rows[1].dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
    });
    expect(hoverRail.getAttribute('data-visible')).toBe('false');

    // Re-hover row 2, then leave wrapper -> hides hover rail
    act(() => {
      rows[2].dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
    });
    expect(hoverRail.getAttribute('data-visible')).toBe('true');
    act(() => {
      wrap.dispatchEvent(new MouseEvent('mouseout', { bubbles: true, relatedTarget: document.body }));
    });
    expect(hoverRail.getAttribute('data-visible')).toBe('false');

    // Keyboard focus on non-active row reveals hover rail, blur hides it
    act(() => {
      rows[0].focus();
    });
    expect(hoverRail.getAttribute('data-visible')).toBe('true');
    expect(hoverCorner.getAttribute('data-top')).toBe('9');
    act(() => {
      rows[0].blur();
    });
    expect(hoverRail.getAttribute('data-visible')).toBe('false');

    // Focus row 2, hover row 0, then mouseleave wrapper -> hover rail stays on focused row 2 until blur
    act(() => {
      rows[2].focus();
    });
    act(() => {
      rows[0].dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
    });
    expect(hoverCorner.getAttribute('data-top')).toBe('9');
    act(() => {
      wrap.dispatchEvent(new MouseEvent('mouseout', { bubbles: true, relatedTarget: document.body }));
    });
    expect(hoverRail.getAttribute('data-visible')).toBe('true');
    expect(hoverCorner.getAttribute('data-top')).toBe('73');
    act(() => {
      rows[2].blur();
    });
    expect(hoverRail.getAttribute('data-visible')).toBe('false');
  });

  it('supports label, dashed={false}, custom color, className, emptyText, and unmatched activeId', () => {
    const cancelSpy = vi.fn();
    const animateSpy = vi.fn(() => ({ cancel: cancelSpy }) as unknown as Animation);
    Object.defineProperty(Element.prototype, 'animate', {
      configurable: true,
      writable: true,
      value: animateSpy,
    });

    const items = [
      { id: 'a', title: 'Alpha' },
      { id: 'b', title: 'Beta' },
    ];
    const el = renderNode(
      <HookSidebarList
        items={items}
        activeId="b"
        label="Recent"
        dashed={false}
        color="#059669"
        className="custom-hook-nav"
      />,
    );

    const nav = el.querySelector('[data-slot="hook-sidebar"]') as HTMLElement;
    expect(nav.getAttribute('aria-label')).toBe('Recent');
    expect(nav.classList.contains('custom-hook-nav')).toBe(true);

    const labelEl = el.querySelector('[data-slot="hook-sidebar-label"]');
    expect(labelEl?.classList.contains('yui-hook-label')).toBe(true);
    expect(labelEl?.textContent).toBe('Recent');

    expect(el.querySelectorAll('.yui-hook-stem--solid').length).toBe(2);
    expect(el.querySelectorAll('.yui-hook-stem--dashed').length).toBe(0);
    const paths = el.querySelectorAll('.yui-hook-corner path');
    expect(paths[0].getAttribute('stroke-dasharray')).toBeNull();
    expect(paths[1].getAttribute('stroke-dasharray')).toBeNull();

    // Custom color applied via 0ms forwards WAAPI animation without JSX style=
    expect(animateSpy).toHaveBeenCalledWith(
      [{ color: '#059669' }, { color: '#059669' }],
      { duration: 0, fill: 'forwards' },
    );

    // Unmatched activeId hides active rail and marks no rows active
    rerenderNode(
      <HookSidebarList items={items} activeId="missing" label="Recent" dashed={false} />,
    );
    expect(cancelSpy).toHaveBeenCalled();
    expect(el.querySelector('.yui-hook-rail-layer--active')?.getAttribute('data-visible')).toBe(
      'false',
    );
    expect(el.querySelectorAll('[data-active="true"]').length).toBe(0);
    expect(el.querySelectorAll('[aria-current="true"]').length).toBe(0);

    // Empty list preserves root nav, label, and emptyText
    rerenderNode(<HookSidebarList items={[]} label="Recent" emptyText="Nothing yet" />);
    expect(el.querySelector('[data-slot="hook-sidebar"]')).toBeTruthy();
    expect(el.querySelector('.yui-genui-muted')?.textContent).toBe('Nothing yet');
  });

  it('animates via WAAPI damped spring, avoids snap-back on rapid changes, and respects prefers-reduced-motion', () => {
    vi.useFakeTimers();
    const cancelSpy = vi.fn();
    const animateCalls: Array<{
      target: Element;
      keyframes: Keyframe[];
      options: KeyframeAnimationOptions;
    }> = [];

    const animateSpy = vi.fn(function (
      this: Element,
      keyframes: Keyframe[] | PropertyIndexedKeyframes | null,
      options?: number | KeyframeAnimationOptions,
    ) {
      animateCalls.push({
        target: this,
        keyframes: (Array.isArray(keyframes) ? keyframes : []) as Keyframe[],
        options: (typeof options === 'object' ? options : {}) as KeyframeAnimationOptions,
      });
      return { cancel: cancelSpy } as unknown as Animation;
    });
    Object.defineProperty(Element.prototype, 'animate', {
      configurable: true,
      writable: true,
      value: animateSpy,
    });

    const items = [
      { id: 'a', title: 'Alpha' },
      { id: 'b', title: 'Beta' },
      { id: 'c', title: 'Gamma' },
      { id: 'd', title: 'Delta' },
    ];
    const el = renderNode(<HookSidebarList items={items} activeId="a" />);
    const rows = Array.from(el.querySelectorAll('[data-slot="hook-sidebar-item"]')) as HTMLButtonElement[];
    const activeRail = el.querySelector('.yui-hook-rail-layer--active') as HTMLElement;
    const activeStem = activeRail.querySelector('.yui-hook-stem') as HTMLElement;
    const activeCorner = activeRail.querySelector('.yui-hook-corner') as SVGElement;
    const hoverRail = el.querySelector('.yui-hook-rail-layer--hover') as HTMLElement;
    const hoverStem = hoverRail.querySelector('.yui-hook-stem') as HTMLElement;

    // Initial mount calls 0ms forwards WAAPI animations
    expect(animateCalls.length).toBeGreaterThan(0);

    // Hover row 1 (appears from hidden -> 200ms opacity fade-in), then move to row 2 (360ms spring)
    animateCalls.length = 0;
    act(() => {
      rows[1].dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
    });
    expect(
      animateCalls.some(
        (c) =>
          c.target === hoverRail &&
          c.options.duration === 200 &&
          c.options.fill === 'forwards',
      ),
    ).toBe(true);

    animateCalls.length = 0;
    act(() => {
      rows[2].dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
    });
    const hoverStemSpring = animateCalls.find(
      (c) => c.target === hoverStem && c.options.duration === 360,
    );
    expect(hoverStemSpring).toBeTruthy();
    expect(hoverStemSpring?.keyframes.length).toBe(25);
    expect(hoverStemSpring?.options.fill).toBe('forwards');
    expect(hoverStemSpring?.keyframes[0]).toEqual({ top: '15px', height: '26px' });
    expect(hoverStemSpring?.keyframes[24]).toEqual({ top: '15px', height: '58px' });

    // Click to change activeId 'a' -> 'd' (center 15 -> 111)
    animateCalls.length = 0;
    rerenderNode(<HookSidebarList items={items} activeId="d" />);
    const firstActiveSpring = animateCalls.find(
      (c) => c.target === activeStem && c.options.duration === 360,
    );
    expect(firstActiveSpring?.keyframes[0]).toEqual({ top: '0px', height: '9px' });
    expect(firstActiveSpring?.keyframes[24]).toEqual({ top: '0px', height: '105px' });
    expect(
      animateCalls.some((c) => c.target === activeCorner && c.options.duration === 360),
    ).toBe(true);

    // Advance 120ms mid-flight and immediately reverse activeId 'd' -> 'a'
    act(() => {
      vi.advanceTimersByTime(120);
    });
    animateCalls.length = 0;
    cancelSpy.mockClear();
    rerenderNode(<HookSidebarList items={items} activeId="a" />);
    expect(cancelSpy).toHaveBeenCalled();
    const interruptSpring = animateCalls.find(
      (c) => c.target === activeStem && c.options.duration === 360,
    );
    expect(interruptSpring).toBeTruthy();
    const midHeight = Number.parseFloat(String(interruptSpring?.keyframes[0].height));
    expect(midHeight).toBeGreaterThan(9);
    expect(midHeight).toBeLessThan(105);
    expect(interruptSpring?.keyframes[24]).toEqual({ top: '0px', height: '9px' });
  });

  it('collapses all WAAPI animation durations to 0ms under prefers-reduced-motion: reduce', () => {
    const animateCalls: Array<{
      target: Element;
      keyframes: Keyframe[];
      options: KeyframeAnimationOptions;
    }> = [];
    Object.defineProperty(Element.prototype, 'animate', {
      configurable: true,
      writable: true,
      value: vi.fn(function (
        this: Element,
        keyframes: Keyframe[] | PropertyIndexedKeyframes | null,
        options?: number | KeyframeAnimationOptions,
      ) {
        animateCalls.push({
          target: this,
          keyframes: (Array.isArray(keyframes) ? keyframes : []) as Keyframe[],
          options: (typeof options === 'object' ? options : {}) as KeyframeAnimationOptions,
        });
        return { cancel: vi.fn() } as unknown as Animation;
      }),
    });

    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    });

    const items = [
      { id: 'a', title: 'Alpha' },
      { id: 'b', title: 'Beta' },
      { id: 'c', title: 'Gamma' },
    ];
    const reducedEl = renderNode(<HookSidebarList items={items} activeId="a" />);
    const reducedRows = Array.from(
      reducedEl.querySelectorAll('[data-slot="hook-sidebar-item"]'),
    ) as HTMLButtonElement[];

    animateCalls.length = 0;
    act(() => {
      reducedRows[1].dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
    });
    act(() => {
      reducedRows[2].dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
    });
    rerenderNode(<HookSidebarList items={items} activeId="c" />);
    expect(animateCalls.length).toBeGreaterThan(0);
    expect(animateCalls.every((c) => c.options.duration === 0)).toBe(true);
  });

  it('measures live row centers via ResizeObserver and falls back smoothly when ResizeObserver is absent', () => {
    let roCallback: ResizeObserverCallback | null = null;
    const observeSpy = vi.fn();
    const disconnectSpy = vi.fn();

    class MockResizeObserver implements ResizeObserver {
      constructor(cb: ResizeObserverCallback) {
        roCallback = cb;
      }
      observe = observeSpy;
      unobserve = vi.fn();
      disconnect = disconnectSpy;
    }
    globalThis.ResizeObserver = MockResizeObserver;

    const items = [
      { id: 'a', title: 'Alpha' },
      { id: 'b', title: 'Beta' },
    ];
    const el = renderNode(<HookSidebarList items={items} activeId="b" />);
    expect(observeSpy).toHaveBeenCalledTimes(1);

    const rows = Array.from(el.querySelectorAll('[data-slot="hook-sidebar-item"]')) as HTMLElement[];
    Object.defineProperty(rows[0], 'offsetTop', { configurable: true, value: 0 });
    Object.defineProperty(rows[0], 'offsetHeight', { configurable: true, value: 40 });
    Object.defineProperty(rows[1], 'offsetTop', { configurable: true, value: 44 });
    Object.defineProperty(rows[1], 'offsetHeight', { configurable: true, value: 40 });

    act(() => {
      roCallback?.([], {} as ResizeObserver);
    });

    const activeRail = el.querySelector('.yui-hook-rail-layer--active') as HTMLElement;
    // Live row 1 center = 44 + 40 / 2 = 64 -> stem height = 64 - 6 = 58
    expect(activeRail.getAttribute('data-y')).toBe('64');
    expect(activeRail.querySelector('.yui-hook-stem')?.getAttribute('data-height')).toBe('58');
    expect(activeRail.querySelector('.yui-hook-corner')?.getAttribute('data-top')).toBe('58');

    // Fallback when ResizeObserver is absent and offsetHeight === 0 with custom rowHeight & gap
    (globalThis as { ResizeObserver?: typeof ResizeObserver }).ResizeObserver = undefined;
    Object.defineProperty(rows[0], 'offsetHeight', { configurable: true, value: 0 });
    Object.defineProperty(rows[1], 'offsetHeight', { configurable: true, value: 0 });
    rerenderNode(<HookSidebarList items={items} activeId="b" rowHeight={36} gap={4} />);
    // Fallback row 1 center = 1 * (36 + 4) + 18 = 58 -> stem height = 58 - 6 = 52
    expect(activeRail.getAttribute('data-y')).toBe('58');
    expect(activeRail.querySelector('.yui-hook-stem')?.getAttribute('data-height')).toBe('52');
  });

  it('satisfies strict Chrome MV3 CSP (zero JSX style= and zero dangerouslySetInnerHTML) and defines .yui-hook-* CSS', async () => {
    const tsxSource = await readStyleFile('../src/layout/HookSidebarList.tsx');
    expect(tsxSource).not.toContain('style={');
    expect(tsxSource).not.toContain('dangerouslySetInnerHTML');

    const cssSource = await readStyleFile('../src/styles/components.css');
    expect(cssSource).toContain('.yui-hook-label');
    expect(cssSource).toContain('.yui-hook-rail-layer');
    expect(cssSource).toContain('.yui-hook-rail-layer--hover');
    expect(cssSource).toContain('.yui-hook-rail-layer--active');
    expect(cssSource).toContain('.yui-hook-stem');
    expect(cssSource).toContain('.yui-hook-stem--dashed');
    expect(cssSource).toContain('repeating-linear-gradient(');
    expect(cssSource).toContain('transparent 0 2px,');
    expect(cssSource).toContain('currentColor 2px 4px');
    expect(cssSource).toContain('.yui-hook-stem--solid');
    expect(cssSource).toContain('.yui-hook-corner');

    const reducedIdx = cssSource.indexOf('@media (prefers-reduced-motion: reduce)');
    expect(reducedIdx).toBeGreaterThan(-1);
    expect(cssSource.slice(reducedIdx)).toContain('.yui-hook-rail-layer');
    expect(cssSource.slice(reducedIdx)).toContain('.yui-hook-row');
  });

  it('supports disabled TopNotch items without dispatching onSelectItem', () => {
    const onSelect = vi.fn();
    const el = renderNode(
      <TopNotch
        expandedId={null}
        onSelectItem={onSelect}
        items={[
          { id: 'new', icon: 'compose', label: 'New', disabled: true },
          { id: 'threads', icon: 'history', label: 'Threads' },
        ]}
      />,
    );

    const buttons = el.querySelectorAll('.yui-notch-btn') as NodeListOf<HTMLButtonElement>;
    expect(buttons[0].disabled).toBe(true);
    expect(buttons[1].disabled).toBe(false);
    act(() => {
      buttons[0].click();
      buttons[1].click();
    });
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith('threads');
  });

  it('renders NotchOptionRow with LED dot, selection checkmark, metadata, and disabled state', () => {
    const onSelectTab = vi.fn();
    const el = renderNode(
      <div>
        <NotchOptionRow
          title="Qwen3.5-4B · WGSL"
          subtitle="Q4F16 · OPFS cached"
          meta="2.6 GB"
          icon="local-device"
          dotTone="green"
          dotPulse
          selected
          onClick={() => onSelectTab('qwen')}
        />
        <NotchOptionRow
          title="Disabled Model"
          dotTone="amber"
          disabled
          onClick={() => onSelectTab('disabled')}
        />
      </div>,
    );

    const rows = el.querySelectorAll('[data-slot="notch-option-row"]') as NodeListOf<HTMLButtonElement>;
    expect(rows.length).toBe(2);
    expect(rows[0].getAttribute('data-selected')).toBe('true');
    expect(rows[0].getAttribute('aria-pressed')).toBe('true');
    expect(rows[0].querySelector('.yui-status-dot--pulse')).toBeTruthy();
    expect(rows[0].querySelector('.yui-notch-opt-check')).toBeTruthy();
    expect(rows[1].disabled).toBe(true);

    act(() => {
      rows[0].click();
      rows[1].click();
    });
    expect(onSelectTab).toHaveBeenCalledTimes(1);
    expect(onSelectTab).toHaveBeenCalledWith('qwen');
  });

  it('gates scroll-stage edge fade classes dynamically from overflow and scroll position', async () => {
    const el = renderNode(
      <SidePanelShell>
        <div>Scrollable turn</div>
      </SidePanelShell>,
    );
    const wrap = el.querySelector('.yui-scroll-wrap') as HTMLElement;
    const scroller = el.querySelector('.yui-scroll-stage') as HTMLElement;

    expect(wrap.classList.contains('yui-scroll-wrap--fade')).toBe(true);
    expect(wrap.getAttribute('data-fade-top')).toBe('false');
    expect(wrap.getAttribute('data-fade-bottom')).toBe('false');

    // Simulate scrollable overflow and test top -> middle -> bottom transitions
    Object.defineProperty(scroller, 'scrollHeight', { configurable: true, value: 600 });
    Object.defineProperty(scroller, 'clientHeight', { configurable: true, value: 300 });
    Object.defineProperty(scroller, 'scrollTop', { configurable: true, writable: true, value: 0 });

    act(() => {
      scroller.dispatchEvent(new Event('scroll'));
    });
    expect(wrap.getAttribute('data-fade-top')).toBe('false');
    expect(wrap.getAttribute('data-fade-bottom')).toBe('true');

    act(() => {
      scroller.scrollTop = 120;
      scroller.dispatchEvent(new Event('scroll'));
    });
    expect(wrap.getAttribute('data-fade-top')).toBe('true');
    expect(wrap.getAttribute('data-fade-bottom')).toBe('true');

    act(() => {
      scroller.scrollTop = 300;
      scroller.dispatchEvent(new Event('scroll'));
    });
    expect(wrap.getAttribute('data-fade-top')).toBe('true');
    expect(wrap.getAttribute('data-fade-bottom')).toBe('false');

    rerenderNode(
      <SidePanelShell scrollEdgeFade={false}>
        <div>Scrollable turn</div>
      </SidePanelShell>,
    );
    expect(el.querySelector('.yui-scroll-wrap--fade')).toBeNull();

    const cssSource = await readStyleFile('../src/styles/components.css');
    expect(cssSource).toContain('.yui-scroll-wrap--fade::before');
    expect(cssSource).toContain('.yui-scroll-wrap--fade::after');
  });

  it('traps Tab/Shift+Tab inside open TopNotch drawer and restores trigger focus on close', () => {
    const onClose = vi.fn();
    const el = renderNode(
      <div>
        <TopNotch
          expandedId={null}
          onClose={onClose}
          items={[
            { id: 'threads', icon: 'history', label: 'Threads' },
            { id: 'model', icon: 'local-device', label: 'Model' },
          ]}
        />
      </div>,
    );

    const triggerBtn = el.querySelector('.yui-notch-btn') as HTMLButtonElement;
    triggerBtn.focus();
    expect(document.activeElement).toBe(triggerBtn);

    rerenderNode(
      <div>
        <TopNotch
          expandedId="threads"
          onClose={onClose}
          items={[
            { id: 'threads', icon: 'history', label: 'Threads' },
            { id: 'model', icon: 'local-device', label: 'Model' },
          ]}
          drawerContent={
            <div>
              <button type="button" className="drawer-first">First</button>
              <button type="button" className="drawer-last">Last</button>
            </div>
          }
        />
      </div>,
    );

    const first = el.querySelector('.drawer-first') as HTMLButtonElement;
    const last = el.querySelector('.drawer-last') as HTMLButtonElement;
    expect(document.activeElement).toBe(first);

    act(() => {
      last.focus();
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    });
    expect(document.activeElement).toBe(first);

    act(() => {
      document.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true }),
      );
    });
    expect(document.activeElement).toBe(last);

    rerenderNode(
      <div>
        <TopNotch
          expandedId={null}
          onClose={onClose}
          items={[
            { id: 'threads', icon: 'history', label: 'Threads' },
            { id: 'model', icon: 'local-device', label: 'Model' },
          ]}
        />
      </div>,
    );
    expect(document.activeElement).toBe(triggerBtn);
  });
});
