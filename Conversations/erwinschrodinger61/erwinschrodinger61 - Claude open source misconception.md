# Claude open source misconception

*2026-05-05T15:16:01.246544Z*

---


**HUMAN:**
What is clawde open ai. I heard Claude made a mistake and put it's info out there and someone downloaded it then rebranded it making Claude code technically open so now. Is that true


**ASSISTANT:**
 The user is asking about "Clawde" or "Claude Open AI" and whether there's a story about Claude's code being leaked/open-sourced accidentally. Let me search for this.
```
This block is not supported on your current device yet.
```

This is a real story. Let me summarize what happened based on the search results.

The story: On March 31, 2026, a security researcher named Chaofan Shou discovered that Anthropic accidentally included source map files in the published npm package for Claude Code. This exposed ~512,000 lines / ~1,900 TypeScript source files of Claude Code's internal code. The cause was a developer failing to add *.map to .npmignore. Anthropic confirmed it was human error. People then downloaded and reposted the code on GitHub.

"Clawde" specifically - let me check if that's a specific rebranding.This is a real story — here's what actually happened:

**The Leak (March 31, 2026)**

Claude Code is built on Bun (a JavaScript runtime Anthropic acquired in late 2025). Bun generates source maps by default. Someone on the release team failed to add `*.map` to `.npmignore`, so the `cli.js.map` file shipped with the published npm package — and it contained every original TypeScript source file: readable, commented, and complete. Security researcher Chaofan Shou spotted it and posted a download link on X, which racked up over 21 million views. Extracting the code was trivial.

**What Was Exposed**

The source map decompressed into approximately 1,900 TypeScript source files. The query engine alone spans 46,000 lines. Researchers also found 44 unreleased feature flags covering autonomous background agents (internally called KAIROS), multi-agent orchestration, voice commands, and browser control.

**Anthropic's Response**

Anthropic called it a "release packaging issue caused by human error, not a security breach," and confirmed no customer data or credentials were exposed.

**The "Open Source" Repos**

People immediately uploaded the code to GitHub and some rebranded it. These are independent, community-driven projects — not official Anthropic products.

**Important caveat:** This was the **CLI tool code** (how Claude Code talks to models, manages sessions, etc.) — **not the actual AI model weights or the intelligence behind Claude itself.** As one repo noted, "this is just the skeleton, not the brain itself." So Claude's actual AI capabilities are not open source — just the interface code got exposed.

As for "Clawde" specifically, that may just be a community nickname for these rebranded repos. The core story is accurate though.
