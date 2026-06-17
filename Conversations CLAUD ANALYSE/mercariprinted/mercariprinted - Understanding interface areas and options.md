# Understanding interface areas and options

*2026-03-29T15:50:08.485704Z*

---


**HUMAN:**
i need you to tell me what this area is for, and what each option in it is for


**ASSISTANT:**
 This is **Claude Code** — Anthropic's agentic coding tool. It lets Claude autonomously work inside your actual codebase instead of just chatting about code.
```
This block is not supported on your current device yet.
```

---

## What Each Part Does:

**1. The text box ("Find a small todo in the codebase and do it")**
That's just an example prompt. You type what you want Claude to *do* in your code. Not explain — actually do. Like "fix the broken login function" or "add a dark mode toggle."

**2. Select a repository**
Connect a GitHub repo. Claude reads your actual files and makes real changes — like handing your codebase to a developer intern who can read everything.

**3. Import issues**
Pulls in GitHub Issues (bug reports, feature requests) so Claude can work through them automatically.

**4. Monitor PRs**
Watches Pull Requests and can review, flag, or respond to code changes as they come in.

**5. Implement designs**
Connects to **Figma** — you give it a design mockup, it writes the actual code to build it.

**6. Add more data sources**
Connects Gmail, Slack, etc. so Claude has more context about *why* things need to be built.

---

**Short version:** It's a junior developer that never sleeps, doesn't ask dumb questions, and works directly inside your code. You just tell it what needs doing.

You'd need a codebase/GitHub repo to actually use it — doesn't apply to Marketplace work, but if the Conspiracy Facts artifact ever gets complex enough, this becomes relevant.


**HUMAN:**
okay, read my conversation history about the artifact thats interactive that i want to make involving cfr bildiberg, trilateral, wep, presidents, etc..... how can these fields help me make it or give me more ways to expand whats possible


**ASSISTANT:**

```
This block is not supported on your current device yet.
```


```
This block is not supported on your current device yet.
```

Okay, I got full context. Here's exactly where you're at and how Claude Code changes everything:

---

## What You're Building (Quick Recap)

A **force-directed interactive node map** — every person, group, company is a clickable dot. Lines connect them. Click anyone → see their memberships, quotes, roles, crossovers. Built from a master JSON database of TC + CFR + Bilderberg + WEF data you've been collecting.

---

## How Claude Code Specifically Helps YOUR Project

Here's where it gets real. Right now, every session you lose context, files disappear from outputs, and you're rebuilding manually. Claude Code kills that problem dead.

---

### 1. **Select a Repository — This Is Your Game Changer**

Connect your artifact to a **GitHub repo** (free account). Claude Code then:

- Reads ALL your files across sessions — the JSON database, the HTML artifact, the Vault file — **without you uploading them every time**
- Makes actual edits to the node map and saves them directly
- You never lose work again. It lives in GitHub permanently.

Think of it like this: right now your files are on sticky notes you keep losing. GitHub is a fireproof filing cabinet Claude Code has a key to.

---

### 2. **Import Issues → Your Research Task List**

You create GitHub "Issues" like:
- *"Add 2019 Bilderberg names to JSON"*
- *"Wire Macron node to Bilderberg 2014"*
- *"Add Kissinger quote to CFR node"*

Claude Code reads those issues and **does them**. You become the researcher, it becomes the builder executing your task list automatically.

---

### 3. **Monitor PRs → Version Control for the Artifact**

Every time Claude Code changes your node map, it creates a "Pull Request" — basically a changelog showing exactly what it added or changed before it goes live. You approve it or reject it. Nothing gets added to your artifact that you didn't greenlight.

For a project built on verified facts, this matters — you're the final gatekeeper on every change.

---

### 4. **Implement Designs → Figma to Node Map**

If you ever sketch out what you want the artifact to look like in **Figma** (free), Claude Code reads that design and builds it into the HTML. You stop trying to describe visual ideas in words.

---

### 5. **Add More Data Sources (Gmail/Slack) → Research Pipeline**

Less relevant for your project right now — but if you ever have research notes in Gmail or a team helping you, it can pull context from there too.

---

## The Real Power Unlock For You Specifically

Right now your workflow is:
> New session → re-upload files → re-explain context → rebuild → lose it again

With Claude Code + GitHub your workflow becomes:
> Open Claude Code → say "add the 2019 WEF list to the JSON and wire the new nodes" → done → saved permanently

**That's the ADHD fix.** No rebuilding. No losing work. No re-explaining. The project just grows every session instead of starting over.

---

## Step 1 to Make This Real

1. Go to **github.com** → create a free account
2. Create a new repository called `conspiracy-facts`
3. Upload your Vault file and the artifact HTML there
4. Come back here and connect it via Claude Code

That one move turns this from a chat project into a real persistent application.

Want me to walk you through GitHub setup step by step?


**HUMAN:**
where do i add my 6 md conversations and huge list of json files


**ASSISTANT:**
 Short answer: **all of it goes in the GitHub repo.** But organized, not just dumped.

Here's the folder structure I'd set up for your specific project:

---

```
conspiracy-facts/
│
├── data/
│   ├── json/
│   │   ├── ygl_mini.json
│   │   ├── bilderberg_all.json
│   │   ├── cfr_roster.json
│   │   └── trilateral_all.json
│   │
│   └── md/
│       ├── vault_v1.md
│       ├── session_2.md
│       ├── session_3.md
│       └── (all 6 conversation exports here)
│
├── artifact/
│   ├── elite_connections.html
│   ├── presidents_groups.html
│   └── node_map.html (the force-directed one we're building)
│
├── skills/
│   └── (your custom skill files if you want them backed up)
│
└── README.md  ← one paragraph describing the project
```

---

## How to Upload Everything

**Option A — GitHub website (easiest, no install needed):**

1. Go to your repo on github.com
2. Click **"Add file"** → **"Upload files"**
3. Drag your entire folder structure in
4. Click **"Commit changes"**

Done. Everything is saved.

---

**Option B — GitHub Desktop app (easier long term):**

1. Download **GitHub Desktop** (free, google it)
2. Clone your repo to your computer
3. Just drag files into the folder on your computer like normal
4. Hit **"Commit"** and **"Push"** in the app

This one's better long term because adding new files later is just drag-and-drop.

---

## One Important Thing

When Claude Code connects to your repo, it can now **read every JSON and every MD file** without you uploading anything. You just tell it:

*"Read data/json/ygl_mini.json and cross-reference it with bilderberg_all.json"*

And it actually does it. Against your real files. That's the whole point.

---

Do you already have a GitHub account, or do you need the signup walkthrough first?


**HUMAN:**
well that waant confusing at all..... he said sarcastically


**ASSISTANT:**
 Yeah that was basically me handing you an IKEA manual written in Swedish. My bad.

Let's do this **one thing at a time.**
```
This block is not supported on your current device yet.
```




**HUMAN:**
Q: Where are you starting from?
A: I have a GitHub account but never used it


**ASSISTANT:**
 Perfect. You have the account — that's the hard part done already.

Here's **only what you're doing right now.** One step. That's it.

---

## STEP 1 OF 1 — Create Your Project Folder on GitHub

1. Go to **github.com** and log in
2. Click the **"+"** in the top right corner
3. Click **"New repository"**
4. In the **"Repository name"** box type: `conspiracy-facts`
5. Make sure **"Private"** is selected *(your research stays yours)*
6. Scroll down and click the green **"Create repository"** button

---

That's it. Stop there and come back here.

Don't click anything else. Don't explore. Just do those 6 steps and tell me when the page changes — it'll look kind of empty and confusing but that's normal and I'll tell you exactly what to do next.


**HUMAN:**
myh computer is slow opening windows on browsers, cant i do it through claudde


**ASSISTANT:**
 Not directly through me — but here's the thing:

**You don't actually need GitHub right now.**

I got ahead of myself. Claude Code is useful *eventually* for your project, but you're not at that stage yet. Your actual bottleneck right now is simpler than that.

---

## Where You Actually Are

You have:
- ✅ 6 conversation MD files
- ✅ A bunch of JSON files
- ✅ An artifact partially built
- ❌ WEF list still missing
- ❌ Cross-reference not done yet
- ❌ Final node map not built

None of that requires GitHub. That requires **me and your files.**

---

## What Actually Makes Sense Right Now

Just upload your files **directly here** in this chat:

1. Your JSON files
2. Your MD conversation exports
3. Whatever artifact HTML you have

I read them all, cross-reference everything, and we keep building — no GitHub, no slow browser windows, no new accounts to figure out.

GitHub is a "store it permanently" solution. We can set that up **after** the artifact is actually finished. No point parking a car that isn't built yet.

---

Want to just start uploading your files here and pick up where the project left off?


**HUMAN:**
dude no.... stop telling me to do shit that would hgurt me, id be better off putting it in the project


**ASSISTANT:**
 You're 100% right. Projects is exactly where it belongs. My bad for overcomplicating it.

Go to your **Claude Project** for Conspiracy Facts and upload everything there — all 6 MD files and all your JSON files.

That's it. One place. Stays there forever. Every conversation inside that project can see all of it without you uploading anything again.

---

Two questions before you do:
```
This block is not supported on your current device yet.
```




**HUMAN:**
Q: Do you already have a Claude Project set up for Conspiracy Facts?
A: why do you keep asking me about that? every instance of claue salways asks me about conspiracy facts, so much so that i dont even like the name anymore. wherever iit says that, please change it. i never want to hear that name again now

Q: Where are your files right now?
A: On my computer


**ASSISTANT:**
 Got it — and noted permanently right now.

**The project name is dead. Never saying it again.**
```
This block is not supported on your current device yet.
```


```
This block is not supported on your current device yet.
```

Done. Locked. Won't happen again.

---

Now — your files are on your computer. Here's the **one thing to do:**

1. Open Claude
2. Click **"Projects"** on the left sidebar
3. If you don't have a project for this yet, hit **"New Project"** and name it whatever feels right to you
4. Once inside the project, look for **"Add content"** or a paperclip/upload area
5. Drag all your JSON files and MD files in there

That's it. Every conversation you have **inside that project** sees all those files automatically. No uploading every time. No re-explaining context.

What do you want to name it?


**HUMAN:**
way ahead of you


**ASSISTANT:**
 Ha. Good.

So what's it called now, and do you want to pick up where the project left off — or were you asking about Claude Code specifically to figure out if it adds anything new to what you're already building?
