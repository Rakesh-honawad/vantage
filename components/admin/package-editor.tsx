'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, useTransition } from 'react'
import { Btn } from '@/components/site/btn'
import { duplicatePackage, publishPackage, restoreVersion, saveDraft, schedulePackage, type ActionResult } from '@/app/admin/packages/actions'
import { diffPackages } from '@/lib/package-diff'
import { publishIssues, slugify } from '@/lib/package-rules'
import { MONTH_NAMES, PRICE_BASIS, findSeasonOverlaps, hasPricingGap } from '@/lib/pricing'
import { timeAgo } from '@/lib/format'
import type { PackageContent, PackageStatus } from '@/lib/types'

export type EditorPackage = { id: string; code: string; status: PackageStatus; publishAt: string | null; publishedVersionId: string | null; draft: PackageContent }
export type EditorVersion = { id: string; versionNo: number; content: PackageContent; note: string | null; createdAt: string; author: string | null }
type Tab = 'basics' | 'itinerary' | 'pricing' | 'photos'
const TABS: [Tab, string][] = [['basics', 'Basics'], ['itinerary', 'Itinerary'], ['pricing', 'Pricing'], ['photos', 'Photos']]
const MEALS = ['Breakfast', 'Lunch', 'Dinner'] as const

function LinesField({ label, value, onChange, help }: { label: string; value: string[]; onChange: (v: string[]) => void; help?: string }) {
  const [raw, setRaw] = useState(value.join('\n'))
  return (
    <label className="fld">
      {label}
      <textarea rows={Math.max(3, value.length + 1)} value={raw} onChange={(e) => { setRaw(e.target.value); onChange(e.target.value.split('\n').map((s) => s.trim()).filter(Boolean)) }} />
      {help && <small>{help}</small>}
    </label>
  )
}

const move = <T,>(arr: T[], i: number, d: number): T[] => {
  const j = i + d
  if (j < 0 || j >= arr.length) return arr
  const next = [...arr]
  ;[next[i], next[j]] = [next[j], next[i]]
  return next
}

export function PackageEditor({ pkg, versions }: { pkg: EditorPackage; versions: EditorVersion[] }) {
  const router = useRouter()
  const [c, setC] = useState<PackageContent>(pkg.draft)
  const [saved, setSaved] = useState(JSON.stringify(pkg.draft))
  const [tab, setTab] = useState<Tab>('basics')
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [pending, start] = useTransition()
  const [drawer, setDrawer] = useState(false)
  const [note, setNote] = useState('')
  const [when, setWhen] = useState('')
  const [photo, setPhoto] = useState('')
  const [slugTouched, setSlugTouched] = useState(!c.slug.startsWith('untitled'))
  const publishRef = useRef<HTMLDialogElement>(null)
  const scheduleRef = useRef<HTMLDialogElement>(null)

  const everPublished = versions.length > 0
  const dirty = JSON.stringify(c) !== saved
  const issues = publishIssues(c)
  const overlaps = findSeasonOverlaps(c.seasons)

  useEffect(() => {
    if (!dirty) return
    const h = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', h)
    return () => window.removeEventListener('beforeunload', h)
  }, [dirty])

  const set = <K extends keyof PackageContent>(k: K, v: PackageContent[K]) => setC((p) => ({ ...p, [k]: v }))
  const setDay = (i: number, patch: Partial<PackageContent['itinerary'][number]>) => set('itinerary', c.itinerary.map((d, n) => (n === i ? { ...d, ...patch } : d)))
  const setSeason = (i: number, patch: Partial<PackageContent['seasons'][number]>) => set('seasons', c.seasons.map((s, n) => (n === i ? { ...s, ...patch } : s)))
  const setHotel = (i: number, patch: Partial<PackageContent['hotels'][number]>) => set('hotels', c.hotels.map((h, n) => (n === i ? { ...h, ...patch } : h)))

  function run(action: () => Promise<ActionResult>, after?: () => void) {
    start(async () => {
      const r = await action()
      setMsg({ ok: r.ok, text: r.ok ? r.message ?? 'Done.' : r.error })
      if (r.ok) after?.()
    })
  }
  const onSave = () => {
    if (!dirty) return setMsg({ ok: true, text: 'No changes to save.' })
    run(() => saveDraft(pkg.id, c), () => setSaved(JSON.stringify(c)))
  }
  const onPublish = () => run(() => publishPackage(pkg.id, c, note), () => { publishRef.current?.close(); setNote(''); setSaved(JSON.stringify(c)); router.refresh() })
  const onSchedule = () => run(() => schedulePackage(pkg.id, c, new Date(when).toISOString()), () => { scheduleRef.current?.close(); setSaved(JSON.stringify(c)); router.refresh() })
  const onRestore = (v: EditorVersion) => {
    if (!confirm(`Restore version ${v.versionNo} into the draft? Your current draft will be replaced. Nothing goes live until you publish.`)) return
    run(() => restoreVersion(v.id), () => { setDrawer(false); router.refresh() })
  }
  const addPhoto = () => {
    const u = photo.trim()
    if (!/^(\/|https:\/\/)[^\s"'()<>]+$/.test(u)) return setMsg({ ok: false, text: 'Use a full https:// link or a /path for the photo.' })
    set('gallery', [...c.gallery.filter((x) => x !== u), u])
    if (!c.coverImage) set('coverImage', u)
    setPhoto('')
  }
  const photos = [...new Set([c.coverImage, ...c.gallery].filter(Boolean))]

  return (
    <div className="editor">
      <div className="editor-bar">
        <div className="editor-id">
          <span className="eyebrow">{c.code} &middot; <span className={`status ${pkg.status}`}>{pkg.status}</span></span>
          <h1>{c.title || 'Untitled package'}</h1>
          <small className="save-state" aria-live="polite">
            {pending ? 'Working' : dirty ? 'Unsaved changes' : 'All changes saved'}
            {pkg.publishAt ? ` \u00b7 goes live ${new Date(pkg.publishAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}` : ''}
          </small>
        </div>
        <div className="editor-actions">
          <Btn outline onClick={() => setDrawer(true)}>History</Btn>
          <Link className="btn btn-outline" href={`/preview/${pkg.id}`} target="_blank" rel="noopener">Preview</Link>
          <Btn outline onClick={() => start(() => duplicatePackage(pkg.id))} disabled={pending}>Duplicate</Btn>
          <Btn outline onClick={onSave} disabled={pending || !dirty}>Save draft</Btn>
          <Btn outline onClick={() => scheduleRef.current?.showModal()} disabled={pending}>Schedule</Btn>
          <Btn onClick={() => publishRef.current?.showModal()} disabled={pending}>Publish</Btn>
        </div>
      </div>
      {dirty && <p className="note editor-hint">Save the draft before opening Preview, so it shows your latest changes.</p>}
      {msg && <p className={msg.ok ? 'editor-msg' : 'form-error editor-msg'} role={msg.ok ? 'status' : 'alert'}>{msg.text}</p>}

      <div className="editor-tabs" role="tablist">
        {TABS.map(([k, label]) => <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? 'active' : ''} onClick={() => setTab(k)}>{label}</button>)}
      </div>

      {tab === 'basics' && (
        <div className="editor-panel">
          <label className="fld">Package name
            <input value={c.title} onChange={(e) => { set('title', e.target.value); if (!pkg.publishedVersionId && !slugTouched) set('slug', slugify(e.target.value)) }} />
          </label>
          <label className="fld">Web address
            <input value={c.slug} readOnly={!!pkg.publishedVersionId} onChange={(e) => { setSlugTouched(true); set('slug', slugify(e.target.value)) }} />
            <small>{pkg.publishedVersionId ? 'Locked once a package is published, so links keep working.' : `Shown as /packages/${c.slug || '...'}`}</small>
          </label>
          <label className="fld">Short summary<textarea rows={3} value={c.summary} onChange={(e) => set('summary', e.target.value)} /><small>Shown under the heading and in search results.</small></label>
          <div className="grid2">
            <label className="fld">Label on the card<input value={c.tag} onChange={(e) => set('tag', e.target.value)} placeholder="For example: Most loved" /></label>
            <label className="fld">Hotel stars
              <select value={c.hotelStars} onChange={(e) => set('hotelStars', Number(e.target.value))}>{[3, 4, 5].map((n) => <option key={n} value={n}>{n} star</option>)}</select>
            </label>
          </div>
          <LinesField label="Places visited" value={c.destinations} onChange={(v) => set('destinations', v)} help="One place per line, in travel order. Known places appear on the route map." />
          <LinesField label="What is included" value={c.inclusions} onChange={(v) => set('inclusions', v)} help="One item per line." />
          <LinesField label="What is not included" value={c.exclusions} onChange={(v) => set('exclusions', v)} help="One item per line." />
          <fieldset className="fld"><legend>Hotels</legend>
            {c.hotels.map((h, i) => (
              <div className="card-row" key={i}>
                <input aria-label="Hotel name" placeholder="Hotel name" value={h.name} onChange={(e) => setHotel(i, { name: e.target.value })} />
                <input aria-label="City" placeholder="City" value={h.city} onChange={(e) => setHotel(i, { city: e.target.value })} />
                <select aria-label="Stars" value={h.stars} onChange={(e) => setHotel(i, { stars: Number(e.target.value) })}>{[3, 4, 5].map((n) => <option key={n} value={n}>{n} star</option>)}</select>
                <button type="button" className="link-btn" onClick={() => set('hotels', c.hotels.filter((_, n) => n !== i))}>Remove</button>
              </div>
            ))}
            <button type="button" className="link-btn" onClick={() => set('hotels', [...c.hotels, { name: '', city: '', stars: c.hotelStars }])}>Add a hotel</button>
          </fieldset>
          <label className="fld">Changes and cancellation<textarea rows={3} value={c.cancellationNote} onChange={(e) => set('cancellationNote', e.target.value)} /></label>
        </div>
      )}

      {tab === 'itinerary' && (
        <div className="editor-panel">
          <p className="note">{c.itinerary.length} {c.itinerary.length === 1 ? 'day' : 'days'}. Day numbers and the length of the trip update on their own.</p>
          {c.itinerary.map((d, i) => (
            <div className="day-card" key={i}>
              <div className="day-card-head">
                <strong>Day {i + 1}</strong>
                <span>
                  <button type="button" className="link-btn" onClick={() => set('itinerary', move(c.itinerary, i, -1))} disabled={i === 0}>Move up</button>
                  <button type="button" className="link-btn" onClick={() => set('itinerary', move(c.itinerary, i, 1))} disabled={i === c.itinerary.length - 1}>Move down</button>
                  <button type="button" className="link-btn" onClick={() => set('itinerary', c.itinerary.filter((_, n) => n !== i))} disabled={c.itinerary.length === 1}>Remove</button>
                </span>
              </div>
              <label className="fld">Title<input value={d.title} onChange={(e) => setDay(i, { title: e.target.value })} /></label>
              <label className="fld">What happens<textarea rows={3} value={d.description} onChange={(e) => setDay(i, { description: e.target.value })} /></label>
              <div className="grid2">
                <label className="fld">Where you stay<input value={d.stay} onChange={(e) => setDay(i, { stay: e.target.value })} placeholder="For example: Munnar" /></label>
                <fieldset className="fld meals"><legend>Meals</legend>
                  {MEALS.map((m) => (
                    <label key={m} className="check"><input type="checkbox" checked={d.meals.includes(m)} onChange={(e) => setDay(i, { meals: e.target.checked ? [...d.meals, m] : d.meals.filter((x) => x !== m) })} /> {m}</label>
                  ))}
                </fieldset>
              </div>
            </div>
          ))}
          <button type="button" className="link-btn" onClick={() => set('itinerary', [...c.itinerary, { day: c.itinerary.length + 1, title: '', description: '', stay: '', meals: ['Breakfast', 'Dinner'] }])}>Add a day</button>
        </div>
      )}

      {tab === 'pricing' && (
        <div className="editor-panel">
          <p className="note">Every price is shown to travellers as {PRICE_BASIS}.</p>
          {c.seasons.map((s, i) => (
            <div className="card-row season-row" key={i}>
              <label className="fld">Season name<input value={s.name} onChange={(e) => setSeason(i, { name: e.target.value })} /></label>
              <label className="fld">From<select value={s.fromMonth} onChange={(e) => setSeason(i, { fromMonth: Number(e.target.value) })}>{MONTH_NAMES.map((m, n) => <option key={m} value={n + 1}>{m}</option>)}</select></label>
              <label className="fld">To<select value={s.toMonth} onChange={(e) => setSeason(i, { toMonth: Number(e.target.value) })}>{MONTH_NAMES.map((m, n) => <option key={m} value={n + 1}>{m}</option>)}</select></label>
              <label className="fld">Price per person (INR)<input type="number" min={0} step={100} value={s.pricePerPerson || ''} onChange={(e) => setSeason(i, { pricePerPerson: Math.round(Number(e.target.value)) || 0 })} /></label>
              <button type="button" className="link-btn" onClick={() => set('seasons', c.seasons.filter((_, n) => n !== i))}>Remove</button>
            </div>
          ))}
          <button type="button" className="link-btn" onClick={() => set('seasons', [...c.seasons, { name: '', fromMonth: 1, toMonth: 12, pricePerPerson: 0 }])}>Add a season</button>
          {overlaps.map(([a, b]) => <p key={a + b} className="form-error" role="alert">{a} and {b} share the same months. Change the dates so seasons do not overlap.</p>)}
          {c.seasons.length > 0 && overlaps.length === 0 && hasPricingGap(c) && <p className="note">Some months have no season. Travellers will be asked to enquire for those months.</p>}
        </div>
      )}

      {tab === 'photos' && (
        <div className="editor-panel">
          <p className="note">The first photo is the cover. Paste a full https:// link. Uploading from your computer comes in a later version.</p>
          <div className="photo-grid">
            {photos.map((u, i) => (
              <figure key={u}>
                <div className="photo-thumb" style={{ backgroundImage: `url(${u})` }} />
                <figcaption>{i === 0 ? 'Cover' : <button type="button" className="link-btn" onClick={() => { set('coverImage', u); set('gallery', [u, ...c.gallery.filter((x) => x !== u)]) }}>Make cover</button>}
                  <button type="button" className="link-btn" onClick={() => { const rest = photos.filter((x) => x !== u); set('coverImage', rest[0] ?? ''); set('gallery', rest) }}>Remove</button>
                </figcaption>
              </figure>
            ))}
          </div>
          <div className="card-row">
            <input aria-label="Photo link" placeholder="https://..." value={photo} onChange={(e) => setPhoto(e.target.value)} />
            <Btn outline onClick={addPhoto}>Add photo</Btn>
          </div>
        </div>
      )}

      <dialog ref={publishRef} className="dialog">
        <h2>Publish this package?</h2>
        {issues.length > 0 ? (
          <><p>Fix these first:</p><ul>{issues.map((x) => <li key={x}>{x}</li>)}</ul></>
        ) : (
          <p>This makes the current draft the live page{pkg.status === 'published' ? ' and replaces the version travellers see now' : ''}. Version {versions.length + 1} will be saved so you can restore it later.</p>
        )}
        <label className="fld">What changed? (optional)<input value={note} maxLength={200} onChange={(e) => setNote(e.target.value)} placeholder="For example: Raised the monsoon price" /></label>
        <div className="dialog-actions"><Btn outline onClick={() => publishRef.current?.close()}>Cancel</Btn><Btn onClick={onPublish} disabled={pending || issues.length > 0}>Publish</Btn></div>
      </dialog>

      <dialog ref={scheduleRef} className="dialog">
        <h2>Schedule publishing</h2>
        <p>{everPublished ? 'The live page keeps showing the current version until this time.' : 'The package stays hidden until this time.'}</p>
        {issues.length > 0 && <ul>{issues.map((x) => <li key={x}>{x}</li>)}</ul>}
        <label className="fld">Go live on<input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} /></label>
        <div className="dialog-actions"><Btn outline onClick={() => scheduleRef.current?.close()}>Cancel</Btn><Btn onClick={onSchedule} disabled={pending || !when || issues.length > 0}>Schedule</Btn></div>
      </dialog>

      {drawer && (
        <>
          <div className="drawer-scrim" onClick={() => setDrawer(false)} />
          <aside className="drawer" aria-label="Version history">
            <div className="drawer-head"><h2>Version history</h2><button type="button" className="link-btn" onClick={() => setDrawer(false)}>Close</button></div>
            {versions.length === 0 && <p className="note">Nothing has been published yet. Each publish saves a version here.</p>}
            {versions.map((v, i) => (
              <div className="version" key={v.id}>
                <div className="version-head">
                  <strong>Version {v.versionNo}</strong>
                  {v.id === pkg.publishedVersionId && <span className="live">Live</span>}
                </div>
                <small>{timeAgo(v.createdAt)} &middot; {v.author ?? 'Scheduled publish'}{v.note ? ` \u00b7 ${v.note}` : ''}</small>
                <ul>{diffPackages(versions[i + 1]?.content ?? null, v.content).map((l) => <li key={l}>{l}</li>)}</ul>
                <button type="button" className="link-btn" onClick={() => onRestore(v)} disabled={pending}>Restore to draft</button>
              </div>
            ))}
          </aside>
        </>
      )}
    </div>
  )
}
