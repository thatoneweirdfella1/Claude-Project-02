# Harmful things to know about

*2026-03-08T08:35:55.866091Z*

---


**HUMAN:**
whats  important to know thats harmful or can be


**ASSISTANT:**
 Here are the key terms that could catch you off guard or work against you:

**Auto-renewal trap (Section 3.2)** — Your subscription renews automatically at the current rate and seat count unless you explicitly cancel before the renewal date. Easy to forget and get charged for another full term.

**Fees are non-refundable (Section 3.5)** — Once you pay, you generally can't get money back, and you can't reduce your seat count mid-subscription.

**Arbitration clause (Section 9.11)** — You waive your right to sue in court or join a class action lawsuit. You only have **30 days from first agreeing** to opt out by emailing arbitration-opt-out@figma.com. After that window closes, you're locked in.

**Liability cap (Section 7.2)** — If Figma causes you harm, the most they owe you is either $100 or what you paid them in the last 12 months. They face essentially no meaningful financial consequence for failures.

**Content deletion on termination (Section 8.2)** — After your account ends, Figma only keeps your files accessible for 30 days, then can permanently delete everything. Export your work before canceling.

**Figma can change pricing mid-subscription (Section 3.6)** — If they raise prices and you object, your only remedy is to cancel — there's no price lock guarantee.

**Account credentials can't be shared (Section 2.4b)** — Each seat must be used by one individual. Sharing logins technically violates the terms and could get your account suspended.

The arbitration opt-out deadline is the most time-sensitive one to act on if you care about preserving your legal rights.


**HUMAN:**
do they keep pyour stuff after 30 days in a database?


**ASSISTANT:**
 The Terms don't give a clear answer on that. Section 8.2 says Figma **"may delete"** stored Customer Content after 30 days — but "may" is doing a lot of work there. It doesn't say they **will** delete it, and it doesn't say anything about what happens to it in their backups, logs, or internal systems.

What the Terms **do** tell you that's relevant:

- **Section 2.5** — they can use your content to maintain, debug, and run the service
- **Section 2.7** — they collect "Usage Data" including metadata *about* your content indefinitely, even after termination
- **Section 2.6** — any Feedback you gave them is theirs to keep and use permanently

**What's notably absent** is any explicit commitment to fully purge your data from all systems, backups, and infrastructure after deletion. Most big SaaS companies retain data in backups for some period beyond account deletion, but Figma's Terms don't address this.

For a real answer you'd need to look at their **Privacy Policy** (figma.com/privacy) and **Data Processing Addendum** (figma.com/dpa), which were referenced but not included in this document. Those would have more specific data retention language.

If this is a serious concern — especially for sensitive business or client work — those two documents are worth reading carefully.
