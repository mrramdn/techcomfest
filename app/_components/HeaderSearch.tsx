"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type Scope = "recipes" | "articles" | "forum";

type SearchItem = {
  id: string;
  title: string;
  subtitle: string | null;
  image: string | null;
  href: string;
};

type SearchResponse = {
  recipes: SearchItem[];
  articles: SearchItem[];
  forum: SearchItem[];
};

const scopes: { key: Scope; label: string; icon: string }[] = [
  { key: "recipes", label: "Recipes", icon: "book_2" },
  { key: "articles", label: "Articles", icon: "auto_stories" },
  { key: "forum", label: "Forum", icon: "chat_bubble" },
];

function defaultScope(path: string): Scope {
  if (path.startsWith("/articles")) return "articles";
  if (path.startsWith("/forum")) return "forum";
  return "recipes";
}

export default function HeaderSearch({
  currentPath,
  onOpenChange,
}: {
  currentPath: string;
  onOpenChange?: (open: boolean) => void;
}) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const cacheRef = useRef<Map<string, SearchResponse>>(new Map());

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<Scope>(() => defaultScope(currentPath));
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SearchResponse>({ recipes: [], articles: [], forum: [] });

  useEffect(() => {
    const nextScope = defaultScope(currentPath);
    setScope((prev) => (prev === nextScope ? prev : nextScope));
  }, [currentPath]);

  useEffect(() => {
    onOpenChange?.(open);
  }, [onOpenChange, open]);

  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      const el = containerRef.current;
      if (!el) return;
      if (!el.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  const activeItems = useMemo(() => data[scope], [data, scope]);

  useEffect(() => {
    const q = query.trim();
    if (!open) return;
    if (q.length < 2) {
      setData({ recipes: [], articles: [], forum: [] });
      setLoading(false);
      return;
    }

    const cacheKey = `${scope}:${q.toLowerCase()}`;
    const cached = cacheRef.current.get(cacheKey);
    if (cached) {
      setData(cached);
      setLoading(false);
      return;
    }

    setLoading(true);
    const t = setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const res = await fetch(`/api/search?scope=${scope}&q=${encodeURIComponent(q)}&limit=6`, {
          signal: controller.signal,
        });
        if (!res.ok) {
          setLoading(false);
          return;
        }
        const json = (await res.json()) as SearchResponse;
        cacheRef.current.set(cacheKey, json);
        setData(json);
      } catch {
        // ignore aborted
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(t);
  }, [open, query, scope]);

  const go = (href: string) => {
    setOpen(false);
    setQuery("");
    router.push(href);
  };

  return (
    <div ref={containerRef} className="relative hidden md:block w-96">
      <div className="flex items-center gap-2 h-12 w-full pl-4 pr-3 bg-slate-100 rounded-lg border border-gray-200">
        <svg className="size-4 text-gray-400" viewBox="0 0 24 24" fill="none">
          <path
            d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        <input
          type="text"
          placeholder="Search..."
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!open) setOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
            if (e.key === "Enter" && activeItems[0]?.href) {
              e.preventDefault();
              go(activeItems[0].href);
            }
          }}
          className="flex-1 bg-transparent border-none outline-none text-sm text-gray-700 placeholder:text-gray-400"
        />
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="h-8 px-2 rounded-md hover:bg-white/60 text-gray-500 text-xs font-medium"
        >
          {scopes.find((s) => s.key === scope)?.label ?? scope}
        </button>
      </div>

      {open && (
        <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50">
          <div className="p-2 flex items-center gap-1 bg-slate-50 border-b border-gray-200">
            {scopes.map((s) => (
              <button
                key={s.key}
                type="button"
                onClick={() => setScope(s.key)}
                className={`h-9 px-3 rounded-lg flex items-center gap-1.5 text-sm transition-colors ${
                  scope === s.key ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <span className="material-symbols-outlined text-xl">{s.icon}</span>
                {s.label}
              </button>
            ))}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {query.trim().length < 2 ? (
              <div className="p-4 text-sm text-gray-500">Type at least 2 characters.</div>
            ) : loading ? (
              <div className="p-4 text-sm text-gray-500">Searching…</div>
            ) : activeItems.length === 0 ? (
              <div className="p-4 text-sm text-gray-500">No results.</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {activeItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => go(item.href)}
                    className="w-full text-left p-3 hover:bg-slate-50 transition-colors flex items-center gap-3"
                  >
                    <div className="relative size-10 rounded-lg overflow-hidden bg-slate-100 shrink-0 flex items-center justify-center">
                      {item.image ? (
                        <Image src={item.image} alt="" fill className="object-cover" unoptimized />
                      ) : (
                        <span className="material-symbols-outlined text-gray-400">search</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">{item.title}</div>
                      {item.subtitle ? <div className="text-xs text-gray-500 truncate">{item.subtitle}</div> : null}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
