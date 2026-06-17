# Saving unfinished projects in OBS

*2026-04-26T00:13:54.492262Z*

---


**HUMAN:**
im confused, how do i save an unfinished project in obs


**ASSISTANT:**
 OBS autosaves your scene setup constantly, so you don't need to do anything special. Your scenes, sources, and settings are all saved automatically.

What doesn't autosave: your **recording** if you haven't stopped it yet.

What are you trying to preserve? A recording in progress, or a scene setup you've been building?


**HUMAN:**
yeah but i need to start a new project, how the hell would i know where the old one is


**ASSISTANT:**
 OBS doesn't really have "projects" the way Premiere or DaVinci do. It uses **Scene Collections** instead.

Here's the move:

1. Go to **Scene Collection** in the top menu
2. Click **Duplicate** (saves your current setup as a copy)
3. Name it something you'll recognize
4. Then create a new one for your new setup

Your old one lives at Scene Collection > and you just click it to switch back.

All scene collections are stored locally at:
`C:\Users\[you]\AppData\Roaming\obs-studio\basic\scenes\`

Each one is just a JSON file with your scene name.
