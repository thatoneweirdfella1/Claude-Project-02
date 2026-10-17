# Owner decisions for the Divergence.AI restart

These are the decisions Devan, the owner, made with Claude on 2026-10-16 for the build runs that restart this project. Quoted lines are his exact words. These decisions outrank older plans, status files and next actions in this repository.

## How work happens now

Work happens in build runs. Each run does one approved slice of work on its own new branch, gets its own Vercel preview link, and is checked by Claude. The live site stays the same until Devan approves a run.

Nothing about the layout is final until everything works and Devan has clicked through all of it himself on a preview link. In his words: "i gotta be able tyo see what wotrks to know if it stYA THE SAME OR NOT" and "not just that, everyything, meaning it all has to work for me oto know". Until then, every element stays where the frozen layout (FROZEN-LAYOUT.md) puts it. After everything works, Devan decides what stays and what moves, the top bar included. Moving a button later is a small follow up run.

## Planned order of the build runs

Run 1 is the foundation, on branch build-1. Run 2 is money: J1 plus the money parts of J9. Run 3 is the website UI: J2, including the J7 download button. Run 4 is J8, the whole-site repair layers. Run 5 is J3, prompt research. Run 6 is J4, personalization. Run 7 is the J9 free provider pool and team mode, with the J1 live charge proof. Run 8 is J11, answers built for divergent minds. Run 9 is J10, the handoff manual. J5's remaining Windows tester packaging is not scheduled yet. The order can change, and every run needs its own run spec and Devan's go ahead.

## J2 layout (decided)

The extra layout options are crossed off. The layout is the frozen Divergence gold marble layout (light) plus its frozen dark version, per FROZEN-LAYOUT.md. The broken Original/Gold layout picker is removed. The three overload settings from the August 31 request (Minimal, Standard and Detailed levels of how much the screen shows) stay on the plan, since they only show or hide buttons; the J2 run builds them.

## J7 download button (decided, Devan: "add the button")

J7 is no longer "bulk download". The "download all" lines were complaints about ChatGPT's file links, not a Divergence request. J7 now means Devan's June 28, 2026 request, in his exact words:

"yes, exactlythe debate should perhaps appear in a popup , but im thinking if u look at the top rtight of the last image i attached, there should be a download button which is actually for sharing, i want that button to truly be to download the conversation as a markup, where the download incorperates the discussion between the two ais into it, with an option to download just the convo, just the debate, or both. and sepate from the download button itself, in the popup of the debate, there should be an option to carry the debate over into the convo, im guessing it best to do that a attached markdown file"

Placement for now: inside the existing Export button under the answer, using its dropdown arrow (the frozen layout shows EXPORT with a dropdown at the bottom right of the answer card). No new top bar button, because the frozen top bar is locked. The dropdown offers just the convo, just the debate, or both, as a markdown file, next to the existing single answer save, which stays. The debate box gets a button that carries the debate into the conversation as an attached markdown file.

## J5 Cowork overlay (decided)

The deploy-time Cowork overlay is retired by turning its effect into ordinary source, so the source is exactly what deploys. Its old unused component cluster is not brought back.

## J6 handoff system (decided)

Devan, on finishing the self running author/auditor controller: "nah we are doing that now, itd be obsolete when we are done". The controller stays parked on its own branch (divergence/reliability-staging). It is not finished, merged, or connected to workers. The 20 system reliability blueprint (S01 to S20, F0) comes off the work list; it stays saved on its branch and nothing is deleted. J6 now means keeping the start notes (AGENTS.md, CLAUDE.md, START-HERE-DIVERGENCE.md and the status files) pointed at the current branch and the current build process. The leftover controller Vercel project and its GitHub App or webhook get switched off later, with Devan.

## J9 Developer Mode providers (decided, Devan: "omfg i love this idea")

His plan, in his words from August 22, 2026: "find all the clouds. find all the limits. combine them", so Developer Mode is "unlimited.....ish" for his own heavy use. Build: plug in all of Devan's free provider keys, and when one hits its daily limit, the app automatically hands the request to the next one. Add slots for free providers the app lacks (Groq has no slot today; the app's slots are Anthropic, OpenAI, Google, xAI and DeepSeek).

Team mode for hard questions (Claude's idea, approved): send the question to 2 or 3 free models at once, have them read each other's answers, then merge one best answer, reusing Debate, Consensus and Synthesis. It is slower and uses daily limits 3 or 4 times faster, so it is for hard questions only. Basis: the Mixture of Agents study, arXiv 2406.04692.

No paid per use keys until paying users cover them. Provider terms say apps must use API keys, not a person's chat subscription. Free Gemini content can be used by Google, so private material is routed to Groq, which does not train on API data. Known state: no provider key has ever been put into the site's Vercel settings, and the main chat only calls Anthropic. Still needed from Devan before that run: which providers his free keys are from.

## Testing against real paid models (agreed)

A small prepaid Anthropic API credit is set aside for testing only. It is used only for tiny real Claude calls through the test switch: a connection test on a cheap Claude model whose replies are saved and replayed in later tests, and the J1 live charge proof. Quality spot checks on paid models use the exact prepared message pasted into Devan's own Claude or ChatGPT chat. ANTHROPIC_API_KEY is not put into the site's Vercel settings until the J1 money fixes and the Developer Mode cost bypass removal are live. Free users run on the same free pool Devan tests with.

## J4 personalization (decided, Devan: "park it")

The Personalization Convergence System (the v1 to v5 plan and its audit machine) is parked. Nothing is deleted. The real feature gets built instead: fix personalOptimizer's right size detail bug (more detail and too brief currently both lower detail), connect the real PersonalOptimization feature in Settings in place of the preview only InteractivePersonalOptimization, never mark material as analyzed when it was clipped or skipped, add a proper importer for his exported chats, and run the learning on the J9 free pool with personal chats routed to Groq. Every learned rule is visible to Devan and deletable, and never changes the meaning of his request.

## J11 answers built for divergent minds (new)

Devan: "There's one more issue we need to address and its likely one of the largest. With 2%ior something incredibly small having been done. practicly untouchewd. all that exists ois the data i looked up and daved to aid in its procurment." and "changing the way the ai answers, so its ideal for divergents" and "no prompt getting it to respond a certain way, though we need to close those gaps too. i mean literally what percentage of what is important, all of that jazz"

Meaning: not a style line in a prompt. Work out from his saved research what actually matters to a divergent reader in an answer and how much each part matters, build answers around that, and also close the existing prompt gaps. A known gap: overwhelmed detection sets directness 1, whose encoding tells the model to scaffold generously with extra context, gentle framing and reassurance (src/services/detection/impacts.ts, src/services/composition/templates.ts), which conflicts with the default output rule in the same file (at most 3 short paragraphs, lead with the most important point). Process: a J11 solve run from his saved research, a Claude review, then a J11 build run. His saved research is in his chat exports, and Claude gathers it for the solve run.
