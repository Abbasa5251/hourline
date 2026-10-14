# Hourline release notes

Newest first. Each release has:

- **Google Play notes:** paste into Play Console → the release → *Release notes*. Play allows at most 500 characters per language.
- **Changes:** the full list, for this repo's history.

---

## 1.1.1 (versionCode 7) · 14 October 2026

Closed testing build. AAB: `build-output/hourline-1.1.1.aab` (not committed).

### Google Play notes

**First build your testers get** (1.1.0 was never uploaded, so use this one):

```
<en-US>
Welcome to the Hourline beta!

• World clock that gets daylight saving right, everywhere
• Swipe the week strip to any date. The month shows above it
• Drag the dial to travel through time; tap NOW to come back
• Compare cities hour by hour to find a meeting time
• Convert any time, including UTC
• Clock-change alerts for the next 30 days
• Haptic feedback on every tap
• Open source: github.com/Abbasa5251/hourline

Feedback: hello@adevtutorials.in
</en-US>
```

**Update from 1.1.0**, if testers already had it:

```
<en-US>
• Credits for the city data (GeoNames) and time zone rules (IANA) at the bottom of Settings
• Hourline is now open source: github.com/Abbasa5251/hourline

Thanks for testing! Feedback: hello@adevtutorials.in
</en-US>
```

### Changes since 1.1.0

**New**
- Settings shows credits for GeoNames (CC BY 4.0, required by its licence) and the IANA Time Zone Database, with links.

**Project**
- Open source under the MIT License, with a contributing guide.
- GitHub Actions runs lint, typecheck and tests on every pull request. `master` only accepts reviewed PRs that pass them.

---

## 1.1.0 (versionCode 6) · 14 October 2026

Built for closed testing but never uploaded: replaced by 1.1.1, and its AAB was deleted. Kept here for the history.

### Google Play notes

The first-beta welcome note, superseded by the 1.1.1 version above.

```
<en-US>
Welcome to the Hourline beta!

• World clock that gets daylight saving right, everywhere
• Swipe the week strip to any date, past or future. The month shows above it
• Drag the dial to travel through time; tap NOW to come back
• Compare cities hour by hour to find a meeting time
• Convert any time, including UTC
• Clock-change alerts for the next 30 days
• Haptic feedback on every tap

Found a bug or have an idea? Email hello@adevtutorials.in
</en-US>
```

### Changes since 1.0.0

**New**
- Swipeable week strip: move a week at a time into the past or future, with the month and year shown above.
- Haptic feedback on every button, tab and day, with lighter ticks on the dial and when swiping weeks.

**Improved**
- The clock-change card in Convert only appears when a change is within 30 days.
- Updated to the latest Expo SDK 57 patch releases.

---

## 1.0.0 (versionCode 4) · 14 October 2026

Built for closed testing but replaced by 1.1.0 before upload. First complete version of the app:
- World clock
- Time travel (dial and week strip)
- Compare
- Convert
- Onboarding
- Settings
- Light and dark themes
- Bundled IANA tzdb 2026e rules, cross-checked against timeanddate.com
