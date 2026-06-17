# Screenshot keyboard shortcuts not working

*2026-03-18T20:13:23.638631Z*

---


**HUMAN:**
What's a few keyboard shortcuts that take screenshots. For some reason I always use fn print screen and it's not working suddenly


**ASSISTANT:**
 Here are some common screenshot shortcuts depending on your OS:

**Windows**
- **Win + Shift + S** — Opens Snipping Tool (select any area) ✨ most useful
- **PrtScn** — Copies full screen to clipboard
- **Win + PrtScn** — Saves full screen to Pictures/Screenshots folder
- **Alt + PrtScn** — Captures active window only

**Mac**
- **Cmd + Shift + 3** — Full screen screenshot
- **Cmd + Shift + 4** — Select an area
- **Cmd + Shift + 4, then Space** — Capture a specific window
- **Cmd + Shift + 5** — Opens screenshot toolbar with all options

**Why `Fn + PrtScn` might have stopped working:**
- On laptops, some keyboard firmware updates or driver changes can remap Fn keys
- Check if there's a **Fn Lock** toggle (often `Fn + Esc` or `Fn + F Lock`)
- Some apps or utilities (like DisplayLink, Logitech Options) can intercept or remap the key
- On Windows, try **Win + Shift + S** as a reliable alternative that doesn't depend on PrtScn

Which OS are you on? I can give more targeted advice if needed.


**HUMAN:**
None are working. I've been using it all year even 10 min ago. Now it's refusing to donit


**ASSISTANT:**
 That's really frustrating, especially when it was just working! A few things to try right now:

**Quick fixes to try first**
- **Restart Explorer** — Open Task Manager (Ctrl + Shift + Esc) → find "Windows Explorer" → right-click → Restart
- **Check your clipboard** — Sometimes the screenshot is being captured but clipboard is full or bugged. Try Win + Shift + S and see if the Snipping Tool overlay even appears
- **Check if Snipping Tool is running** — Search for it in the Start menu and open it manually, then try the shortcut

**Something may have changed in the last 10 minutes**
- Did Windows just push an update in the background? That can temporarily break shortcuts until you restart
- Did any app install or update (Snagit, ShareX, Dropbox, OneDrive)? These can hijack screenshot shortcuts
- Is a game or full-screen app open? Those sometimes block system shortcuts

**Try these alternative methods right now**
- Open **Snipping Tool** from Start menu directly and take one from inside the app
- **Xbox Game Bar**: Win + G → click the camera icon
- **Greenshot or ShareX** (free tools) as a backup going forward

**The most likely fix** is just a plain restart — something in your session has probably gotten into a bad state. If restarting fixes it, a Windows update running silently in the background was likely the culprit.

Does the Snipping Tool overlay appear at all when you try Win + Shift + S?


**HUMAN:**
It allows for me to shoose where j want to capture the screen though it's not


**ASSISTANT:**
 Ah, so the overlay appears and you can select the area — but then nothing happens after you make the selection? The screenshot isn't saving or copying?

That points to a **clipboard issue** most likely. Try this:

1. **Clear your clipboard** — Win + V to open clipboard history, then clear it
2. Make a selection and then try **Ctrl + V** in Paint or Word to paste — sometimes it captures but just doesn't notify you

If that doesn't work:

- **Restart the "cbdhsvc" service** — Open Task Manager → Services tab → find `cbdhsvc` → right-click → Restart. That's the clipboard service.

Or the even faster fix — just **paste immediately after selecting** (Ctrl+V in Paint or anywhere) and see if it actually did capture it without showing any confirmation. Windows notifications being silenced can make it *look* like it failed when it actually worked.

Does Ctrl+V after a selection give you anything?


**HUMAN:**
Didn't work right clicking and pressing screenshot does somehow wtf


**ASSISTANT:**
 Haha, well hey — at least you have *something* working! That's the right-click desktop context menu screenshot option, which bypasses the clipboard entirely and saves directly to a file, so it sidesteps whatever is broken.

The fact that works but the shortcuts don't points pretty clearly to a **clipboard/session glitch** rather than anything serious. A simple **restart** will almost certainly fix the shortcuts going back to normal.

For now you've got a workaround, and after a reboot everything should be back to how it was this morning!
