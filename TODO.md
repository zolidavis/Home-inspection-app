# Inspect AI — TODO

Snapshot taken 2026-05-29.

## 🔥 Active

_(nothing — last active item, Google OAuth, was verified end-to-end on device 2026-05-29.)_

## ✅ Recently shipped

- [x] **`ANTHROPIC_API_KEY` live in prod** — verified end-to-end on deployment `inspect-ai-bfbmn5p5k`. Real Claude vision response on a test photo. Pipeline Mobile→Edge→R2→Claude→response works.
- [x] **Google OAuth on device** — APK `h5VmdNoMH37Atc4458pZxY` (build `82421226-…`, commit `084b62b`). Sign-in works first-shot on Android. Profile screen accessible from header avatar.

## ⏭ Short-term

### Vercel env vars

- [x] **`ANTHROPIC_API_KEY`** — set in production + development 2026-05-29 evening. Verified live: `/ai/analyze` returned a real Claude response on a test photo. Headline AI feature is now ACTIVE in prod.
- [ ] **`RENTCAST_API_KEY`** — optional. Currently empty; `/address/lookup` returns mocked owner + year built. App still works without real property data.
- [ ] **`R2_*` + `DATABASE_URL` + `ANTHROPIC_API_KEY` in preview env** — production + development are set, preview is empty. PR previews would fail until populated. Quick `vercel env add NAME preview` × 6.

### Stage 2 step 7

- [ ] **AcroForm fillable PDFs.** Current `/pdf/:id` is a layout-faithful summary. For carrier acceptance: embed the official OIR-B1-1802 fillable PDF and set field values via `pdf-lib`'s AcroForm setters. Highest-effort outstanding item (~4–6h).

### Pinned

- [ ] **Rotate `EXPO_TOKEN`** — pasted in chat earlier (prefix `MTpwJDaM…`). Revoke at https://expo.dev/accounts/zolidavis/settings/access-tokens, generate new, update GH secret on `zolidavis/Inspect-AI`.

## 📋 Backlog (real features, deferred)

- [ ] **Server-side auth.** `Inspection` rows are not yet tied to a user. Google OAuth provides `providerUserId`; server needs to validate the Google id_token, upsert a `users` row, then enforce `WHERE inspector_id = ?` on inspections. Mobile API client needs to attach a bearer token. (~3h)
- [ ] **Offline mode.** No `expo-sqlite` mirror + sync queue yet. Florida inspectors do field work in spotty cell coverage. (~4–6h)
- [ ] **County permit scrapers.** Miami-Dade, Broward, Hillsborough, Orange first. RentCast doesn't return permits reliably. (~1–2h per county)
- [ ] **Mobile API retry/queue.** `apps/mobile/lib/api.ts` is fire-and-forget. Photo uploads especially should retry on transient network failures.
- [ ] **iOS build.** Gated on Apple Developer Program ($99/yr). Touchpoints in CLAUDE.md.
- [ ] **Narrative PDF reports** beyond OIR-B1-1802 — photo grids, inspector signature, conditions summary.

## 🧹 Housekeeping / quality

- [ ] **Tests.** Zero coverage anywhere. A `vitest` smoke suite on the API routes would catch regressions.
- [ ] **Mobile error states.** Most failures bubble up as `Alert.alert("Failed", e.message)` — should be friendlier.
- [ ] **Empty states polish.** Inspection list with zero items is minimal.
- [ ] **Inspect AI app icon + splash.** Currently Expo default. Draft Buddy invested ~1h on PIL + cv2.grabCut to do the floating-mascot pattern.
- [ ] **Play Store listing assets.** Feature graphic, screenshots, description. Required before publishing.

---

## Most-bang-for-buck order for next session

1. Verify OAuth on device (5 min)
2. Add `ANTHROPIC_API_KEY` to Vercel (1 min once key is on hand)
3. End-to-end test: real photo upload from APK → R2 → `/ai/analyze` via Claude → review on suggestions screen
4. Rotate exposed `EXPO_TOKEN`
5. AcroForm PDF template (long-pole, biggest jump in real value)
