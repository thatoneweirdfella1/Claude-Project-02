# Python script design for research database project

*2026-04-12T03:31:20.967585Z*

---


**HUMAN:**
check our conversation history for the p[roject we are working on . not just the one we made the report with but the included sessions with the add on groups. we now have 37 groups, we have to not just cross =reference but we have to make sure each of the 80 files i have that are not just the 37 groups but those same groups with add on names, duplicates, additions, and all in between so look in our history and find everything thats importantfor a script to save claude the absolute mlst tokens based on what u know. attached is the promptt oi had one claud ewrite for the other clauds tro answer so all andswers will be given to a single claude for it to combine all the good ideas in a python prompt.  that prompt is listed below


`I have been working with you on a research database project across multiple sessions in this project. You have full context of what the database contains, what the goals are, what problems exist, and what has been attempted so far.`
` `
`I want to build a Python script that runs locally on my machine and handles everything Python can handle for this project — so that future Claude sessions only ever have to do what only Claude can do.`
` `
`Without me telling you what the script should do: based solely on everything you already know about this project, what would you put in that script, why, and how would you build it?`
` `
`Be as specific and technical as possible. Cover every problem you think Python should solve, every output file it should produce, every edge case it should handle, and anything else you think matters. Do not hold back and do not assume someone else will cover it — write as if your response is the only input the final script will be built from.`
` `
`Do not write the full script yet. Design it.`


**ASSISTANT:**

```
This block is not supported on your current device yet.
```


```
This block is not supported on your current device yet.
```


```
This block is not supported on your current device yet.
```


```
This block is not supported on your current device yet.
```

Good. I have enough. Here's the full design brief synthesized from everything across all sessions.

---

**WHAT THE SCRIPT NEEDS TO DO — FULL DESIGN**

here's everything python can and should own so claude never touches it again.

**THE CORE PROBLEM SET**

you have 80 files. 37 of them are the primary group membership lists. the other 43 are variants. those variants include: add-on names (middle name present vs absent), alternate spellings, duplicate entries across files, name order flips (First Last vs Last First), entries with titles prepended (Dr., Sen., Lord), entries with post-nominal credentials appended (CBE, OBE, PhD), maiden names vs married names, and partial matches where the same person appears as "George Soros" in one file and "George S." in another. your scoring pipeline also exists but fuzzy matching was flagged as the next upgrade that never happened.

**MODULE 1 — INGESTION AND NORMALIZATION**

reads all 80 files. detects format per file (CSV, JSON, plain text, whatever mixture exists). strips titles, credentials, and honorifics into separate fields but preserves originals. normalizes to canonical form: lowercase, no punctuation, first last order. builds a master raw table with columns: raw name, normalized name, source file, source group, row number. outputs to `master_raw.csv`.

**MODULE 2 — FUZZY DEDUPLICATION ENGINE**

this is the one that was flagged and never built. uses rapidfuzz (not fuzzywuzzy, it's faster and more accurate). compares every normalized name against every other normalized name in the master raw table. threshold: 88 score for flagging, 95+ for auto-merge candidates. outputs three things: `confirmed_dupes.csv` (95+, same person, different file spellings), `review_dupes.csv` (88-94, needs human review), `clean_no_match.csv` (under 88, treated as unique). the review file is the one that actually matters because that's where the real ambiguity lives.

**MODULE 3 — CROSS-REFERENCE MATRIX BUILDER**

takes the deduplicated master and maps every person to every group they appear in. outputs `crossref_matrix.csv` with one row per person and boolean columns for each of the 37 groups plus any add-on designations. calculates overlap score: how many groups each person appears in. tier logic: 1 group = base, 2 groups = elevated, 3+ groups = tier 1 node. this is the scoring you already built but now it's running on clean deduplicated data instead of dirty raw data.

**MODULE 4 — VARIANT TRACKER**

the 43 non-primary files don't just contain duplicates. some contain legitimate additions that aren't in the primaries. this module diffs every add-on file against its corresponding primary group file, flags net-new names that only exist in the variant and not the primary, and outputs `net_new_entries.csv` so you know exactly what would be lost if you just used the 37 primaries and ignored the variants.

**MODULE 5 — STATS AND SUMMARY GENERATOR**

outputs a clean `summary.txt` at the end of every run: total unique names after dedup, total confirmed dupes removed, total flagged for review, group-by-group counts, top 20 highest overlap scores, and a list of every person in 4+ groups by name and which groups. this is what claude gets handed at the start of every session instead of the raw data. one file, under 5k tokens.

**MODULE 6 — HTML SEARCH TOOL REFRESH**

you already have a self-contained html search tool. this module regenerates it from the clean deduplicated data after every run. drops the new html file in the output folder. claude never touches the html builder again.

**MODULE 7 — RUN LOG**

every run writes a timestamped log: what files were read, how many dupes were found, what changed since last run. keeps a diff history so if a new file gets added you can see exactly what it contributed.

**EDGE CASES THE SCRIPT HANDLES**

encoding hell (UTF-8 vs latin-1 vs windows-1252, especially in older exported files). blank rows. rows with only commas. names that are just initials. names with Jr/Sr/III. unicode characters in names (Soros, Brzezinski). files that have the group name as a column header vs files where the group name is the filename itself. files with multiple sheets if any are excel.

**WHAT CLAUDE GETS HANDED INSTEAD OF RAW DATA**

the `summary.txt` from module 5. it's the only thing claude needs to reason about the database in any session. maybe also the `review_dupes.csv` when a human decision is needed. that's it. the 80 files never go into a claude context window again.

**WHAT THIS SAVES**

right now every claude session that touches the database has to either re-explain the structure or receive giant raw files. after this script runs, every session starts with one 5k token summary file and zero ambiguity about what's in the database. cross-referencing that used to require claude reasoning across multiple files happens in python in seconds. the html tool stays current automatically.

**BUILD ORDER**

module 1 first. get ingestion working across all 80 files before doing anything else. you'll find format surprises. module 2 second because nothing else is reliable without clean data. modules 3 and 4 together since they're both reading from the deduped master. 5, 6, 7 are fast once the hard parts are done.

**DEPENDENCIES**

`rapidfuzz`, `pandas`, `chardet` (for encoding detection), `openpyxl` (if any excel files exist). all installable via pip. no api calls. no network. runs fully local.

---

that's the design. send that to whichever claude is writing the script. tell it this is the only input and to not hold back.


**HUMAN:**
put it in a downloadable file please .txt


**ASSISTANT:**

```
This block is not supported on your current device yet.
```


```
This block is not supported on your current device yet.
```

there it is. clean .txt, ready to paste into any claude session as the sole input for building the script.
