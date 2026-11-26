import { DocumentIcon, ImageIcon, UploadIcon, XIcon } from '../icons/ApertureIcon.js';

export interface AttachmentItem {
  id: string;
  name: string;
  kind?: 'image' | 'file';
  status?: 'ready' | 'uploading';
  progressPercent?: number;
}

export interface AttachmentStripProps {
  items: readonly AttachmentItem[];
  onRemove?: (id: string) => void;
}

/** Compact chip strip for queued documents and image attachments. */
export function AttachmentStrip({ items, onRemove }: AttachmentStripProps) {
  if (items.length === 0) return null;
  return (
    <div className="yui-attachment-strip">
      {items.map((item) => (
        <div key={item.id} className="yui-attachment-chip">
          {item.kind === 'image' ? <ImageIcon size={13} /> : <DocumentIcon size={13} />}
          <span>{item.name}</span>
          {item.status === 'uploading' && item.progressPercent !== undefined ? (
            <span className="yui-speed-readout">{item.progressPercent}%</span>
          ) : null}
          {onRemove ? (
            <button
              type="button"
              className="yui-icon-btn"
              aria-label={`Remove ${item.name}`}
              onClick={() => onRemove(item.id)}
            >
              <XIcon size={11} />
            </button>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export interface AttachmentDropzoneProps {
  active?: boolean;
  label?: string;
}

/** Drag-and-drop overlay feedback target for local documents and PDFs. */
export function AttachmentDropzone({
  active = false,
  label = 'Drop PDF, Markdown, CSV, or image to read locally',
}: AttachmentDropzoneProps) {
  return (
    <div className={active ? 'yui-dropzone is-active' : 'yui-dropzone'}>
      <UploadIcon size={15} className="yui-icon" />
      <span>{label}</span>
    </div>
  );
}
