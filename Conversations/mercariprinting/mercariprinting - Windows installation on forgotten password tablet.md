# Windows installation on forgotten password tablet

*2026-05-13T07:38:30.823354Z*

---


**HUMAN:**
Trying to get a new installation of windows on a tablet of mine where I forgot my password. I made a bootable isk of win 32 bit and now it's asking me this


**ASSISTANT:**
 You're in the **Ventoy boot menu** for your Windows ISO. Here's what to do:

**Select "Boot in normal mode"** — this is what you want. It will boot directly into the Windows installer from your USB.

The other options aren't what you need right now:
- **Boot in wimboot mode** — loads Windows into RAM instead of from the USB, useful for slow drives but not needed here
- **File checksum** — just verifies the ISO file integrity

---

Once it boots into the Windows installer, since you're reinstalling to bypass a forgotten password:

1. Choose your language → click **Next**
2. Click **Install Now**
3. When asked for a product key, click **"I don't have a product key"**
4. Select **Windows 32-bit** edition
5. Choose **Custom: Install Windows only (advanced)**
6. Select the existing partition and **delete it**, then install to the unallocated space

This will wipe the old password along with everything else on the tablet and give you a fresh Windows install.


**HUMAN:**
Its upside down


**ASSISTANT:**
 The error says:

> **"No bootfile found for UEFI / Maybe the image does not support X64 UEFI"**

This is the core problem: **your 32-bit Windows ISO isn't compatible with your tablet's 64-bit UEFI firmware.**

This is actually very common with tablets — many use a quirky setup called **32-bit UEFI** (even with a 64-bit processor), but some use standard 64-bit UEFI.

---

**Here's what to do:**

**Option 1 — Download a 64-bit Windows ISO** and put it on your Ventoy USB instead. Try booting that first — it's the quickest fix if your tablet has standard 64-bit UEFI.

**Option 2 — If your tablet has 32-bit UEFI** (common on older Bay Trail/Atom tablets like some Lenovo, Asus, or Dell tablets), you need a special ISO that includes a 32-bit bootloader. The standard Microsoft ISO won't work. You'd need to add a `bootia32.efi` file to the ISO.

---

**What tablet model is it?** That'll tell us exactly which situation you're in so you don't waste time downloading the wrong thing.


**HUMAN:**
So using ventoy. I open the drive I did it on. Delete the 32 bit file. then just add the 64 bit 2in 1o version? Do impress update in ventoy? How do I do this


**ASSISTANT:**
 Yes, exactly! It's simple:

1. **Open the Ventoy USB drive** in File Explorer
2. **Delete** the 32-bit ISO file
3. **Drag and drop** the new 64-bit ISO straight into the drive
4. That's it — **no need to update or reinstall Ventoy**, it automatically detects whatever ISOs are on the drive

---

**To get the 64-bit ISO:**
- Go to **microsoft.com/software-download/windows10** (or windows11)
- Click **Download tool now** → select **ISO file** → choose **64-bit**

---

What Windows version are you trying to install — 10 or 11? And do you know what tablet model it is? Some older tablets won't run 11.


**HUMAN:**
Wordpadkks no longer working. I'm assuming the update fucked it up. How can I fix this


**ASSISTANT:**
 Microsoft actually **intentionally removed WordPad** from Windows in the October 2023 update — it's gone for good, not a bug.

**Free replacements:**

- **Notepad++** — best direct replacement, free, download from notepad-plus-plus.org
- **LibreOffice Writer** — full Word-like experience, completely free
- **OnlyOffice** — looks and feels very close to Microsoft Word, free

If you just need something built into Windows right now, **Notepad** is still there for plain text, or you can use **Word Online** free in your browser at office.com.

What were you mainly using WordPad for? That'll help pick the best replacement.


**HUMAN:**
Norwpadnopens weird code in the docjmentnj neednao not won't work


**ASSISTANT:**
 Got it — Notepad is showing weird symbols/garbage because it can't read the file format (it only handles plain text).

You need something that can open **.doc/.rtf** files properly. Quickest fix:

**Download LibreOffice** — free, opens everything WordPad used to handle
- Go to **libreoffice.org** → Download → install it
- Then right-click your file → Open with → LibreOffice Writer

That should display your document correctly. What's the file extension — is it **.rtf**, **.doc**, or something else?


**HUMAN:**
What's the Bible say about a centralized power


**ASSISTANT:**
 The Bible has quite a bit to say on this, from multiple angles:

---

**Skeptical of centralized human power:**

- **1 Samuel 8** — Israel asks for a king, and God warns them through Samuel that a king will tax them, conscript their children, and take their land. God says they're rejecting *Him* as their ruler. This is one of the Bible's clearest warnings against concentrated political power.
- **Tower of Babel (Genesis 11)** — unified human power working toward a single goal is seen as dangerous; God deliberately scatters and divides it.
- **Daniel & Revelation** — large empires (Babylon, Rome) are portrayed as beast-like and corrupt, ultimately opposing God.

---

**Accepts governing authority as necessary:**

- **Romans 13** — Paul says governing authorities are established by God and should be obeyed, since order is better than chaos.
- **1 Peter 2:13-14** — similarly instructs submission to human institutions.

---

**The bigger picture:**

The Bible is generally suspicious of *human* centralized power but affirms that *God's* kingship is the only legitimate absolute authority. Human governments are seen as a necessary but flawed stopgap — useful for order, but always prone to corruption and oppression when they overreach.

What angle are you most interested in — political, prophetic, or something else?


**HUMAN:**
J just remember something in the Bible that sort of fit the new world order conspiracy claim


**ASSISTANT:**
 You're probably thinking of a few passages that people commonly connect to that:

---

**Revelation 13** — the most cited one:
- A world government controlled by a single ruler (the Beast)
- A global economic system where **no one can buy or sell** without "the mark"
- Everyone forced to worship a central authority
- This is the big one conspiracy theorists point to

---

**Revelation 17-18** — "Babylon the Great"
- A powerful, wealthy, globally influential system that controls "kings of the earth"
- Often interpreted as a corrupt world economic/political order

---

**Daniel 7** — four world empires, leading to a final one-world ruler before God's kingdom comes

---

The NWO conspiracy idea basically borrows heavily from **Revelation 13** specifically — the mark, centralized control, one world leader. Whether you interpret that prophecy as literal future events, symbolic of Rome, or something else is where Christians disagree a lot.

What's interesting is the Bible doesn't say this *won't* happen — it actually says something *like* it **will** happen at some point, which is why the prophecy exists in the first place.

Were you thinking of a specific passage, or just the general theme?
