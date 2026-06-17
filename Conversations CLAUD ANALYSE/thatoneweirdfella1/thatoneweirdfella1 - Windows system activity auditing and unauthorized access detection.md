# Windows system activity auditing and unauthorized access detection

*2026-06-12T10:57:24.806799Z*

---


**HUMAN:**
How do I implement comprehensive system activity auditing on a Windows computer to detect and log unauthorized access attempts? I need to capture login events, file access timestamps, process execution logs, and session activity with full audit trail capability. What are the built-in OS features and third-party tools that provide this level of security monitoring?


**ASSISTANT:**
 The user is asking about monitoring system activity on Windows — tracking logins, file access, processes, and sessions. This is legitimate security work, especially since Devan has roommates and might be concerned about unauthorized access to his own machine. I can cover the built-in Windows tools for this: Event Viewer, audit policies through Local Security Policy or auditpol commands, the Security Event Log, and Sysmon for more detailed monitoring.

Beyond Windows built-ins, there are solid third-party options like Sysinternals tools (Process Monitor, Autoruns, PsLoggedOn), OSSEC or Wazuh for centralized monitoring, Splunk's free tier, event log forwarding solutions, NXLog, Velociraptor, and Graylog. I should keep the formatting straightforward and technical since he's clearly experienced, and avoid em dashes or list dashes per his preferences. Process creation auditing captures command lines via Group Policy, PowerShell logging tracks module and script block execution, and session activity monitoring covers RDP reconnects and lock/unlock events through Event IDs 4778/4779 and 4800/4801. Increasing the Security log size beyond the default 20MB prevents rapid log rollover, Task Scheduler can trigger automated alerts on specific event IDs like failed logons, and Sysmon from Sysinternals provides comprehensive monitoring of process hashes, network connections, file timestamps, and registry changes with the SwiftOnSecurity configuration as a solid starting point.

Beyond Sysmon, tools like Process Monitor, Autoruns, and PsLoggedOn offer additional visibility, while the previous logon display feature (available natively on domain machines or via registry on local systems) shows login history at the user logon screen. For more comprehensive monitoring, options like Wazuh, Velociraptor, NXLog with Graylog, or Splunk Free exist, though for most scenarios a practical combination of Sysmon and Event Viewer custom views covers the essentials, and audit log protection should be enabled to prevent tampering.

The key is ensuring non-admin accounts are used on shared machines since administrators can clear logs (though Event ID 1102 records the clearing), and for serious scenarios, forwarding logs off-box via Windows Event Forwarding adds another layer of protection. When investigating unauthorized access, checking logon types in Event ID 4624 (interactive, RDP, network), boot/wake times, and browser history provides the most actionable leads, though browser data won't appear in event logs themselves.Good news: Windows has most of this built in, it's just disabled or under-configured by default. Here's the full stack, from native features to the tools serious analysts actually use.

**Built-in audit policy (the foundation)**

Open `secpol.msc` and go to Advanced Audit Policy Configuration, or use `auditpol.exe` from an elevated prompt. The categories you want:

Logon/Logoff auditing gives you Event ID 4624 (successful logon), 4625 (failed attempt), 4634/4647 (logoff), 4648 (logon with explicit credentials, which catches "runas" style access), and 4672 (privileged logon). Pay attention to the Logon Type field inside 4624: type 2 is someone physically at the keyboard, type 10 is RDP, type 3 is network access, type 7 is unlocking the screen. That field alone tells you how someone got in.

Object Access auditing covers file access, but it's two steps. First enable "Audit File System" in the policy, then set a SACL on the specific folders you care about: right-click folder, Properties, Security, Advanced, Auditing tab, add the principal (use Everyone if you want everything caught) and pick read/write/delete. You'll then get 4663 (access occurred), 4656 (handle requested), and 4660 (object deleted). Don't audit the entire drive or you'll drown the log; target sensitive directories.

Process Creation auditing gives you Event ID 4688 for every process launched. Critically, also enable command line capture: Group Policy Editor, Computer Configuration, Administrative Templates, System, Audit Process Creation, "Include command line in process creation events." Without that, 4688 tells you notepad.exe ran but not what it opened.

Session events: 4800/4801 (workstation locked/unlocked), 4778/4779 (session reconnected/disconnected, mostly RDP and fast user switching). These are gold for figuring out when someone was actually at the machine.

Two housekeeping items that matter more than people realize. First, bump the Security log size in Event Viewer (right-click Security log, Properties) from the default ~20MB to 1GB or more, because default settings roll over and destroy your trail in days. Second, know that Event ID 1102 is logged whenever someone clears the Security log, so even tampering leaves a fingerprint, though only an admin can clear it in the first place.

**PowerShell logging**

In Group Policy under Administrative Templates, Windows Components, Windows PowerShell: enable Module Logging, Script Block Logging (Event ID 4104), and Transcription. Most stealthy activity on a Windows box eventually touches PowerShell, and script block logging captures the actual code executed even if it was obfuscated.

**Sysmon (the single biggest upgrade)**

Sysmon, from Microsoft's own Sysinternals suite, is free and is what professional incident responders deploy. It logs process creation with full command lines and file hashes, network connections per process, file creation timestamps, registry modifications, and driver loads, all into its own event log channel. Install it with a curated config rather than defaults; the SwiftOnSecurity sysmon-config on GitHub is the standard starting point and filters out noise while keeping the signal. One install command: `sysmon64 -accepteula -i sysmonconfig.xml` and it runs as a service from then on.

Other Sysinternals tools worth having: Process Monitor for real-time deep inspection, Autoruns to see everything that launches at boot (where persistence hides), and PsLoggedOn or LogonSessions to see who's connected right now.

**Alerting instead of just logging**

Task Scheduler can trigger on specific event IDs. Create a task triggered "On an event," point it at the Security log with Event ID 4625, and have it run a PowerShell script that emails you or pops a notification. Now failed logons alert you in real time instead of waiting for you to go digging.

**Third-party / heavier options**

For a single machine, Sysmon plus tuned audit policy plus Event Viewer custom views honestly covers ninety percent of it. If you want a real analysis layer: Wazuh is a free open-source SIEM with a Windows agent that does file integrity monitoring, log analysis, and alerting with a web dashboard. Velociraptor is a free DFIR tool built for hunting through endpoint activity. NXLog can forward your event logs to another machine, which matters because logs stored on the monitored machine can be tampered with by anyone holding admin rights. If your threat model includes someone with admin access to the box, off-machine log forwarding (or even Windows Event Forwarding to a second PC) is the only audit trail that actually holds up.

**The blunt caveat**

Auditing only constrains what it can see. Someone with physical access plus an admin account can do real damage to your trail, and someone booting from a USB drive bypasses Windows logging entirely. So pair this with the boring stuff: make sure other accounts on the machine are standard users rather than administrators, set a BIOS/UEFI password and disable USB boot if physical access is a concern, and enable BitLocker so an offline attack can't read or alter the disk. The combination of locked-down accounts, Sysmon, command-line process auditing, and off-box log forwarding gives you an audit trail that's genuinely hard to evade or erase.

Want me to put together the exact auditpol commands and a starter Sysmon config as a ready-to-run setup script?
