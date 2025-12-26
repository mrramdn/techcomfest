"use client";

import { useRef } from "react";

type Props = {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
};

function wrapSelection(text: string, startTag: string, endTag: string, start: number, end: number) {
  const before = text.slice(0, start);
  const selected = text.slice(start, end);
  const after = text.slice(end);
  return `${before}${startTag}${selected || ""}${endTag}${after}`;
}

function replaceSelection(text: string, insert: string, start: number, end: number) {
  const before = text.slice(0, start);
  const after = text.slice(end);
  return `${before}${insert}${after}`;
}

function selectionToListItems(selected: string) {
  const lines = selected
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length === 0) return "<li></li>";
  return lines.map((l) => `<li>${l}</li>`).join("");
}

export default function RichTextTextarea({ value, onChange, placeholder, rows = 10, className }: Props) {
  const ref = useRef<HTMLTextAreaElement | null>(null);

  const apply = (fn: (text: string, start: number, end: number) => { next: string; cursor?: number }) => {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const { next, cursor } = fn(value, start, end);
    onChange(next);
    requestAnimationFrame(() => {
      const node = ref.current;
      if (!node) return;
      const pos = cursor ?? (start + 1);
      node.focus();
      node.setSelectionRange(pos, pos);
    });
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <ToolbarButton label="Bold" onClick={() => apply((t, s, e) => ({ next: wrapSelection(t, "<strong>", "</strong>", s, e), cursor: e + "<strong>".length + "</strong>".length }))} />
        <ToolbarButton label="Italic" onClick={() => apply((t, s, e) => ({ next: wrapSelection(t, "<em>", "</em>", s, e), cursor: e + "<em>".length + "</em>".length }))} />
        <ToolbarButton label="Underline" onClick={() => apply((t, s, e) => ({ next: wrapSelection(t, "<u>", "</u>", s, e), cursor: e + "<u>".length + "</u>".length }))} />
        <div className="w-px h-6 bg-gray-200 mx-1" />
        <ToolbarButton label="H2" onClick={() => apply((t, s, e) => ({ next: wrapSelection(t, "<h2>", "</h2>", s, e), cursor: e + "<h2>".length + "</h2>".length }))} />
        <ToolbarButton label="H3" onClick={() => apply((t, s, e) => ({ next: wrapSelection(t, "<h3>", "</h3>", s, e), cursor: e + "<h3>".length + "</h3>".length }))} />
        <div className="w-px h-6 bg-gray-200 mx-1" />
        <ToolbarButton
          label="Bullets"
          onClick={() =>
            apply((t, s, e) => {
              const selected = t.slice(s, e);
              const items = selectionToListItems(selected);
              const insert = `<ul>\n${items}\n</ul>`;
              return { next: replaceSelection(t, insert, s, e), cursor: s + insert.length };
            })
          }
        />
        <ToolbarButton
          label="Numbering"
          onClick={() =>
            apply((t, s, e) => {
              const selected = t.slice(s, e);
              const items = selectionToListItems(selected);
              const insert = `<ol>\n${items}\n</ol>`;
              return { next: replaceSelection(t, insert, s, e), cursor: s + insert.length };
            })
          }
        />
        <ToolbarButton
          label="Quote"
          onClick={() =>
            apply((t, s, e) => {
              const insert = wrapSelection(t, "<blockquote>", "</blockquote>", s, e);
              return { next: insert, cursor: e + "<blockquote>".length + "</blockquote>".length };
            })
          }
        />
        <ToolbarButton
          label="Link"
          onClick={() => {
            const url = prompt("Link URL (https://...)");
            if (!url) return;
            apply((t, s, e) => {
              const selected = t.slice(s, e) || "link text";
              const insert = `<a href="${url}" target="_blank" rel="noreferrer">${selected}</a>`;
              return { next: replaceSelection(t, insert, s, e), cursor: s + insert.length };
            });
          }}
        />
        <ToolbarButton
          label="Image"
          onClick={() => {
            const url = prompt("Image URL (https://...)");
            if (!url) return;
            apply((t, s, e) => {
              const insert = `<img src="${url}" alt="" />`;
              return { next: replaceSelection(t, insert, s, e), cursor: s + insert.length };
            });
          }}
        />
      </div>

      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className={className}
      />
    </div>
  );
}

function ToolbarButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-2 py-1 rounded-lg border border-gray-200 bg-white text-xs font-medium text-gray-700 hover:bg-gray-50"
    >
      {label}
    </button>
  );
}

