# Publishing Hourline on Google Play

A step-by-step guide to getting Hourline (`com.hourline.app`) from this repo onto the Google Play Store.
Store graphics are ready in [`marketing/play/`](../marketing/play) — see [`marketing/README.md`](../marketing/README.md).

> Facts below were checked on 2026-10-14. Google changes Play Console rules often — if a screen looks different,
> trust the Play Console Help links over this guide.

---

## 0. What's already done in the repo

| Requirement | Status |
|---|---|
| App name / ID | **Hourline**, `com.hourline.app` (permanent once uploaded) |
| Target API level | `targetSdkVersion 36` (Android 16) — meets the requirement for new apps from 31 Aug 2026 |
| Release minification | R8 + resource shrinking on (`expo-build-properties` in `app.json`) |
| App icon | Adaptive + themed (monochrome) icon in `assets/images/`, 512×512 store icon in `marketing/play/` |
| Build profiles | `eas.json`: `development`, `preview` (APK), `production` (AAB, auto-increments `versionCode`) |
| Data collected | None — everything stays on the device (see [privacy policy](./privacy-policy.md)) |

---

## 1. Accounts you need (one-time)

1. **Google Play Console developer account** — <https://play.google.com/console/signup>
   - One-time US$25 registration fee.
   - Choose **Personal** or **Organization**. Organization needs a D-U-N-S number but skips the testing rule in step 6.
   - Complete identity verification (name, address, phone, ID). Approval can take a few days.
2. **Expo account** (free) — <https://expo.dev/signup>, used by EAS to build and sign the app in the cloud.

---

## 2. Link the project to EAS

From the project folder:

```bash
npx eas-cli@latest login          # your Expo account
npx eas-cli@latest init           # creates the EAS project and writes its id into app.json
```

Commit the `app.json` change `eas init` makes.

---

## 3. Build the release bundle (AAB)

```bash
npx eas-cli@latest build --platform android --profile production
```

- First run asks to **generate a new Android keystore** — answer **yes**. EAS stores it securely; this is your
  *upload key*. Never lose access to the Expo account that holds it.
- The build runs in the cloud (~10–20 min) and ends with a link to download the `.aab`.
- `versionCode` increases automatically on each production build (`autoIncrement` + `appVersionSource: remote`).
  Bump the user-facing `version` in `app.json` (e.g. `1.0.0` → `1.1.0`) yourself for each release.

Want to try the release build on your phone first? Build an installable APK instead:

```bash
npx eas-cli@latest build --platform android --profile preview
```

---

## 4. Create the app in Play Console

1. Play Console → **Create app**.
2. App name: `Hourline` · Default language: English (United States) · App or game: **App** · Free or paid: **Free**.
   (A free app can never be changed to paid later.)
3. Accept the declarations and create.

---

## 5. Fill in the store listing and app content

### 5a. Main store listing (Grow → Store presence → Main store listing)

| Field | Value (copy-paste) |
|---|---|
| App name (max 30) | `Hourline: World Clock & DST` |
| Short description (max 80) | `World clock & time zone converter that gets daylight saving right, every time.` |
| Full description (max 4000) | see below |
| App icon | `marketing/play/icon-512.png` (512×512) |
| Feature graphic | `marketing/play/feature-graphic.png` (1024×500) |
| Phone screenshots | `marketing/play/phone-1-home.png` … `phone-7-setup.png` (1080×1920, upload in this order) |
| Category | Tools (or Productivity) |
| Contact email | your support email (shown publicly) |

**Full description:**

```
Hourline is a beautiful world clock and time zone converter that gets daylight saving right — everywhere, every time.

EVERY CITY AT A GLANCE
See the time in all your cities, how far ahead or behind they are, and who is on daylight saving right now.

TRAVEL THROUGH TIME
Drag the dial or tap a day to see any moment in the future or the past. When clocks change in between, Hourline tells you — like "London · DST ended" — and adjusts every city automatically.

FIND THE HOUR THAT WORKS
The hour grid shows work, free and sleep hours for every city side by side, and picks the best overlap for meetings.

CONVERT ANY TIME
Pick a date and time in one city and see it everywhere, including UTC. Swap cities in one tap. If you pick a time that's skipped when clocks spring forward, Hourline warns you instead of guessing silently.

NEVER MISS A CLOCK CHANGE
Hourline shows exactly when the next clock change happens for your cities, what time it happens, and how the gap between cities changes afterwards.

ACCURATE BY DESIGN
• Ships its own up-to-date time zone rules, so every phone gives the same answer
• Handles half-hour and 45-minute time zones, southern-hemisphere daylight saving and the international date line
• Checked against hundreds of real-world cases
• 2,200+ cities and every time zone, searchable offline

YOURS, PRIVATELY
No account, no ads, no tracking. Your cities and settings stay on your phone.

Light and dark themes, 12- or 24-hour clock.
```

### 5b. App content (Policy → App content)

Answer each section — Play won't let you publish until all are complete:

| Section | Answer for Hourline |
|---|---|
| **Privacy policy** | `https://hourline.adevtutorials.in/privacy` (source: [`site/privacy/index.html`](../site/privacy/index.html); redeploy with `cd site && npx vercel deploy --prod`) |
| **App access** | All functionality available without special access (no login) |
| **Ads** | No, the app does not contain ads |
| **Content rating** | Start questionnaire → category **Utility, Productivity, Communication, or Other** → answer **No** to every content question → rating will be *Everyone / PEGI 3* |
| **Target audience** | **13 and over** (or 18+). Including under-13 ages pulls the app into the Families policy with extra requirements |
| **News app** | No |
| **Data safety** | Does your app collect or share any of the required user data types? → **No**. Data encrypted in transit → not applicable. Users can request deletion → not applicable (uninstalling removes everything) |
| **Government app / Financial features / Health** | No / None / None |

---

## 6. Testing before production (personal accounts)

If your developer account is **personal and created after 13 Nov 2023**, Google requires a **closed test with at
least 12 testers opted in for 14 continuous days** before you can apply for production access.
Organization accounts skip this.

1. Testing → **Closed testing** → Create track (e.g. "Beta") → **Create new release**.
2. Upload the `.aab` from step 3 (or use `eas submit`, step 7). Release notes: `First beta of Hourline.`
3. Testers: sign-ups go through a **Google Group**, so nobody has to be added by hand.
   1. <https://groups.google.com> → **Create group** (e.g. `hourline-testers`). Who can search: *Anyone on the web*;
      who can join: *Anyone can join*; who can view members: *Group managers*.
   2. Play Console → Closed testing → **Testers** → *Google Groups* → add the group's email
      (e.g. `hourline-testers@googlegroups.com`) → Save.
   3. Share **<https://hourline.adevtutorials.in/#beta>**. It walks testers through joining the group, opting in at
      `https://play.google.com/apps/testing/com.hourline.app` and installing. The group link lives in the first
      step's button in [`site/index.html`](../site/index.html).
4. Each tester joins, opts in and installs from Play. The 14-day clock counts days with ≥12 opted-in testers.
5. Encourage testers to actually use the app and send feedback — Google reviews the test when you apply.
6. After 14 days: Dashboard → **Apply for production** → answer the questions about your test.

Even without this rule, run an **Internal testing** release first (up to 100 testers, available within minutes)
to check the store build on real phones.

---

## 7. Uploading builds

**Option A — upload by hand:** Play Console → the track → Create new release → drag in the `.aab`.

**Option B — `eas submit`** (configured in `eas.json` to upload to the *closed testing* track — `alpha` in the Play API — as a draft):

1. Play Console → Setup → API access → create a **Google Cloud service account** with the *Release manager*
   permission, download its JSON key. Keep it **out of git**.
2. Run:
   ```bash
   npx eas-cli@latest submit --platform android --profile production --path /path/to/hourline.aab
   ```
   and give the JSON key path when asked (or store it in EAS: `eas credentials`).

> The very first upload of a new app must be done **by hand** in Play Console; `eas submit` works from the second
> upload onward.

---

## 8. Go live

1. Testing → (your track) → promote the tested release, or Production → **Create new release** → add the AAB.
2. Countries/regions → **Add countries** (e.g. all).
3. **Review release** → **Start rollout to Production**. Consider a staged rollout (e.g. 20%) for the first version.
4. Google's review typically takes from a few hours to several days for new apps. You'll get an email when it's live.

---

## 9. Releasing updates

```bash
# 1. bump "version" in app.json (e.g. 1.0.0 → 1.0.1)
# 2. make sure the timeanddate cross-check still passes
npx jest
# 3. build and upload
npx eas-cli@latest build --platform android --profile production
npx eas-cli@latest submit --platform android --profile production --latest
```

**Time zone rule updates:** when countries change their clocks (e.g. Morocco in 2026), update
`@formatjs/intl-datetimeformat`, run `npx jest` (the `tz-timeanddate` test must pass), and release as above.
Later, setting up EAS Update would let these JS-only updates reach users without a store review.

---

## Store asset checklist

- [ ] `icon-512.png` — 512×512 PNG
- [ ] `feature-graphic.png` — 1024×500, 24-bit PNG, no transparency ✔
- [ ] 2–8 phone screenshots — we have 7 at 1080×1920 (9:16), 24-bit, no transparency ✔
- [ ] Privacy policy URL reachable: https://hourline.adevtutorials.in/privacy
- [ ] Short + full description pasted
- [ ] Content rating, target audience, data safety, ads, app access completed

## References

- [App testing requirements for new personal developer accounts](https://support.google.com/googleplay/android-developer/answer/14151465)
- [Target API level requirements for Google Play apps](https://support.google.com/googleplay/android-developer/answer/11926878)
- [Add preview assets to showcase your app](https://support.google.com/googleplay/android-developer/answer/9866151)
- [EAS Build](https://docs.expo.dev/build/introduction/) · [EAS Submit for Android](https://docs.expo.dev/submit/android/)
