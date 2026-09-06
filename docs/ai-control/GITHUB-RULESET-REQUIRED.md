# One-Time GitHub Enforcement Required

The repository validator is installed, but GitHub must be configured once so an AI cannot bypass a failed check by pushing directly.

The repository currently has one active ruleset, ID `20917696`, named `build`. It targets only `refs/heads/build`; it does not protect the working branch, safety branch, or branch creation required here.

## Working branch ruleset

Target only `divergence/reliability-v1` and enable:

- prevent deletion;
- block force pushes;
- require a pull request before merging;
- require one approval;
- require review from Code Owners;
- dismiss approvals when new commits are pushed;
- require the status check `Enforce one task, branch, scope, evidence, and history`;
- require the branch to be up to date before merging; and
- allow bypass only for the repository owner, never an AI application or automation account.

## Safety branch ruleset

Target only `claude/remaining-second-pass-v1` and enable:

- restrict updates;
- prevent deletion;
- block force pushes; and
- allow bypass only for the repository owner.

## New-branch restriction

Create a repository ruleset targeting all branches with branch creation restricted. Add only the repository owner to its bypass list. Existing branches remain available; AI applications and automation accounts receive no bypass.

## Completion evidence

G0 cannot be Independently verified until retained GitHub evidence shows these rules active and a deliberately invalid test change is rejected. Until then, the validator is installed and tested but external enforcement remains `Open`.
