# MOD Pizza — Mobile App Prototype (iOS & Android)

Same features as the web prototype, presented as a native-style app: splash screen, first-launch onboarding, simulated location and notification permissions, app bar with back navigation, bottom tabs, floating “View cart” bar, bottom sheets, push-style order alerts, Android haptics, and iOS/Android styling.

## Run

Serve the parent folder and open the preview:

```
cd ..            # the MOD-Web-App-Redesign-New folder
python3 -m http.server 8080
# desktop: http://localhost:8080/mobile-app/            (device frame, iOS/Android toggle)
# phone:   http://<your-computer-ip>:8080/mobile-app/app.html   (then Add to Home Screen)
```

- `index.html` — device preview with platform toggle, relaunch, replay onboarding, test notification.
- `app.html` — the app itself (what a store build packages). Add `?platform=ios` or `?platform=android` to force a style.
- Demo data is stored separately from the website (`modapp.v1.` keys).

## Files

`css/styles.css` and `js/{data,core,ui,views,builder,app}.js` are the shared prototype engine (same as the website).
`css/app-native.css` and `js/native.js` add the app shell. `manifest.webmanifest` and `icons/` provide install icons.

## Toward App Store / Play Store builds

This is a prototype, not a store-ready binary. A common path is to wrap `app.html` with Capacitor:

```
npm i @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android
npx cap init "MOD Pizza" com.example.modpizza --web-dir mobile-app
npx cap add ios && npx cap add android
npx cap open ios      # Xcode → run / archive
npx cap open android  # Android Studio → run / bundle
```

Before submission you would replace the simulations with real services: sign-in, payments (Apple Pay / Google Pay SDKs and a payment gateway), push notifications (APNs / FCM), location, order and loyalty APIs, plus privacy labels, accessibility review and store listings.
