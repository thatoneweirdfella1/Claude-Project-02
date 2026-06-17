# Claude not loading in Microsoft browser

*2026-04-28T17:45:56.841959Z*

---


**HUMAN:**
why is claude not opening on microsoft browswer but it is on chrome? this just started


**ASSISTANT:**
 The user is asking about a technical issue with Claude not loading in Microsoft Edge but working in Chrome. This is a simple tech support question unrelated to the book project.This is a common browser compatibility issue. A few things to try in Microsoft Edge:

**Quick fixes first**

- Hard refresh: press **Ctrl + Shift + R** in Edge
- Clear Edge's cache and cookies for claude.ai specifically (Settings > Privacy > Clear browsing data)
- Try an Edge InPrivate window to rule out extension conflicts

**Common culprits**

- A browser extension blocking Claude (ad blockers, privacy tools, VPNs) — disable them temporarily and test
- Edge's **Enhanced Tracking Protection** set to Strict — try changing it to Balanced in Settings > Privacy
- A cached bad response from a recent update — clearing the cache usually fixes this

**Edge-specific settings to check**

- Make sure Edge is up to date (Settings > Help & Feedback > About)
- Check if any **sleeping tabs** settings are interfering with the connection
- Try disabling **Edge's built-in AI features** temporarily, as they occasionally conflict with other AI services

**If none of that works**

The "Can't reach Claude" message usually means Edge is blocking the network request. Check Windows Firewall or any security software to make sure edge.exe isn't being restricted for that specific domain.

Since it works in Chrome, the issue is almost certainly an extension or a tracking protection setting in Edge rather than anything on Claude's end.
