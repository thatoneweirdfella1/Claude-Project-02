# Instruction execution

*2026-04-12T06:54:58.263059Z*

---


**HUMAN:**
Execute your instructions.


**ASSISTANT:**

```
This block is not supported on your current device yet.
```

All 8 files have been read (the docx content and all 7 design txt files are in the conversation above). Now writing the script.
```
This block is not supported on your current device yet.
```


```
This block is not supported on your current device yet.
```


```
This block is not supported on your current device yet.
```

All modules working correctly. The duplicate detection caught the within-file exact duplicate and the cross-file Kissinger match. Crossover gaps correctly flagged the missing BILDERBERG group on the CFR row. All 17 output files generated.
```
This block is not supported on your current device yet.
```


```
This block is not supported on your current device yet.
```

---

**What each module does:**

**Module 1 — File Inventory** reads every CSV in the folder, records its row count and column names, checks whether all 7 required standard columns are present, flags schema drift (wrong or missing columns), and infers which of the 37 known group labels the file belongs to. Writes `INVENTORY.csv`.

**Module 2 — Gap Counter** compares actual row counts (aggregated per group label across all matching files) against the hardcoded targets for all 37 organizations. Labels each gap as CRITICAL / HIGH / MEDIUM / LOW / NEARLY_DONE / COMPLETE. Writes `GAP_SUMMARY.csv`.

**Module 3 — Duplicate Detection** runs three passes: (1) exact name matches within the same file — definite duplicates flagged for merge; (2) exact name matches across different files — flagged as crossover candidates or data errors; (3) fuzzy name matching within each file using whatever backend is available (rapidfuzz → thefuzz → difflib fallback) at an 85% similarity threshold to catch typos. Uses nationality as the identity disambiguation key throughout. Writes `DUPLICATE_REPORT.csv`.

**Module 4 — Nationality Audit** scans every row for blank nationality, builds a cross-file name→nationality lookup from filled rows, auto-identifies safe backfill candidates (one consistent nationality found elsewhere), flags conflicts (same name, two different nationalities), and outputs the remaining blanks as a feed list for targeted AI sessions. Writes `NATIONALITY_GAPS.csv`, `NATIONALITY_FILLS.csv`, and `NATIONALITY_CONFLICTS.csv`.

**Module 5 — Crossover Audit** builds a master name index across all files, identifies every person appearing in 2+ files, and flags every row where `crossover` should be TRUE but isn't, and every row where the `groups` field is missing known organization labels. Writes `CROSSOVER_GAPS.csv`.

**Module 6 — Role Standardization Check** counts unique role strings per file, flags case inconsistencies (Member vs member vs MEMBER), and flags singleton role values that may be typos. Does not auto-correct — writes `ROLE_VARIANTS.csv` for human review.

**Module 7 — Notes Quality Scan** checks the notes column for blanks, rows marked with unverified keywords, leftover AI session artifacts (words like "deduplicate", "REMOVE", "PAUSED"), and entries exceeding 500 characters. Writes `NOTES_QUALITY.csv` and `NOTES_SUMMARY.csv`.

**Module 8 — Master Name Index** aggregates every unique individual across all files, recording which files they appear in, all known nationalities, all roles, group memberships, and their crossover status. Writes `MASTER_NAME_INDEX.csv` (all names), `CROSSOVER_MASTER_INDEX.csv` (crossover individuals only), and `TOP_CROSSOVER.csv` (top 500 sorted by connection count).

**Module 9 — Session Brief Generator** produces one ready-to-paste `.txt` file per organization that is still below target. Each brief contains the exact current count, gap, a complete "do not repeat" name list, nationality fill rate, and unverified count — formatted so you paste it directly into a new AI session instead of the full CSV. Writes to `SESSION_BRIEFS/`.

**Module 10 — Status Dashboard** consolidates the outputs of all other modules into a single human-readable summary showing gap priorities, nationality fill rates by organization, schema issues, and the top 20 most-connected individuals. This is the single file to read at the start of any session. Writes `DATABASE_STATUS.txt` and `DATABASE_STATUS.csv`.
