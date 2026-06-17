# Adding Bilderberg years to members list

*2026-04-09T17:40:51.977794Z*

---


**HUMAN:**
do youi think you can add bildiberg 1955 , and 1981 to the bildiberg members list please?


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

Now I'll read the skill file, then run the merge script.
```
This block is not supported on your current device yet.
```


```
This block is not supported on your current device yet.
```

All columns match. Now I'll merge the data intelligently — if a person already exists in the members list, I'll add the new year to their `years_active` rather than creating a duplicate row.
```
This block is not supported on your current device yet.
```


```
This block is not supported on your current device yet.
```

Done! Here's a summary of what happened:

- **232 new members added** from the 1955 and 1981 lists
- **0 duplicates found** — no one in the 1955 or 1981 lists shared an exact name match with the existing members list (which appears to have covered mostly 1996+ attendees), so all entries were added as new rows
- The list is sorted alphabetically by name
- **Total rows grew from 431 → 663**

The updated file keeps all the original columns (`name`, `groups`, `years_active`, `role`, `nationality`, `crossover`, `notes`). If you'd like me to also merge in the other years (1982–1989), just say the word!


**HUMAN:**
now add 1982, 1983, and 1984 please


**ASSISTANT:**

```
This block is not supported on your current device yet.
```

1984 has a different format. I'll handle that separately.
```
This block is not supported on your current device yet.
```


```
This block is not supported on your current device yet.
```

Done! Here's the summary for this round:

- **105 existing members** had 1982, 1983, or 1984 added to their `years_active` (repeat attendees)
- **182 new members** were added as fresh rows
- **Total rows grew from 663 → 845**

Note: the 1984 file had a different column format (Year/Country_Code/Name/Role/Notes) so I normalized it to match the standard structure before merging. Ready to add 1985–1989 whenever you are!


**HUMAN:**
go


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

All done! Here's the summary for 1985–1989:

- **290 existing members** had new years appended to their `years_active`
- **274 new members** added as fresh rows
- **Total rows grew from 845 → 1,119**

The file now covers 1955, 1981–1989, and the original 1996+ data — all merged, deduplicated, and sorted alphabetically. Let me know what's next!
