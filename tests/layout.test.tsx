import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  HookSidebarList,
  NotchDrawerSearch,
  NotchStatusPill,
  SidePanelShell,
  TopNotch,
} from '../src/layout/index.js';

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

describe('@yours/ui layout & TopNotch primitives', () => {
  it('renders SidePanelShell with theme override and veil interaction', () => {
    const onVeilClick = vi.fn();
    const el = renderNode(
      <SidePanelShell theme="dark" veilOpen onVeilClick={onVeilClick} footer={<div>Composer</div>}>
        <div>Stage Content</div>
      </SidePanelShell>,
    );

    const shell = el.querySelector('.yui-shell');
    expect(shell?.getAttribute('data-theme')).toBe('dark');
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
    expect(el.querySelector('.yui-hook-active')).toBeTruthy();
    const secondRow = el.querySelectorAll('.yui-hook-row')[1] as HTMLButtonElement;
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
});
