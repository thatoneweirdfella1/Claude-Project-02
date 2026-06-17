# Wyze cams not appearing in Tiny Cam Pro

*2026-02-18T21:55:40.007290Z*

---


**HUMAN:**
My wyze cams stopped showing up on tiny cam pro. Why?


**ASSISTANT:**

```
This block is not supported on your current device yet.
```


```
This block is not supported on your current device yet.
```

Found it. This is a **very recent, known issue** — January 2026. Here's the breakdown:

---

**What happened:**
A Wyze firmware update (version 4.52.9.5332 for Cam v4) broke TinyCam Pro compatibility. The cams work fine in the Wyze app, but TinyCam throws a "P2P failed to connect" error. Wyze Cam v4 was also quietly removed from TinyCam's official compatible devices list.

The new firmware included security upgrades that appear to be incompatible with how TinyCam connects.

---

**What model are your cams?** That matters because the fix differs slightly. But here's what applies to most people right now:

**Your options, in order of easiest to hardest:**

1. **Wait** — TinyCam's developer may push an update. Check the TinyCam subreddit (r/tinycam) to see if a fix is coming.

2. **Roll back your Wyze firmware** — Go back to the older firmware before the security update broke things. Instructions: https://support.wyze.com/hc/en-us/articles/360031490871

3. **Disable auto-updates on Wyze** — So this doesn't happen again once you roll back.

4. **Use the Wyze app as a workaround** in the meantime — You can set up a favorites group in the Wyze app to view multiple cams at once in landscape mode.

---

What Wyze cam models do you have? V3, V4, OG? That'll tell us if rollback is even possible for yours, because some cams can't be downgraded, and sometimes even ones that can be, there will be an update you get "stuck" at.


**HUMAN:**
Og


**ASSISTANT:**
 
```
This block is not supported on your current device yet.
```


```
This block is not supported on your current device yet.
```

Okay this is **super fresh info** — like, updated **today** (Feb 18, 2026). Here's exactly what's going on with your Wyze OG and TinyCam Pro:

---

**The Problem:**
TinyCam released update **18.0.3** which *just* added OG support — but there's a catch.

The OG cameras will produce a "Failed to initialize" error on Amazon Fire TV devices and Google TV because those devices run 32-bit Android, and there are no 32-bit libraries for OG cameras.

So the fix depends on **what device you're running TinyCam on.**

---

**Quick question first:** What device are you watching TinyCam on?

1. Amazon Fire TV Stick / Fire Stick
2. Android phone or tablet
3. Google TV / Chromecast
4. Something else

---

Because if it's a **Fire Stick**, that's the bad news — it's a known dead end right now with no fix yet. If it's an **Android phone or tablet**, the new TinyCam 18.0.3 update should actually fix it for you once it finishes rolling out.


**HUMAN:**
Gigabyte 55in monitor running what I think is Google os


**ASSISTANT:**
 
```
This block is not supported on your current device yet.
```

Yeah, that's the problem right there. Google TV runs on **32-bit Android** on most smart TVs — and that's exactly what TinyCam 18.0.3 just confirmed is broken for Wyze OG cameras.

Think of it like this: the new OG camera support requires 64-bit libraries, and Google TV devices are compiled against 32-bit Android — so the two literally can't shake hands. No 32-bit libraries exist for OG cameras in the new update. It's like trying to plug a USB-C cable into a USB-A port. The update exists, the support exists — just not **for your hardware architecture.**

---

**Here's the honest reality of your options right now:**

**Option 1 — Wait (no effort, no guarantee)**
The TinyCam developer is aware. It's possible a future update adds 32-bit OG support, but there's no timeline and no promise.

**Option 2 — Run TinyCam on an Android phone/tablet instead and cast to your TV**
1. Open TinyCam Pro on an Android phone or tablet (not Fire Stick, not Google TV)
2. Set up your OG cams there — it'll work fine on 64-bit Android
3. Cast the stream to your Gigabyte TV using screen mirroring or Chromecast

**Option 3 — Use the Wyze app directly on the TV**
Check if your Gigabyte TV has the Google Play Store. If it does:
1. Search for the **Wyze app** directly
2. Install it and log in
3. It won't be as slick as TinyCam's multi-cam grid, but it works

---

**Before I go further:** Does your Gigabyte TV have the Google Play Store available on it, or is it more of a basic smart TV with limited apps? That'll determine which option is actually doable for you.


**HUMAN:**
None of those work. Using the. On Chromecast means j can only view one st a time or it skips massively. And it's not compatible e eyze app


**ASSISTANT:**
 Understood — so you're stuck. Let me be straight with you:

**Right now, there is no working fix** for Wyze OG on Google TV / Chromecast in TinyCam. The 32-bit limitation is a dead end until the TinyCam developer pushes a new build with 32-bit OG library support, and there's no ETA on that.

---

**Your real options are:**

**Option 1 — Ditch TinyCam for a different multi-cam viewer that works on Google TV**
There are alternatives. The big one people switch to is **Alfred** or **IP Cam Viewer**. But honestly — Wyze OG's closed ecosystem makes ALL third-party apps a gamble.

**Option 2 — Replace the OG cams with something that actually plays nice with Google TV**
Wyze OG was always a pain with third-party apps. Cameras that use standard **RTSP** streams (like Reolink or Amcrest) work flawlessly with TinyCam on any device because they don't depend on Wyze's proprietary P2P cloud connection.

**Option 3 — Wait and monitor the TinyCam subreddit**
Go to **r/tinycam** on Reddit and follow the developer directly. He posts update previews there before anywhere else. That's your earliest warning system for when a fix drops.

---

Straight talk: **Option 2 is the permanent fix.** Wyze's ecosystem has been progressively locking out third-party apps with every security update. This won't get better — it'll keep happening. Reolink cameras are cheap, have native RTSP, and TinyCam loves them.

How many OG cams do you have?


**HUMAN:**
Sk j can't go to a previous version update w eyze?


**ASSISTANT:**
 For the Wyze OG specifically — **no, you can't downgrade.**
```
This block is not supported on your current device yet.
```


```
This block is not supported on your current device yet.
```


```
This block is not supported on your current device yet.
```

Here's the straight answer:

Wyze's official page says "For all other Wyze Cam devices not listed" — and the OG is not on the flashable list. Only specific models like the v4, Cam Outdoor, and Base Station support manual firmware flashing via SD card.

So **no — the Wyze OG cannot be downgraded.** It's not supported. You're locked to whatever firmware it's on.

---

**Here's where you actually stand, no sugar coating:**

The Wyze OG on Google TV is a dead end **right now** because:
- Can't downgrade firmware
- TinyCam 18.0.3 added OG support but broke it on 32-bit devices like Google TV
- No fix timeline from TinyCam developer

---

**The only real move you have** is watching **r/tinycam** on Reddit for when the developer drops a 32-bit fix. That's it. Everything else is a workaround that you've already told me doesn't work for you.

How many OG cams do you have and how long have you had them? Asking because if they're fairly new, you might still be able to return or exchange them for a camera model that actually cooperates — like a **Reolink** — and never deal with this headache again.
