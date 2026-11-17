🇬🇧 **English** · 🇵🇹 [Português](README.pt.md)

# 🎅 Amigo Secreto — family Secret Santa

A web app for the family's Christmas Secret Santa: everyone joins on their phone, writes a wish list,
and the organiser runs the draw in the app. No accounts, no passwords, a single HTML file.

▶ **Try the demo:** https://diogoguedes0305.github.io/amigo-secreto/

<p align="center"><img src="docs/demo.gif" alt="Animated demo: joining, wish list, animated draw, your Secret Santa and memories" width="720"></p>
<p align="center"><sub>🎬 Animated demo · from sign-up to the draw</sub></p>

> The demo uses a **fictional family** (Ana, Bruno, Carla…) and stores everything **only in your browser**.
> Log in as the organiser with **Ana Ribeiro · 910 000 001**, or as someone else with 910 000 002 to 910 000 008.
> "👤 Trocar de pessoa" switches person and "↺ Repor" resets the demo. The app itself is in Portuguese.

## Features

- **Join without an account**: first name, last name and phone number. The phone becomes the person's key;
  if the same number signs in on another device, the organiser has to approve it.
- **🎲 Animated draw** (hat, paper slips, 3-2-1, confetti and sounds). Every phone sees the animation at the same time.
  Optional rules: nobody gets someone from the **same household** or the **same person as last year**.
- **👀 Your Secret Santa**, hidden until you tap "Ver".
- **📝 Wish list** (with links and notes). Your Secret Santa's list appears below their card.
- **⏳ Countdown** to the exchange day, gift budget and place.
- **📸 Memories**: one card per year with the photo album and "who gave to whom".
- **⚙️ Admin** (organiser only): Christmas phases, households, who has opened the app, who hasn't written a list yet,
  and a ready-to-send WhatsApp reminder.

## How it works

- `public/index.html` — the whole app (HTML, CSS and JavaScript, Firebase compat SDK).
- `public/config.js` — the Firebase config. With `null`, the app runs in **demo mode**.
- `public/demo-firebase.js` — mimics Firestore in `localStorage` with the fictional data (demo only).
- `firestore.rules` — rules open to the app's collections (meant for one family, no authentication).

### Use it with your family

1. Create a [Firebase](https://console.firebase.google.com) project with Firestore and Hosting.
2. Paste the project config into `public/config.js`.
3. Change `CODIGO_ADMIN` in `public/index.html`.
4. `firebase deploy`. After the organiser joins the app, put their id (`p` + phone number) in
   `config/geral.adminId` in the Firestore console.

> The Firestore rules are open: anyone with the link and the config can read and write.
> That's fine for a family; for something bigger, add Firebase Auth and per-user rules.

---
Made with the help of Claude. The names and numbers in the demo are fictional.
