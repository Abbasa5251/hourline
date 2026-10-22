# Hourline release notes

Newest first. Each release has:

- **Google Play notes:** paste into Play Console → the release → *Release notes*. Play allows at most 500 characters per language.
- **Changes:** the full list, for this repo's history.

---

## 1.1.2 (versionCode 9) · 22 October 2026

Closed testing build. AAB: `build-output/hourline-1.1.2.aab` (not committed). Built with `eas build --local` (the cloud build quota was used up; that failed attempt took versionCode 8). Download size 16.0–17.7 MB.

### Google Play notes

```
<en-US>
• Vancouver, Edmonton, Inuvik and Winnipeg show MST, CST and EST from 1 November, when BC, Alberta, the NWT and Manitoba stop changing clocks
• Time zone fixes and improvements

Thanks for testing! Feedback: hello@adevtutorials.in
</en-US>
```

### Changes since 1.1.1

**Fixes**
- Vancouver, Edmonton, Inuvik and Winnipeg are labelled MST, CST and EST from 1 November 2026, when British Columbia, Alberta, the Northwest Territories and Manitoba stop changing clocks. They no longer show "PST at UTC−7" or a DST badge. Offsets were already right (tzdb 2026e), and the labels match timeanddate.com.
- A time that happens twice when clocks fall back (1:30 AM on 1 November in Los Angeles) always converts to the first occurrence. Before, the answer depended on the season the app was opened in.
- Zone abbreviations and the DST badge now come from the bundled IANA data, so future rule changes relabel themselves. This also fixes labels for Havana, Chisinau, Beirut, Whitehorse, Istanbul before 2016, Manila (PHST), Coyhaique and Fiji, and the DST badge for Morocco and Egypt.

**Project**
- Every transition timeanddate.com lists for 76 major cities in 2010–2029 (1,781 changes, about 108,000 conversions around them) was compared against the app. The only differences are Lebanon's disputed March 2023 start and labels timeanddate has that tzdb doesn't (Paraguay, Samoa).

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
