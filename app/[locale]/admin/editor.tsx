"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

export default function Editor({ adminToken, initialLocale }: { adminToken: string; initialLocale: string }) {
  const router = useRouter();
  const [locale, setLocale] = useState<string>(initialLocale || "zh");
  const t = useTranslations("admin");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const contentRef = useRef<HTMLTextAreaElement | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [slugError, setSlugError] = useState<string>("");
  // editing state
  const [editingSlug, setEditingSlug] = useState<string>("");

  // Drafts state
  const [draftsLoading, setDraftsLoading] = useState(false);
  const [draftsError, setDraftsError] = useState<string>("");
  const [drafts, setDrafts] = useState<Array<{ title: string; slug: string; path: string; publishedAt?: string; updatedAt?: string }>>([]);

  const loadDrafts = async () => {
    setDraftsLoading(true);
    try {
      const res = await fetch(`/api/admin/drafts?locale=${encodeURIComponent(locale)}`, {
        headers: { "X-Admin-Token": adminToken },
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setDrafts(Array.isArray(data.drafts) ? data.drafts : []);
      setDraftsError("");
    } catch (e) {
      // ignore silently to avoid overwriting success message; log for debugging
      console.warn("loadDrafts failed", e);
      setDraftsError(t("loadDraftsFailed"));
    } finally {
      setDraftsLoading(false);
    }
  };

  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items || [];
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (it.kind === 'file') {
        const f = it.getAsFile();
        if (f && f.type.startsWith('image/')) {
          e.preventDefault();
          setMessage(t('uploadingImage'));
          try {
            const fd = new FormData();
            fd.append('file', f, f.name || 'paste.png');
            fd.append('locale', locale);
            const res = await fetch('/api/admin/upload', {
              method: 'POST',
              headers: { 'X-Admin-Token': adminToken },
              body: fd,
            });
            if (!res.ok) throw new Error(await res.text());
            const data = await res.json();
            const url = data.r2Url || data.url || data.path;
            // insert markdown at cursor
            const ta = contentRef.current;
            const md = `![image](${url})`;
            if (ta) {
              const start = ta.selectionStart || 0;
              const end = ta.selectionEnd || 0;
              const before = content.slice(0, start);
              const after = content.slice(end);
              const next = `${before}${md}${after}`;
              setContent(next);
              requestAnimationFrame(() => {
                ta.focus();
                const pos = start + md.length;
                ta.setSelectionRange(pos, pos);
              });
            } else {
              setContent((prev) => `${prev}\n\n${md}`);
            }
            setMessage(t('imageInserted'));
          } catch {
            setMessage(t('uploadImageFailed'));
          }
          return; // only handle the first image
        }
      }
    }
  };

  const publishEditingDraft = async () => {
    if (!editingSlug) return;
    setPublishing(true);
    setMessage("");
    try {
      const res = await fetch('/api/admin/drafts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': adminToken,
        },
        body: JSON.stringify({ locale, slug: editingSlug, action: 'publish' }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(data.error || t('publishFailed'));
      }
      const data = await res.json();
      if (data.url) router.push(data.url as string);
      else setMessage(`${t('successPrefix')}${data.path || editingSlug}`);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : t('publishFailed');
      setMessage(errorMessage);
    } finally {
      setPublishing(false);
    }
  };

  useEffect(() => {
    // Auto load drafts on mount and when locale changes
    loadDrafts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]);

  const validateSlug = (s: string): string | null => {
    if (!s) return t("slugEmpty");
    const okChars = /^[a-z0-9-]+$/;
    if (!okChars.test(s)) return t("slugCharset");
    if (s.startsWith("-") || s.endsWith("-")) return t("slugLeadingTrailingDash");
    return null;
  };

  const submit = async (e: React.FormEvent, draft: boolean) => {
    e.preventDefault();
    setMessage("");
    if (!title || !slug || !content) {
      setMessage(t("required"));
      return;
    }
    const err = validateSlug(slug);
    if (err) {
      setSlugError(err);
      setMessage(t("slugInvalid"));
      return;
    }
    setPublishing(true);
    try {
      const res = await fetch("/api/admin/publish", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Token": adminToken,
        },
        body: JSON.stringify({ locale, title, slug, summary, content, draft }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(data.error || `${draft ? t("draftFailed") : t("publishFailed")}: ${res.status}`);
      }
      const data = await res.json();
      if (draft) {
        setMessage(`${t("draftSuccessPrefix")}${data.path}`);
        // refresh drafts list after saving a draft
        loadDrafts();
      } else {
        setMessage(`${t("successPrefix")}${data.path}`);
        if (data.url) router.push(data.url as string);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setMessage(errorMessage);
    } finally {
      setPublishing(false);
    }
  };

  const loadDraftForEdit = async (slugToLoad: string) => {
    try {
      const res = await fetch(`/api/admin/drafts?locale=${encodeURIComponent(locale)}&slug=${encodeURIComponent(slugToLoad)}`, {
        headers: { "X-Admin-Token": adminToken },
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      const d = data.draft as { title: string; summary: string; content: string; slug: string };
      setTitle(d.title || "");
      setSummary(d.summary || "");
      setContent(d.content || "");
      const full = d.slug || slugToLoad;
      const leaf = (full.split('/').pop() || "").toLowerCase();
      setSlug(leaf);
      setEditingSlug(full);
      setMessage(t('loadedDraft'));
    } catch (e: unknown) {
      if (e instanceof Error) {
        setMessage(e.message || t('loadDraftFailed'));
      } else {
        setMessage(t('loadDraftFailed'));
      }
    }
  };

  const saveDraftEdits = async () => {
    if (!editingSlug) return;
    setPublishing(true);
    setMessage("");
    try {
      const res = await fetch('/api/admin/drafts', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': adminToken,
        },
        body: JSON.stringify({ locale, slug: editingSlug, title, summary, content }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(data.error || 'Failed');
      }
      setMessage(t('draftUpdated'));
      setEditingSlug(editingSlug); // stay in edit mode
      loadDrafts();
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : t('updateDraftFailed');
      setMessage(errorMessage);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="space-y-6">
    <form onSubmit={(e) => submit(e, false)} className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="text-sm text-muted-foreground">{t("locale")}</span>
          <select
            value={locale}
            onChange={(e) => setLocale(e.target.value)}
            className="border rounded px-2 py-1"
          >
            <option value="zh">zh</option>
            <option value="en">en</option>
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm text-muted-foreground">{t("slug")}</span>
          <input
            value={slug}
            onChange={(e) => {
              const v = e.target.value.toLowerCase();
              setSlug(v);
              setSlugError(validateSlug(v) || "");
            }}
            className="border rounded px-2 py-1 disabled:opacity-60"
            disabled={!!editingSlug}
            placeholder={t("slugPlaceholder")}
          />
          <span className="text-xs text-muted-foreground">{t("slugHelp")}</span>
          {slugError && <span className="text-xs text-red-600">{slugError}</span>}
        </label>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-sm text-muted-foreground">{t("titleLabel", { default: "Title" })}</span>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border rounded px-2 py-1"
          placeholder={t("titlePlaceholder")}
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm text-muted-foreground">{t("summary")}</span>
        <input
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          className="border rounded px-2 py-1"
          placeholder={t("summaryPlaceholder")}
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm text-muted-foreground">{t("content")}</span>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onPaste={handlePaste}
          ref={(el) => {
            contentRef.current = el;
          }}
          className="border rounded px-2 py-2 min-h-[300px] font-mono"
          placeholder={t("contentPlaceholder")}
        />
      </label>

      <div className="space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            disabled={publishing}
            onClick={(e) => {
              e.preventDefault();
              if (editingSlug) publishEditingDraft();
              else submit(e, false);
            }}
            className="h-9 px-4 rounded border bg-foreground text-background disabled:opacity-50 whitespace-nowrap"
          >
            {publishing ? t("publishing") : t("publish")}
          </button>
          <button
            type="button"
            disabled={publishing}
            onClick={(e) => {
              e.preventDefault();
              if (editingSlug) saveDraftEdits();
              else submit(e, true);
            }}
            className="h-9 px-4 rounded border bg-muted text-foreground disabled:opacity-50 whitespace-nowrap"
          >
            {publishing ? t("savingDraft") : t("saveDraft")}
          </button>
        </div>
        {message && <div className="text-sm text-muted-foreground break-words">{message}</div>}
      </div>
      {editingSlug && (
        <p className="text-xs text-muted-foreground flex items-center gap-2">
          {t('editingDraftNotice', { path: editingSlug })}
          <button
            type="button"
            disabled={publishing}
            onClick={() => {
              setEditingSlug("");
              setMessage("");
              setSlug("");
              setSlugError("");
            }}
            className="underline text-muted-foreground/80 hover:text-foreground"
          >
            {t('exitEdit')}
          </button>
        </p>
      )}
    </form>
    <DraftsSection
      locale={locale}
      adminToken={adminToken}
      t={t}
      drafts={drafts}
      draftsLoading={draftsLoading}
      draftsError={draftsError}
      onRefresh={loadDrafts}
      onPublished={() => loadDrafts()}
      onEdit={loadDraftForEdit}
    />
    </div>
  );
}

export function DraftsSection({
  locale,
  adminToken,
  t,
  drafts,
  draftsLoading,
  draftsError,
  onRefresh,
  onPublished,
  onEdit,
}: {
  locale: string;
  adminToken: string;
  t: ReturnType<typeof useTranslations>;
  drafts: Array<{ title: string; slug: string; path: string; publishedAt?: string; updatedAt?: string }>;
  draftsLoading: boolean;
  draftsError?: string;
  onRefresh: () => void;
  onPublished?: (slug: string) => void;
  onEdit?: (slug: string) => void;
}) {
  const router = useRouter();
  const publishDraft = async (slug: string) => {
    try {
      const res = await fetch('/api/admin/drafts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': adminToken,
        },
        body: JSON.stringify({ locale, slug, action: 'publish' }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(data.error || 'Failed');
      }
      const data = await res.json();
      if (onPublished) onPublished(slug);
      if (data.url) router.push(data.url);
    } catch {
      // noop: keep simple for now
    }
  };

  return (
    <section className="mt-8 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">{t('drafts')}</h2>
        <button type="button" onClick={onRefresh} className="h-8 px-3 rounded border">{t('refreshDrafts')}</button>
      </div>
      {draftsLoading ? (
        <p className="text-sm text-muted-foreground">{t('loadingDrafts')}</p>
      ) : drafts.length === 0 ? (
        <p className="text-sm text-muted-foreground">{draftsError || t('noDrafts')}</p>
      ) : (
        <ul className="space-y-2">
          {drafts.map((d) => (
            <li key={d.slug} className="flex items-center justify-between border rounded p-2 gap-2">
              <div className="min-w-0">
                <div className="font-medium truncate">{d.title}</div>
                <div className="text-xs text-muted-foreground truncate">{d.slug}</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {onEdit && (
                  <button type="button" className="h-8 px-3 rounded border" onClick={() => onEdit(d.slug)}>
                    {t('edit')}
                  </button>
                )}
                <button type="button" className="h-8 px-3 rounded border bg-foreground text-background" onClick={() => publishDraft(d.slug)}>
                  {t('publishDraft')}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {!!draftsError && drafts.length > 0 && (
        <p className="text-xs text-muted-foreground">{draftsError}</p>
      )}
    </section>
  );
}
