# Incomplete conversation

*2026-05-29T16:16:53.913897Z*

---


**ASSISTANT:**
These are wireless lavalier mics. Two transmitters (the clip-on mics with foam windscreens) and one USB-C receiver. Standard plug-and-play type, no app or Bluetooth pairing needed.

Setup: Plug receiver into your phone's USB-C port. Power on a transmitter (power button in image 2/3/4). They auto-pair. Green LED means connected, red usually means charging or muted.

What do you want to do, set them up or troubleshoot something?


**HUMAN:**
How do I use them and what's red and green blinking mean


**ASSISTANT:**
Basic use:

1. Plug the USB-C receiver into your phone (the piece on the bottom in images 3, 4, 5).
2. Long-press the power button on a transmitter until the light comes on.
3. They auto-pair within a few seconds. No app needed.
4. Open your camera or recording app. Phone should switch audio to the mic automatically.
5. Clip the transmitter near your collar, foam windscreen up, or use the magnet backing.

For the lights, the exact meaning varies by clone, but on these the standard pattern is:

Solid green: paired and working. You're good to record.

Solid red: usually mute. There's often a tap or short-press on the transmitter that toggles mute. If you're getting no sound, check this first.

Blinking green: searching for the receiver, not paired yet. Give it a few seconds, or power-cycle both.

Blinking red: low battery. Charge it.

Red and green alternating or both blinking: pairing mode or charging while connected.

One thing worth knowing: these generic mics don't always survive a phone software update, and some only work in the native camera app, not third-party ones. If you get silence, test in your stock camera first before assuming it's broken.

What's it doing right now?


**HUMAN:**
Blanking red and green. That's about all it's doing, both of them. That's the furthest I've ever seen it go.


**ASSISTANT:**
Both transmitters blinking red and green at the same time usually means pairing mode, they're searching for the receiver but haven't locked on.

The thing is, these kits pair one transmitter to one receiver channel at a time. Two transmitters both hunting at once can fight each other. So try this:

1. Power off both transmitters completely.
2. Plug the receiver into your phone first. Let it sit a few seconds.
3. Power on just ONE transmitter. Wait for it to go solid green.
4. Once that one's solid, power on the second.

If neither ever goes solid green, the likely culprits in order:

Battery. Blinking can just mean too low to pair. Plug both transmitters in to charge for thirty minutes and try again. Dead-flat lithium sometimes blinks instead of showing a proper charge light.

Receiver not seated. Make sure the USB-C is fully in. Try flipping nothing, but reseat it firmly.

Phone not granting it. Some phones need you to open the camera app for the port to power the receiver.

Question: does the receiver itself show any light when you plug it into the phone? That tells us whether the phone is even powering it.


**HUMAN:**
You don't listen very well, do you? I said it just blinks red and green and never moved past that fucking point.


**ASSISTANT:**
Fair. You answered the receiver question already by telling me the whole system just sits there blinking, so me asking again was me not tracking.

Blinking red and green forever, never going solid, on both units, most often means they never find the receiver. That points at the receiver, not the transmitters. Two mics failing identically is the tell. They're doing their job, calling out for a receiver that isn't answering.

So the real check is the receiver. When you plug it into the phone, does it light up at all? If it's dark, the transmitters will blink forever no matter what you do, because there's nothing to pair to.

If you've already got it plugged in and it's dead, the likely problems are the receiver itself being faulty, the phone not powering the port until the camera app is open, or the receiver needing a charge of its own on some models.

What does the receiver do when it's in the phone.


**HUMAN:**
explain to me why it connects k..ediately... Both do. But when I walk out the room I talk j to both while recording. K get back to mh room where my phone is sitting and press play and it records only my door closing like my phone directly recorded it not he micw


**ASSISTANT:**
Now that's a useful detail. They DO pair fine. The problem is range and what's actually recording.

Here's what's happening: your phone is recording its own built-in mic, not the wireless ones. That's why you get the door closing (a sound near the phone) and not your voice from down the hall.

Two things are likely going on:

The app isn't using the external mic. A lot of phones and apps default back to the internal mic even with the receiver plugged in. The receiver lights up, the transmitters pair, everything looks connected, but the recording path never actually switches to them. Very common with these generic USB-C kits.

Or the range dropped and it fell back. You walk out of the room, the link breaks, and the phone quietly reverts to its own mic instead of recording silence.

To figure out which, test it without walking away: plug everything in, hold a transmitter right next to the phone, record ten seconds tapping the foam windscreen. Play it back. If you hear loud tapping, the mic path works and your problem is range. If you hear your room normally but not the tapping up close, the phone is ignoring the mic entirely.

Which app are you recording in?


**HUMAN:**
No sound


**ASSISTANT:**
No sound at all on that close-up test means the phone isn't using the mic. The link between transmitter and receiver is fine, but the phone never switches its recording input over to the receiver. That's the whole problem.

A few things to try, in order:

Open your stock camera app, not a third-party one. Switch to video mode. With the receiver plugged in, start recording and tap the foam. Stock camera is the most likely to grab the external mic.

Check if your phone asked for permission. Some phones pop a "use external audio device?" prompt the first time. If you dismissed it, the phone defaults back to internal forever.

Reseat the receiver while an app is open. Pull it out, open the camera, then plug it back in. Sometimes the phone only registers it if it's inserted while the app is live.

If none of that works, what phone is it? The behavior is different on Samsung versus Pixel versus the cheaper Android brands, and some of these mics straight up don't work with certain phones no matter what.


**HUMAN:**
No recording on stock camera vid rec


**ASSISTANT:**
Then we're down to two real possibilities, and it's worth saying plainly: this kit may just not be compatible with your phone.

But before you write it off, two more checks:

The receiver might need its own charge. Some of these have a tiny battery in the receiver too, not just the transmitters. If it's dead, it lights up enough to look alive but can't actually pass audio. Plug the receiver alone into a charger for a bit.

USB-C orientation and type. A lot of these cheap receivers are wired for a specific data configuration. If your phone's USB-C port is finicky, or if there's any case lip blocking a full seat, it won't register as an audio device. Take any case off and push it in hard.

Now the honest part. These generic mics are notorious for working on some phones and being completely dead on others, even with everything done right. The transmitter-to-receiver link working tells you the mics aren't broken. The phone just refuses to treat the receiver as an audio input.

What phone is it? That's the deciding question. If it's a brand or model these things don't play nice with, no amount of fiddling fixes it, and the move is to return them and get a kit that lists your phone as supported.
