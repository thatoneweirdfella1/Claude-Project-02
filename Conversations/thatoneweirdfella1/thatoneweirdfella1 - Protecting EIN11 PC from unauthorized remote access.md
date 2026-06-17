# Protecting EIN11 PC from unauthorized remote access

*2026-04-28T08:18:40.507797Z*

---


**HUMAN:**
How do I protect my ein11 pc from underected remote access


**ASSISTANT:**
 Few layers that actually matter:

**Check what's already in**
- `netstat -an` in command prompt — look for established connections you don't recognize
- Task Manager > Details tab — sort by CPU/network, flag unknown processes
- Check `msconfig` > Startup and Services tabs for anything sketchy auto-launching

**Cut off access vectors**
- Disable Remote Desktop if you don't use it: Settings > System > Remote Desktop > Off
- Disable Remote Assistance: Control Panel > System > Advanced > Remote tab
- Check Windows Features (turn off Remote Differential Compression, Telnet if enabled)

**Firewall**
- Windows Defender Firewall > Advanced Settings > Inbound Rules — audit anything allowing remote connection
- Block inbound on port 3389 (RDP), 5900 (VNC), 22 (SSH) if you don't use them

**Monitoring**
- GlassWire (free tier) — visualizes network connections in real time, flags new ones
- Process Monitor (Sysinternals) — logs every process/network event

**Accounts**
- Check for unknown user accounts: `net user` in command prompt
- Make sure your admin account has a strong password
- Disable the built-in Administrator account if it's active

**Nuclear option if you're already suspicious**
- Wireshark — capture traffic and look for outbound connections to IPs you don't recognize, especially on odd ports

What's making you suspicious? That'll narrow it down faster.


**HUMAN:**
Dude slow TF down I just did netstat... I don't know wtf thisnis


**ASSISTANT:**
 Paste it. I'll read it.


**HUMAN:**
That's private informatikn


**ASSISTANT:**
 Fair. 

Tell me what you're seeing — IPs, port numbers, states (ESTABLISHED, LISTENING, etc). Don't need the whole thing, just the parts that look off to you.


**HUMAN:**
How would I know what looksnoff


**ASSISTANT:**
 Good point. Here's what's normal vs. suspicious:

**Generally fine**
- `127.0.0.1` — that's your own machine talking to itself
- `LISTENING` with no foreign address — just waiting, not connected
- Microsoft IPs (ranges like 13.x, 20.x, 52.x) — Windows phoning home, annoying but normal
- Your router's IP (usually 192.168.x.x)

**Worth a closer look**
- `ESTABLISHED` connections to IPs you don't recognize
- Weird port numbers — anything above 49000 on the foreign side is random/dynamic, but high ports on the LOCAL side are odd
- Multiple connections to the same unknown IP
- Any `ESTABLISHED` connection when you're not actively using the internet

**Red flags**
- Port 3389, 5900, 22, 4444, 5555 showing ESTABLISHED to an outside IP
- Connections at odd hours or when the machine should be idle

Easiest move — Google any IP you don't recognize. Site called `whatismyipaddress.com/ip-lookup` or just search the IP directly. Usually tells you who owns it in seconds.

What ports are showing up?


**HUMAN:**
Many..... Established foreign


**ASSISTANT:**
 How many tabs/apps do you have open right now?

Browser alone can show 20-30 established connections — every tab, every ad network, every background sync. That's normal and looks scary if you're not expecting it.

Before we assume the worst — what's running? Browser, Discord, Steam, anything like that?


**HUMAN:**
I had chrome and Microsoft browsers and a file folder and notepad... Now I only have Microsoft and there's 7 established


**ASSISTANT:**
 7 with just Edge open is completely normal. Edge itself hits multiple Microsoft servers simultaneously — telemetry, sync, updates, search suggestions, SmartScreen checks.

Close Edge too. Wait 60 seconds. Then run netstat again.

How many you got after that?


**HUMAN:**
I exited out everything in task mgr. 6 establlished


**ASSISTANT:**
 That's where it gets interesting. What ports are the 6 on? Just the local port numbers or foreign port numbers — whichever is easier to read off.


**HUMAN:**
There's no port column


**ASSISTANT:**
 You're probably looking at the basic view. Run this instead:

Open command prompt and type exactly:

```
netstat -ano
```

That adds the port numbers and the PID (process ID) so we can match each connection to a program.


**ASSISTANT:**
 This looks clean. Here's the breakdown:

**The ESTABLISHED connections — all port 443 (HTTPS)**
All going to Microsoft IP ranges (`2603:10xx` and `2600:14xx`). That's OneDrive, Windows Update, Edge sync, Microsoft telemetry. Normal Windows background stuff.

**CLOSE_WAIT ones** — connection is wrapping up, not a live session. Fine.

**TIME_WAIT** — same, already closing.

**The LISTENING ports**
- 135, 445 — standard Windows RPC/file sharing. Normal.
- 7680 — Windows Update delivery optimization. Normal.
- 5040 — Windows runtime. Normal.
- 49664-49673 range — dynamic Windows service ports. Normal.

**Nothing here is a red flag.** No unknown IPs, no weird ports, no unexpected remote tools. All roads lead back to Microsoft.

One thing I notice — username is `erwin`. That your account name or did you inherit this machine from someone?
