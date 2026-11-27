import { createElement, type SVGProps } from 'react';
import {
  APERTURE_ICON_DATA,
  type ApertureIconName,
} from './iconData.js';

export interface ApertureIconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: ApertureIconName;
  size?: number | string;
}

/**
 * Renders any of the 50 Aperture (Set E) outline SVG icons using pure React
 * SVG elements with zero `dangerouslySetInnerHTML`.
 */
export function ApertureIcon({
  name,
  size = 16,
  strokeWidth = 1.75,
  className,
  ...rest
}: ApertureIconProps) {
  const primitives = APERTURE_ICON_DATA[name];
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={rest['aria-label'] ? undefined : true}
      className={className ? `yui-icon ${className}` : 'yui-icon'}
      {...rest}
    >
      {primitives.map((primitive, index) =>
        createElement(primitive.tag, {
          key: `${name}-${index}`,
          ...primitive.attrs,
        }),
      )}
    </svg>
  );
}

export type SingleIconProps = Omit<ApertureIconProps, 'name'>;

function createNamedIcon(name: ApertureIconName) {
  function IconComponent(props: SingleIconProps) {
    return <ApertureIcon name={name} {...props} />;
  }
  return IconComponent;
}

export const AlertIcon = createNamedIcon('alert');
export const ArchiveIcon = createNamedIcon('archive');
export const ArrowDownIcon = createNamedIcon('arrow-down');
export const ArrowRightIcon = createNamedIcon('arrow-right');
export const AttachIcon = createNamedIcon('attach');
export const BookmarkIcon = createNamedIcon('bookmark');
export const CheckIcon = createNamedIcon('check');
export const ChecklistIcon = createNamedIcon('checklist');
export const ChevronDownIcon = createNamedIcon('chevron-down');
export const ChevronLeftIcon = createNamedIcon('chevron-left');
export const ChevronRightIcon = createNamedIcon('chevron-right');
export const ChevronUpIcon = createNamedIcon('chevron-up');
export const CompareIcon = createNamedIcon('compare');
export const ComposeIcon = createNamedIcon('compose');
export const CopyIcon = createNamedIcon('copy');
export const DocumentIcon = createNamedIcon('document');
export const ExpandIcon = createNamedIcon('expand');
export const ExternalLinkIcon = createNamedIcon('external-link');
export const GlobeIcon = createNamedIcon('globe');
export const HistoryIcon = createNamedIcon('history');
export const ImageIcon = createNamedIcon('image');
export const InsertPageIcon = createNamedIcon('insert-page');
export const LocalDeviceIcon = createNamedIcon('local-device');
export const MicIcon = createNamedIcon('mic');
export const MoreHorizontalIcon = createNamedIcon('more-horizontal');
export const NotchIcon = createNamedIcon('notch');
export const PageScanIcon = createNamedIcon('page-scan');
export const PageIcon = createNamedIcon('page');
export const PlusIcon = createNamedIcon('plus');
export const QuoteIcon = createNamedIcon('quote');
export const RetryIcon = createNamedIcon('retry');
export const SearchIcon = createNamedIcon('search');
export const SendIcon = createNamedIcon('send');
export const ShieldIcon = createNamedIcon('shield');
export const SidePanelIcon = createNamedIcon('side-panel');
export const SideRailIcon = createNamedIcon('side-rail');
export const SlidersIcon = createNamedIcon('sliders');
export const SparkTrendIcon = createNamedIcon('spark-trend');
export const StopIcon = createNamedIcon('stop');
export const TabStackIcon = createNamedIcon('tab-stack');
export const ThemeIcon = createNamedIcon('theme');
export const ThinkIcon = createNamedIcon('think');
export const ThumbDownIcon = createNamedIcon('thumb-down');
export const ThumbUpIcon = createNamedIcon('thumb-up');
export const TrashIcon = createNamedIcon('trash');
export const TurboIcon = createNamedIcon('turbo');
export const UndoIcon = createNamedIcon('undo');
export const UploadIcon = createNamedIcon('upload');
export const VolumeIcon = createNamedIcon('volume');
export const XIcon = createNamedIcon('x');
