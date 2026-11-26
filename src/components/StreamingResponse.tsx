import {
  Fragment,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type MutableRefObject,
  type ReactNode,
} from 'react';
import {
  CheckIcon,
  CopyIcon,
  RetryIcon,
  ThumbDownIcon,
  ThumbUpIcon,
} from '../icons/ApertureIcon.js';
import { useCopyFeedback, useHorizontalFade } from '../utils/clipboard.js';
import { useReducedMotion } from '../utils/spring.js';

export type StreamingResponseStatus = 'streaming' | 'done' | 'stopped';
export type StreamingResponseFeedback = 'up' | 'down' | null;

export interface StreamingResponseProps
  extends Omit<ComponentProps<'div'>, 'children' | 'onCopy'> {
  /** Markdown response content to render or stream progressively. */
  text: string;
  /** Lifecycle state controlling caret, reveal loop, and settled action bar. */
  status?: StreamingResponseStatus;
  /** Base reveal pace in words per second when streaming (default `8`). */
  speed?: number;
  /**
   * Optional developing ink color for newly mounted words and the active caret.
   * Pass `'accent'` to resolve `--yui-cobalt`, or any valid CSS color string.
   */
  ink?: string;
  /** Whether to show the settled action bar (`Copy`, `Retry`, `ThumbUp`, `ThumbDown`). */
  actions?: boolean;
  /** Initial uncontrolled feedback value (`'up' | 'down' | null`). */
  defaultFeedback?: StreamingResponseFeedback;
  /** Called whenever feedback toggles between `'up'`, `'down'`, and `null`. */
  onFeedback?: (feedback: StreamingResponseFeedback) => void;
  /** Called when the Retry action button is clicked. */
  onRetry?: () => void;
  /** Called with the currently visible revealed text when the response Copy button is clicked. */
  onCopy?: (text: string) => void;
}

const SPEED = 8;
const MAX_CHUNK = 3;
const CATCH_UP = 16;
const SENTENCE_PAUSE_MS = 240;
const CLAUSE_PAUSE_MS = 90;
const SHARPEN_MS = 260;
const DEVELOP_MS = 520;
const GLIDE_MS = 180;
const STAGGER_MS = 16;
const MAX_STAGGER_MS = 60;
const COPIED_MS = 1600;

const SAFE_HREF = /^(https?:|mailto:|\/|#)/i;

function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/**
 * Computes cumulative character end offsets for whole-word progressive reveal.
 * While streaming (`final === false`), holds back any trailing token not yet
 * terminated by whitespace so partial tokens do not flash mid-word.
 */
function wordEnds(text: string, final: boolean): number[] {
  const ends: number[] = [];
  const re = /\S+/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    const end = match.index + match[0].length;
    if (final || end < text.length) {
      ends.push(end);
    }
  }
  if (final && text.length > 0 && (ends.length === 0 || ends[ends.length - 1] < text.length)) {
    if (ends.length === 0) {
      ends.push(text.length);
    } else {
      ends[ends.length - 1] = text.length;
    }
  }
  return ends;
}

function punctuationPause(slice: string): number {
  const trimmed = slice.trim().replace(/["'”’)\]}>*_`]+$/, '');
  if (!trimmed) return 0;
  const last = trimmed[trimmed.length - 1];
  if (last === '.' || last === '!' || last === '?') {
    if (last === '.' && /^\d+\.$/.test(trimmed)) return 0;
    return SENTENCE_PAUSE_MS;
  }
  if (last === ',' || last === ';' || last === ':' || last === '—' || last === '–') {
    return CLAUSE_PAUSE_MS;
  }
  return 0;
}

type TableAlign = 'left' | 'center' | 'right';

type Block =
  | { type: 'p'; text: string }
  | { type: 'quote'; text: string }
  | { type: 'h'; level: 1 | 2 | 3; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; start: number; items: string[] }
  | { type: 'code'; lang: string; code: string; closed: boolean }
  | { type: 'table'; headers: string[]; aligns: TableAlign[]; rows: string[][] };

type Inline =
  | { type: 'text'; text: string }
  | { type: 'strong'; children: Inline[] }
  | { type: 'em'; children: Inline[] }
  | { type: 'code'; text: string }
  | { type: 'link'; label: string; href: string | null };

function isWordChar(ch: string | undefined): boolean {
  return ch !== undefined && /[A-Za-z0-9_]/.test(ch);
}

function closingParen(text: string, start: number): number {
  let depth = 1;
  for (let i = start; i < text.length; i++) {
    if (text[i] === '(') {
      depth++;
    } else if (text[i] === ')') {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function findClosingEm(src: string, start: number, marker: '*' | '_'): number {
  for (let i = start; i < src.length; i++) {
    if (src[i] !== marker) continue;
    const prev = src[i - 1];
    if (/\s/.test(prev)) continue;
    if (marker === '*') {
      if (src[i + 1] === '*' || prev === '*') continue;
      return i;
    }
    if (isWordChar(src[i + 1])) continue;
    return i;
  }
  return -1;
}

/**
 * Parses inline markdown (`**strong**`, `*em*`, `_em_`, `` `code` ``, `[label](href)`).
 * When `final === false`, unclosed delimiters are treated as closed so raw markers
 * do not flash and reflow mid-stream.
 */
function parseInline(src: string, final: boolean, depth = 0): Inline[] {
  if (depth > 8) {
    return src ? [{ type: 'text', text: src }] : [];
  }

  const out: Inline[] = [];
  const pushText = (value: string) => {
    if (!value) return;
    const prev = out[out.length - 1];
    if (prev && prev.type === 'text') {
      prev.text += value;
    } else {
      out.push({ type: 'text', text: value });
    }
  };

  let i = 0;
  while (i < src.length) {
    const ch = src[i];

    if (ch === '`') {
      const close = src.indexOf('`', i + 1);
      if (close !== -1) {
        out.push({ type: 'code', text: src.slice(i + 1, close) });
        i = close + 1;
        continue;
      }
      if (!final) {
        const rest = src.slice(i + 1);
        if (rest.length > 0) {
          out.push({ type: 'code', text: rest });
        }
        i = src.length;
        continue;
      }
      pushText(ch);
      i += 1;
      continue;
    }

    if (ch === '[') {
      const closeBracket = src.indexOf(']', i + 1);
      if (closeBracket === -1) {
        if (!final) {
          const label = src.slice(i + 1);
          if (label.length > 0) {
            out.push({ type: 'link', label, href: null });
          }
          i = src.length;
          continue;
        }
        pushText(ch);
        i += 1;
        continue;
      }

      const label = src.slice(i + 1, closeBracket);
      if (closeBracket + 1 === src.length) {
        if (!final) {
          out.push({ type: 'link', label, href: null });
          i = src.length;
          continue;
        }
        pushText(ch);
        i += 1;
        continue;
      }

      if (src[closeBracket + 1] === '(') {
        const closeParenIdx = closingParen(src, closeBracket + 2);
        if (closeParenIdx !== -1) {
          const rawHref = src.slice(closeBracket + 2, closeParenIdx).trim();
          if (SAFE_HREF.test(rawHref)) {
            out.push({ type: 'link', label, href: rawHref });
          } else {
            pushText(label);
          }
          i = closeParenIdx + 1;
          continue;
        }
        if (!final) {
          out.push({ type: 'link', label, href: null });
          i = src.length;
          continue;
        }
      }

      pushText(ch);
      i += 1;
      continue;
    }

    if (ch === '*' && src[i + 1] === '*') {
      let close = src.indexOf('**', i + 2);
      if (close !== -1) {
        if (src[close + 2] === '*' && src[close + 3] !== '*') {
          close += 1;
        }
        const inner = src.slice(i + 2, close);
        if (inner.length > 0) {
          out.push({ type: 'strong', children: parseInline(inner, true, depth + 1) });
        }
        i = close + 2;
        continue;
      }
      if (!final) {
        const inner = src.slice(i + 2);
        if (inner.length > 0) {
          out.push({ type: 'strong', children: parseInline(inner, false, depth + 1) });
        }
        i = src.length;
        continue;
      }
      pushText('**');
      i += 2;
      continue;
    }

    if (ch === '*' || ch === '_') {
      const next = src[i + 1];
      const prev = i > 0 ? src[i - 1] : undefined;
      const canOpen =
        next !== undefined &&
        !/\s/.test(next) &&
        (ch === '*' ? next !== '*' : !isWordChar(prev));

      if (canOpen) {
        const close = findClosingEm(src, i + 1, ch);
        if (close !== -1) {
          const inner = src.slice(i + 1, close);
          out.push({ type: 'em', children: parseInline(inner, true, depth + 1) });
          i = close + 1;
          continue;
        }
        if (!final) {
          const inner = src.slice(i + 1);
          if (inner.length > 0) {
            out.push({ type: 'em', children: parseInline(inner, false, depth + 1) });
          }
          i = src.length;
          continue;
        }
      }

      pushText(ch);
      i += 1;
      continue;
    }

    let j = i + 1;
    while (j < src.length) {
      const c = src[j];
      if (c === '`' || c === '[' || c === '*' || c === '_') break;
      j++;
    }
    pushText(src.slice(i, j));
    i = j;
  }

  return out;
}

const FENCE_OPEN_RE = /^\s*```([^\n]*)$/;
const FENCE_CLOSE_RE = /^\s*```\s*$/;
const HEADING_RE = /^\s*(#{1,6})\s+(.*)$/;
const QUOTE_RE = /^\s*>\s?(.*)$/;
const UL_RE = /^\s*[-*+]\s+(.*)$/;
const OL_RE = /^\s*(\d+)\.\s+(.*)$/;
const TABLE_DELIM_CELL_RE = /^:?-{1,}:?$/;

function splitPipeRow(rawLine: string): string[] | null {
  const trimmed = rawLine.trim();
  if (!trimmed || !trimmed.includes('|')) return null;

  const hasOuterEdgePipe = trimmed.startsWith('|') || trimmed.endsWith('|');
  const cells: string[] = [];
  let cur = '';
  for (let idx = 0; idx < trimmed.length; idx++) {
    const ch = trimmed[idx];
    if (ch === '\\' && trimmed[idx + 1] === '|') {
      cur += '|';
      idx += 1;
      continue;
    }
    if (ch === '|') {
      cells.push(cur.trim());
      cur = '';
      continue;
    }
    cur += ch;
  }
  cells.push(cur.trim());

  if (trimmed.startsWith('|') && cells[0] === '') {
    cells.shift();
  }
  if (trimmed.endsWith('|') && cells.length > 0 && cells[cells.length - 1] === '') {
    cells.pop();
  }

  if (cells.length === 0) return null;
  if (!hasOuterEdgePipe && cells.length < 2) return null;
  return cells;
}

function tryParseTableStart(
  lines: readonly string[],
  startIndex: number,
): { headers: string[]; aligns: TableAlign[] } | null {
  if (startIndex + 1 >= lines.length) return null;
  const headers = splitPipeRow(lines[startIndex]);
  if (!headers) return null;
  const delimCells = splitPipeRow(lines[startIndex + 1]);
  if (!delimCells || delimCells.length !== headers.length) return null;

  const aligns: TableAlign[] = [];
  for (const cell of delimCells) {
    if (!TABLE_DELIM_CELL_RE.test(cell)) return null;
    if (cell.startsWith(':') && cell.endsWith(':')) {
      aligns.push('center');
    } else if (cell.endsWith(':')) {
      aligns.push('right');
    } else {
      aligns.push('left');
    }
  }
  return { headers, aligns };
}

function collectListItems(
  lines: readonly string[],
  startIndex: number,
  itemRe: RegExp,
  otherListRe: RegExp,
  captureIndex: number,
): { items: string[]; nextIndex: number } {
  const items: string[] = [];
  let i = startIndex;
  while (i < lines.length) {
    const match = lines[i].match(itemRe);
    if (match) {
      items.push(match[captureIndex]);
      i++;
      continue;
    }
    if (
      items.length > 0 &&
      /^\s{2,}\S/.test(lines[i]) &&
      !otherListRe.test(lines[i]) &&
      !FENCE_OPEN_RE.test(lines[i])
    ) {
      items[items.length - 1] += ` ${lines[i].trim()}`;
      i++;
      continue;
    }
    break;
  }
  return { items, nextIndex: i };
}

/** Parses streaming or complete markdown text into block nodes. */
function parseBlocks(source: string): Block[] {
  const lines = source.replace(/\r\n/g, '\n').split('\n');
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === '') {
      i++;
      continue;
    }

    const fenceMatch = line.match(FENCE_OPEN_RE);
    if (fenceMatch) {
      const lang = fenceMatch[1].trim();
      const codeLines: string[] = [];
      let j = i + 1;
      let closed = false;
      while (j < lines.length) {
        if (FENCE_CLOSE_RE.test(lines[j])) {
          closed = true;
          j++;
          break;
        }
        codeLines.push(lines[j]);
        j++;
      }
      blocks.push({ type: 'code', lang, code: codeLines.join('\n'), closed });
      i = j;
      continue;
    }

    const headingMatch = line.match(HEADING_RE);
    if (headingMatch) {
      const level = Math.min(headingMatch[1].length, 3) as 1 | 2 | 3;
      blocks.push({ type: 'h', level, text: headingMatch[2].trim() });
      i++;
      continue;
    }

    if (QUOTE_RE.test(line)) {
      const quoteLines: string[] = [];
      while (i < lines.length) {
        const qm = lines[i].match(QUOTE_RE);
        if (!qm) break;
        if (qm[1].trim() !== '') {
          quoteLines.push(qm[1]);
        }
        i++;
      }
      blocks.push({ type: 'quote', text: quoteLines.join(' ') });
      continue;
    }

    if (UL_RE.test(line)) {
      const { items, nextIndex } = collectListItems(lines, i, UL_RE, OL_RE, 1);
      blocks.push({ type: 'ul', items });
      i = nextIndex;
      continue;
    }

    const olStartMatch = line.match(OL_RE);
    if (olStartMatch) {
      const start = Number.parseInt(olStartMatch[1], 10);
      const { items, nextIndex } = collectListItems(lines, i, OL_RE, UL_RE, 2);
      blocks.push({ type: 'ol', start, items });
      i = nextIndex;
      continue;
    }

    const tableStart = tryParseTableStart(lines, i);
    if (tableStart) {
      const { headers, aligns } = tableStart;
      const rows: string[][] = [];
      let j = i + 2;
      while (j < lines.length) {
        const cur = lines[j];
        if (
          cur.trim() === '' ||
          FENCE_OPEN_RE.test(cur) ||
          HEADING_RE.test(cur) ||
          QUOTE_RE.test(cur) ||
          UL_RE.test(cur) ||
          OL_RE.test(cur) ||
          !cur.includes('|')
        ) {
          break;
        }
        const parsedRow = splitPipeRow(cur);
        if (!parsedRow) break;
        const normalized = Array.from({ length: headers.length }, (_, colIdx) => parsedRow[colIdx] ?? '');
        rows.push(normalized);
        j++;
      }
      blocks.push({ type: 'table', headers, aligns, rows });
      i = j;
      continue;
    }

    const pLines: string[] = [];
    while (i < lines.length) {
      const cur = lines[i];
      if (
        cur.trim() === '' ||
        FENCE_OPEN_RE.test(cur) ||
        HEADING_RE.test(cur) ||
        QUOTE_RE.test(cur) ||
        UL_RE.test(cur) ||
        OL_RE.test(cur) ||
        tryParseTableStart(lines, i) !== null
      ) {
        break;
      }
      pLines.push(cur);
      i++;
    }
    blocks.push({ type: 'p', text: pLines.join(' ') });
  }

  return blocks;
}

interface FreshFrame {
  at: number;
  n: number;
}

interface WordProps {
  children: string;
  animate: boolean;
  ink?: string;
  fresh: MutableRefObject<FreshFrame>;
}

/**
 * Renders an individual word token and runs a staggered WAAPI sharpen/develop
 * animation on initial mount while streaming.
 */
function Word({ children, animate, ink, fresh }: WordProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    if (!animate) return;
    const el = ref.current;
    if (!el || typeof el.animate !== 'function') return;

    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    if (now - fresh.current.at > 8) {
      fresh.current.at = now;
      fresh.current.n = 0;
    }
    const delay = Math.min(fresh.current.n * STAGGER_MS, MAX_STAGGER_MS);
    fresh.current.n += 1;

    el.animate(
      [{ filter: 'blur(5px)' }, { filter: 'blur(0px)' }],
      {
        duration: SHARPEN_MS,
        delay,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        fill: 'backwards',
      },
    );
    el.animate(
      [{ opacity: 0 }, { opacity: 1 }],
      {
        duration: DEVELOP_MS,
        delay,
        easing: 'ease-out',
        fill: 'backwards',
      },
    );

    if (ink) {
      const cs = typeof getComputedStyle === 'function' ? getComputedStyle(el) : null;
      const resolvedInk =
        ink === 'accent'
          ? cs?.getPropertyValue('--yui-cobalt').trim() || '#1D4ED8'
          : ink;
      const settled = cs?.color || '#141413';
      if (resolvedInk) {
        el.animate(
          [{ color: resolvedInk }, { color: settled }],
          {
            duration: DEVELOP_MS,
            delay,
            easing: 'ease-out',
            fill: 'backwards',
          },
        );
      }
    }
  }, []);

  return (
    <span ref={ref} className="yui-sr-word">
      {children}
    </span>
  );
}

interface CaretTrack {
  x: number;
  y: number;
  glide?: Animation;
}

interface CaretProps {
  ink?: string;
  reducedMotion: boolean;
  trackRef: MutableRefObject<CaretTrack | null>;
  pos: number;
}

/** Pulsing inline streaming caret that glides horizontally along the active line. */
function Caret({ ink, reducedMotion, trackRef, pos }: CaretProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prev = trackRef.current;
    prev?.glide?.cancel();

    const rect = el.getBoundingClientRect();
    trackRef.current = { x: rect.left, y: rect.top };

    if (!prev || reducedMotion || typeof el.animate !== 'function') return;

    const from = prev.x - rect.left;
    if (Math.abs(rect.top - prev.y) < 6 && from !== 0 && Math.abs(from) < 400) {
      trackRef.current.glide = el.animate(
        [{ translate: `${from}px 0` }, { translate: '0 0' }],
        { duration: GLIDE_MS, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
      );
    }
  }, [pos, reducedMotion, trackRef]);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !ink || ink === 'accent' || typeof el.animate !== 'function') return;
    const anim = el.animate(
      [{ backgroundColor: ink }, { backgroundColor: ink }],
      { duration: 1, fill: 'forwards' },
    );
    return () => anim.cancel();
  }, [ink]);

  return (
    <span
      ref={ref}
      data-slot="streaming-response-caret"
      aria-hidden="true"
      className={cx('yui-sr-caret', ink === 'accent' && 'yui-sr-caret--accent')}
    />
  );
}

function CodeLine({ line, animate }: { line: string; animate: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    if (!animate) return;
    const el = ref.current;
    if (!el || typeof el.animate !== 'function') return;
    el.animate(
      [
        { opacity: 0, filter: 'blur(3px)' },
        { opacity: 1, filter: 'blur(0px)' },
      ],
      { duration: SHARPEN_MS, easing: 'ease-out', fill: 'backwards' },
    );
  }, []);

  return (
    <span ref={ref} className="yui-sr-code-line">
      {line}
    </span>
  );
}

interface StreamingCodeBlockProps {
  lang: string;
  code: string;
  animate: boolean;
  caret?: ReactNode;
}

/** Internal line-by-line animated fenced code block with header language tag, Copy swap, and scroll fade. */
function StreamingCodeBlock({ lang, code, animate, caret }: StreamingCodeBlockProps) {
  const { scrollRef, canScrollRight } = useHorizontalFade([code]);
  const { copied, triggerCopy } = useCopyFeedback(COPIED_MS);

  const handleCopy = () => {
    triggerCopy(code);
  };

  const lines = code.split('\n');
  const langLabel = (lang || 'text').trim() || 'text';

  return (
    <div className="yui-sr-code">
      <div className="yui-sr-code-header">
        <span className="yui-sr-code-lang">{langLabel}</span>
        <button
          type="button"
          className="yui-sr-code-copy"
          aria-label={copied ? 'Copied code' : 'Copy code'}
          onClick={handleCopy}
        >
          <span key={copied ? 'check' : 'copy'} className="yui-sr-icon-swap">
            {copied ? <CheckIcon size={12} /> : <CopyIcon size={12} />}
          </span>
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <div
        className={cx('yui-data-scroll-wrap', canScrollRight && 'has-right-fade')}
        data-scrollable-right={canScrollRight ? 'true' : 'false'}
      >
        <div ref={scrollRef} className="yui-sr-code-scroll">
          <pre className="yui-sr-code-pre">
            <code>
              {lines.map((line, idx) => (
                <Fragment key={idx}>
                  <CodeLine line={line} animate={animate} />
                  {idx < lines.length - 1 ? '\n' : null}
                </Fragment>
              ))}
              {caret}
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
}

interface StreamingTableProps {
  headers: readonly string[];
  aligns: readonly TableAlign[];
  rows: readonly (readonly string[])[];
  keyPrefix: string;
  final: boolean;
  wordCtx: WordRenderCtx;
  caret?: ReactNode;
}

/**
 * Paper Page 9 hairline GFM Markdown pipe-table with column alignments,
 * `tabular-nums`, inline formatting inside cells, and dynamic horizontal scroll fade.
 */
function StreamingTable({
  headers,
  aligns,
  rows,
  keyPrefix,
  final,
  wordCtx,
  caret,
}: StreamingTableProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const syncFade = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const next = el.scrollWidth - el.clientWidth - el.scrollLeft > 2;
    setCanScrollRight((prev) => (prev === next ? prev : next));
  }, []);

  useEffect(() => {
    syncFade();
    const el = scrollRef.current;
    if (!el) return;

    const onScroll = () => syncFade();
    el.addEventListener('scroll', onScroll, { passive: true });

    let ro: ResizeObserver | undefined;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => syncFade());
      ro.observe(el);
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', onScroll, { passive: true });
    }

    return () => {
      el.removeEventListener('scroll', onScroll);
      ro?.disconnect();
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', onScroll);
      }
    };
  }, [syncFade, headers, rows]);

  return (
    <div className="yui-sr-table-card" data-slot="streaming-response-table">
      <div
        className={cx('yui-data-scroll-wrap', canScrollRight && 'has-right-fade')}
        data-scrollable-right={canScrollRight ? 'true' : 'false'}
      >
        <div ref={scrollRef} className="yui-sr-table-scroll">
          <table className="yui-sr-table">
            <thead>
              <tr>
                {headers.map((header, colIdx) => {
                  const align = aligns[colIdx] ?? 'left';
                  const isTail = rows.length === 0 && colIdx === headers.length - 1;
                  return (
                    <th key={`${keyPrefix}-h${colIdx}`} className={cx('yui-sr-th', `is-${align}`)}>
                      {renderInline(parseInline(header, final), `${keyPrefix}-h${colIdx}`, wordCtx)}
                      {isTail ? caret : null}
                    </th>
                  );
                })}
              </tr>
            </thead>
            {rows.length > 0 ? (
              <tbody>
                {rows.map((row, rowIdx) => (
                  <tr key={`${keyPrefix}-r${rowIdx}`} className="yui-sr-tr">
                    {headers.map((_, colIdx) => {
                      const align = aligns[colIdx] ?? 'left';
                      const cell = row[colIdx] ?? '';
                      const isTail =
                        rowIdx === rows.length - 1 && colIdx === headers.length - 1;
                      return (
                        <td
                          key={`${keyPrefix}-r${rowIdx}-c${colIdx}`}
                          className={cx('yui-sr-td', `is-${align}`)}
                        >
                          {cell ? renderInline(parseInline(cell, final), `${keyPrefix}-r${rowIdx}-c${colIdx}`, wordCtx) : null}
                          {isTail ? caret : null}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            ) : null}
          </table>
        </div>
      </div>
    </div>
  );
}

interface WordRenderCtx {
  animate: boolean;
  ink?: string;
  fresh: MutableRefObject<FreshFrame>;
}

function renderWords(text: string, keyPrefix: string, ctx: WordRenderCtx): ReactNode[] {
  const tokens = text.split(/(\s+)/);
  return tokens.map((token, idx) => {
    if (!token) return null;
    if (/^\s+$/.test(token)) {
      return <Fragment key={`${keyPrefix}-s${idx}`}>{token}</Fragment>;
    }
    return (
      <Word
        key={`${keyPrefix}-w${idx}`}
        animate={ctx.animate}
        ink={ctx.ink}
        fresh={ctx.fresh}
      >
        {token}
      </Word>
    );
  });
}

function renderInline(nodes: Inline[], keyPrefix: string, ctx: WordRenderCtx): ReactNode[] {
  return nodes.map((node, idx) => {
    const key = `${keyPrefix}-${idx}`;
    switch (node.type) {
      case 'text':
        return <Fragment key={key}>{renderWords(node.text, key, ctx)}</Fragment>;
      case 'strong':
        return (
          <strong key={key} className="yui-sr-strong">
            {renderInline(node.children, key, ctx)}
          </strong>
        );
      case 'em':
        return (
          <em key={key} className="yui-sr-em">
            {renderInline(node.children, key, ctx)}
          </em>
        );
      case 'code':
        return (
          <code key={key} className="yui-sr-inline-code">
            {renderWords(node.text, key, ctx)}
          </code>
        );
      case 'link': {
        if (node.href === null) {
          return (
            <span key={key} className="yui-sr-link-pending">
              {renderWords(node.label, key, ctx)}
            </span>
          );
        }
        const external = /^https?:/i.test(node.href);
        return (
          <a
            key={key}
            className="yui-sr-link"
            href={node.href}
            target={external ? '_blank' : undefined}
            rel={external ? 'noopener noreferrer' : undefined}
          >
            {renderWords(node.label, key, ctx)}
          </a>
        );
      }
    }
  });
}

/**
 * Progressive Markdown streaming response surface with whole-word pacing,
 * unclosed-marker-aware parsing, optical sharpen/develop word reveal,
 * gliding caret, line-by-line fenced code blocks, and settled action controls.
 */
export function StreamingResponse({
  text,
  status = 'done',
  speed = SPEED,
  ink,
  actions = true,
  defaultFeedback = null,
  onFeedback,
  onRetry,
  onCopy,
  className,
  ...rest
}: StreamingResponseProps) {
  const reducedMotion = useReducedMotion();
  const [pos, setPos] = useState<number>(() => (status === 'streaming' ? 0 : text.length));
  const [run, setRun] = useState(0);
  const [feedback, setFeedback] = useState<StreamingResponseFeedback>(defaultFeedback);
  const { copied, triggerCopy } = useCopyFeedback(COPIED_MS);
  const [spins, setSpins] = useState(0);

  const seen = useRef(text);
  const posRef = useRef(pos);
  posRef.current = pos;
  const animatedRunRef = useRef(status === 'streaming');
  const paceRef = useRef({ lastAt: 0, budget: 1, pauseUntil: 0 });
  const freshRef = useRef<FreshFrame>({ at: 0, n: 0 });
  const trackRef = useRef<CaretTrack | null>(null);

  useEffect(() => {
    return () => {
      trackRef.current?.glide?.cancel();
    };
  }, []);

  useLayoutEffect(() => {
    if (!text.startsWith(seen.current)) {
      seen.current = text;
      const nextPos = status === 'streaming' ? 0 : text.length;
      posRef.current = nextPos;
      setPos(nextPos);
      setRun((n) => n + 1);
      animatedRunRef.current = status === 'streaming';
      paceRef.current = { lastAt: 0, budget: 1, pauseUntil: 0 };
      freshRef.current = { at: 0, n: 0 };
      trackRef.current?.glide?.cancel();
      trackRef.current = null;
      return;
    }

    seen.current = text;
    if (status === 'streaming') {
      animatedRunRef.current = true;
    } else if (status === 'done' && !animatedRunRef.current && posRef.current !== text.length) {
      posRef.current = text.length;
      setPos(text.length);
    }
  }, [text, status]);

  const streaming = status === 'streaming';
  const settled = status === 'stopped' || (!streaming && pos >= text.length);

  useEffect(() => {
    if (settled) return;

    const ends = wordEnds(text, !streaming);
    let idx = 0;
    while (idx < ends.length && ends[idx] <= posRef.current) {
      idx++;
    }
    if (idx >= ends.length) return;

    if (reducedMotion || typeof requestAnimationFrame !== 'function') {
      const target = ends[ends.length - 1];
      if (posRef.current !== target) {
        posRef.current = target;
        setPos(target);
      }
      return;
    }

    let rafId = 0;
    const tick = (now: number) => {
      const curPos = posRef.current;
      let nextIdx = 0;
      while (nextIdx < ends.length && ends[nextIdx] <= curPos) {
        nextIdx++;
      }
      if (nextIdx >= ends.length) return;

      const pace = paceRef.current;
      if (pace.lastAt === 0) {
        pace.lastAt = now;
      }
      const rawDt = now - pace.lastAt;
      if (rawDt > 125 && now >= pace.pauseUntil) {
        pace.budget = Math.max(pace.budget, 1);
      }
      const dt = Math.max(0, Math.min(rawDt, 100));
      pace.lastAt = now;

      const backlog = ends.length - nextIdx;
      if (backlog <= CATCH_UP && now < pace.pauseUntil) {
        rafId = requestAnimationFrame(tick);
        return;
      }

      const baseSpeed = Math.max(0.1, speed);
      const effectiveSpeed =
        backlog > CATCH_UP ? baseSpeed + (backlog - CATCH_UP) * 4 : baseSpeed;

      pace.budget = Math.min(
        pace.budget + (dt / 1000) * effectiveSpeed,
        MAX_CHUNK,
      );

      let nextPos = curPos;
      let revealed = 0;
      while (revealed < MAX_CHUNK && pace.budget >= 1 && nextIdx < ends.length) {
        const prevEnd = nextPos;
        nextPos = ends[nextIdx];
        const wordSlice = text.slice(prevEnd, nextPos);
        nextIdx++;
        revealed++;
        pace.budget -= 1;

        const remainingAfter = ends.length - nextIdx;
        if (remainingAfter <= CATCH_UP) {
          const pause = punctuationPause(wordSlice);
          if (pause > 0) {
            pace.pauseUntil = now + pause;
            pace.budget = 0;
            break;
          }
        }
      }

      if (nextPos !== curPos) {
        posRef.current = nextPos;
        setPos(nextPos);
      }

      if (nextIdx < ends.length) {
        rafId = requestAnimationFrame(tick);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [settled, text, streaming, speed, reducedMotion]);

  const visible = text.slice(0, pos);
  const final = !streaming && pos >= text.length;
  const blocks = useMemo(() => parseBlocks(visible), [visible]);

  const animateWords = !reducedMotion && animatedRunRef.current;
  const wordCtx: WordRenderCtx = {
    animate: animateWords,
    ink,
    fresh: freshRef,
  };

  const caretNode = !settled ? (
    <Caret
      ink={ink}
      reducedMotion={reducedMotion}
      trackRef={trackRef}
      pos={pos}
    />
  ) : null;

  const handleCopyResponse = () => {
    triggerCopy(visible);
    onCopy?.(visible);
  };

  const handleFeedback = (choice: 'up' | 'down') => {
    const next: StreamingResponseFeedback = feedback === choice ? null : choice;
    setFeedback(next);
    onFeedback?.(next);
  };

  const handleRetry = () => {
    setSpins((s) => s + 1);
    onRetry?.();
  };

  return (
    <div
      className={cx('yui-sr', className)}
      aria-busy={!settled || undefined}
      {...rest}
    >
      <div key={run} className="yui-sr-body">
        {blocks.length === 0 ? (
          caretNode ? <p className="yui-sr-p">{caretNode}</p> : null
        ) : (
          blocks.map((block, bIdx) => {
            const isLastBlock = bIdx === blocks.length - 1;
            const tailCaret = isLastBlock ? caretNode : null;
            const key = `b-${bIdx}`;

            switch (block.type) {
              case 'p':
                return (
                  <p key={key} className="yui-sr-p">
                    {renderInline(parseInline(block.text, final), key, wordCtx)}
                    {tailCaret}
                  </p>
                );
              case 'quote':
                return (
                  <blockquote key={key} className="yui-sr-quote">
                    {renderInline(parseInline(block.text, final), key, wordCtx)}
                    {tailCaret}
                  </blockquote>
                );
              case 'h': {
                const content = (
                  <>
                    {renderInline(parseInline(block.text, final), key, wordCtx)}
                    {tailCaret}
                  </>
                );
                if (block.level === 1) {
                  return (
                    <h3 key={key} className="yui-sr-h yui-sr-h1">
                      {content}
                    </h3>
                  );
                }
                if (block.level === 2) {
                  return (
                    <h4 key={key} className="yui-sr-h yui-sr-h2">
                      {content}
                    </h4>
                  );
                }
                return (
                  <h5 key={key} className="yui-sr-h yui-sr-h3">
                    {content}
                  </h5>
                );
              }
              case 'ul':
                return (
                  <ul key={key} className="yui-sr-ul">
                    {block.items.map((item, itemIdx) => {
                      const isLastItem = isLastBlock && itemIdx === block.items.length - 1;
                      const itemKey = `${key}-i${itemIdx}`;
                      return (
                        <li key={itemKey} className="yui-sr-li">
                          {renderInline(parseInline(item, final), itemKey, wordCtx)}
                          {isLastItem ? caretNode : null}
                        </li>
                      );
                    })}
                  </ul>
                );
              case 'ol':
                return (
                  <ol
                    key={key}
                    className="yui-sr-ol"
                    start={block.start !== 1 ? block.start : undefined}
                  >
                    {block.items.map((item, itemIdx) => {
                      const isLastItem = isLastBlock && itemIdx === block.items.length - 1;
                      const itemKey = `${key}-i${itemIdx}`;
                      return (
                        <li key={itemKey} className="yui-sr-li">
                          {renderInline(parseInline(item, final), itemKey, wordCtx)}
                          {isLastItem ? caretNode : null}
                        </li>
                      );
                    })}
                  </ol>
                );
              case 'code':
                return (
                  <StreamingCodeBlock
                    key={key}
                    lang={block.lang}
                    code={block.code}
                    animate={animateWords}
                    caret={tailCaret}
                  />
                );
              case 'table':
                return (
                  <StreamingTable
                    key={key}
                    headers={block.headers}
                    aligns={block.aligns}
                    rows={block.rows}
                    keyPrefix={key}
                    final={final}
                    wordCtx={wordCtx}
                    caret={tailCaret}
                  />
                );
            }
          })
        )}
      </div>

      {actions && settled ? (
        <div className="yui-sr-actions" data-slot="streaming-response-actions">
          <button
            type="button"
            className="yui-sr-action-btn"
            aria-label={copied ? 'Copied response' : 'Copy response'}
            onClick={handleCopyResponse}
          >
            <span key={copied ? 'check' : 'copy'} className="yui-sr-icon-swap">
              {copied ? <CheckIcon size={13} /> : <CopyIcon size={13} />}
            </span>
          </button>
          <button
            type="button"
            className="yui-sr-action-btn"
            aria-label="Retry response"
            onClick={handleRetry}
          >
            <RetryIcon
              key={spins}
              size={13}
              className={spins > 0 ? 'yui-sr-retry-icon is-spinning' : 'yui-sr-retry-icon'}
            />
          </button>
          <button
            type="button"
            className={cx('yui-sr-action-btn', feedback === 'up' && 'is-active')}
            aria-label="Thumbs up"
            aria-pressed={feedback === 'up'}
            onClick={() => handleFeedback('up')}
          >
            <ThumbUpIcon size={13} strokeWidth={feedback === 'up' ? 2.1 : 1.75} />
          </button>
          <button
            type="button"
            className={cx('yui-sr-action-btn', feedback === 'down' && 'is-active')}
            aria-label="Thumbs down"
            aria-pressed={feedback === 'down'}
            onClick={() => handleFeedback('down')}
          >
            <ThumbDownIcon size={13} strokeWidth={feedback === 'down' ? 2.1 : 1.75} />
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default StreamingResponse;
