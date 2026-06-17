# Changing default phone app for texting

*2026-05-29T23:16:22.109510Z*

---


**HUMAN:**
How do I set my phones default phone to text now. Settings only shows the phone that's factory as an option which have never seen


**ASSISTANT:**
 You're asking about setting a **default phone app** (for calls) or **default SMS app** (for texting) — two separate settings. Which one?

Also, what phone and OS are you on? Android and iPhone handle this completely differently.


**HUMAN:**
Android moto 24


**ASSISTANT:**
 Got it. On Android (Moto), here's both:

**Default Phone App (calls)**
Settings > Apps > Default Apps > Phone App > pick yours

**Default SMS App (texting)**
Settings > Apps > Default Apps > SMS App > pick yours

If your app isn't showing up as an option, it's usually because it hasn't been granted the right permissions yet. Fix that first:

Settings > Apps > (your app) > Permissions > make sure Phone and SMS are both allowed

Then go back and try Default Apps again. It should show up now.

What app are you trying to set as default?


**ASSISTANT:**
 Good news — permissions look fine. Phone is allowed, that's what matters.

Two things I see that could be the issue:

**1. Call Logs is not allowed**
Tap Call Logs and allow it. Some Android versions require this before TextNow shows up as a default option.

**2. "Manage app if unused" is ON**
Turn that OFF. That setting strips permissions and can archive the app when it's not used constantly. That alone could be knocking it out of the defaults list.

After you do both of those, go back to:

Settings > Apps > Default Apps > Phone App

TextNow should appear as an option now.


**ASSISTANT:**
 Good. "Manage app if unused" is now OFF. And Call Logs is showing in the permissions list at the top so that's good too.

One thing jumps out though — **"Modify system settings: Not allowed"**

Tap that and enable it. That permission is specifically required for an app to register itself as a default dialer or SMS app on Android. Without it, the system won't offer it as an option.

After you allow that, try Default Apps again.


**HUMAN:**
Nope


**ASSISTANT:**
 Okay. Let's try forcing Android to prompt you directly.

Open the **TextNow app** itself and look for a prompt or banner inside the app that says something like "Set as default" or "Make TextNow your default phone app." TextNow usually triggers that dialog from inside the app on first setup.

If you don't see that, try this:

Go into TextNow > Settings (inside the app) > look for a "Default app" or "Set as default" option in there.

That route bypasses the Android settings path entirely and triggers the system dialog directly. Do you see anything like that inside the app?


**HUMAN:**
Nopr


**ASSISTANT:**
 Okay. Let's try the nuclear option.

**Clear TextNow's cache and data, then relaunch it.**

Settings > Apps > TextNow > Storage & cache > Clear cache, then Clear storage

That resets it to fresh install state. When you open it again it should run through setup and prompt you to set it as default right then.

Fair warning — you'll have to log back in. Do you know your TextNow login?
