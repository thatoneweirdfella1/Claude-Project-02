# Creating bootable Windows 10 32-bit USB drive

*2026-05-13T07:15:50.386341Z*

---


**HUMAN:**
im trying to make a windows 10 32 bit iso file bootable from a usb drive, how do i go about this


**ASSISTANT:**
 A few quick questions to point you the right way:
```
This block is not supported on your current device yet.
```




**HUMAN:**
which ojes best


**ASSISTANT:**
 For your use case, **Ventoy** is the better pick, hands down.

Here's why:

**Ventoy**
- Drop the ISO directly onto the drive, done. No flashing, no reformatting.
- Supports multiple ISOs on the same drive. Boot any of them from a menu.
- Already on your repair toolkit SD card. Same workflow you already know.
- Adding Win10 32-bit is literally just copying the ISO file to the drive.

**Rufus**
- Burns one ISO to one drive. That's it.
- Reformats the drive every time you switch ISOs.
- Better if the drive is dedicated to only that one OS and nothing else.

Since you're already running Ventoy on your toolkit, just copy the Win10 32-bit ISO into the Ventoy partition and it shows up in the boot menu automatically. No extra steps.

Only reason to use Rufus would be if you hit a compatibility issue where Ventoy won't boot a specific ISO, which is rare but happens occasionally with some Windows ISOs. In that case Rufus has a "Windows To Go" and partition scheme option that can force it.

Want the steps for adding it to your existing Ventoy drive?


**HUMAN:**
it put the files as mbr, not gpt, is that sufficient


**ASSISTANT:**
 Yes, MBR is fine for Windows 10 32-bit specifically.

Here's the breakdown:

**32-bit Windows can only boot in MBR/Legacy BIOS mode anyway.** It does not support UEFI booting. So MBR is not just sufficient, it's actually correct for this job.

**Where it would matter:**
- 64-bit Windows on modern hardware prefers GPT + UEFI
- Some newer machines have Legacy/CSM disabled in BIOS by default, which can block MBR boot
- If the target machine is very new (2018+), you may need to go into BIOS and enable **CSM (Compatibility Support Module)** or **Legacy Boot**

**What to check on the target machine:**
- Boot into BIOS/UEFI settings
- Look for CSM, Legacy Boot, or Secure Boot settings
- Enable CSM / disable Secure Boot if it won't detect the drive

If the machine is older or mid-range, it'll likely just boot straight from the drive with no changes needed.

What machine are you installing to?
