# Hourline store graphics

## Upload to Google Play (Store presence → Main store listing)

| File | Play Console field | Spec |
|---|---|---|
| `play/icon-512.png` | App icon | 512×512 PNG |
| `play/feature-graphic.png` | Feature graphic | 1024×500, 24-bit PNG, no alpha |
| `play/phone-1-home.png` … `play/phone-7-setup.png` | Phone screenshots (in this order) | 1080×1920 (9:16), 24-bit PNG, no alpha |

## How they're made

- `raw/` — **real screenshots** of the app (development build on an Android emulator set to 1080×2160, density
  380, demo-mode status bar at 9:41). Nothing in them is mocked.
- `compose.html` — wraps each raw screenshot with a headline on a brand colour. Open
  `compose.html?f=<id>` in Chrome at a 1080×1920 viewport (`?f=feature` at 1024×500) and take a screenshot.
  Frame ids and copy are in the `FRAMES` object at the bottom of the file.
- Play rejects transparency in screenshots and feature graphics, so after exporting flatten them:
  ```bash
  node -e 'const s=require("sharp"),fs=require("fs");for(const f of fs.readdirSync("marketing/play").filter(f=>f.startsWith("phone")||f.startsWith("feature")))s("marketing/play/"+f).flatten({background:"#FBF6EC"}).removeAlpha().toBuffer().then(b=>fs.writeFileSync("marketing/play/"+f,b))'
  ```

## Retaking the raw screenshots

```bash
adb shell wm size 1080x2160 && adb shell wm density 380      # 2:1 so Play accepts it
adb shell settings put global sysui_demo_allowed 1
adb shell am broadcast -a com.android.systemui.demo -e command enter
adb shell am broadcast -a com.android.systemui.demo -e command clock -e hhmm 0941
adb shell am broadcast -a com.android.systemui.demo -e command battery -e level 100 -e plugged false
adb shell am broadcast -a com.android.systemui.demo -e command network -e mobile hide
adb shell am broadcast -a com.android.systemui.demo -e command network -e wifi show -e level 4 -e fully true
adb shell am broadcast -a com.android.systemui.demo -e command notifications -e visible false
# … use the app, then for each screen:
adb exec-out screencap -p > marketing/raw/<name>.png
# afterwards
adb shell wm size reset && adb shell wm density reset
adb shell am broadcast -a com.android.systemui.demo -e command exit
```

Turn off the dev client's floating **Tools button** (dev menu → Tools button) before capturing.
