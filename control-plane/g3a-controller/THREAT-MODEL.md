# G3-A Controller Threat Model

The deployed preview controller, its Vercel project access, Redis credentials, GitHub App private key, webhook secret, and worker callback credentials form the trusted boundary. The candidate repository, candidate workflows, candidate tests, repository state files, author/auditor labels, pull-request text, and worker-supplied completion claims are untrusted.

The controller derives repository ID, branch, base SHA, candidate SHA, delivery ID, installation ID, and GitHub actor from signed GitHub payloads and GitHub API readback. It validates changed paths using policy bundled into the deployed release and never imports or executes candidate validators, workflows, tests, policies, or manifests. A release digest is embedded in every Check Run external ID.

Compromise of Vercel project administration, Redis administration, the GitHub App private key, or both separated worker credentials remains outside G3-A's technical guarantee. Candidate-branch writes alone are inside the hostile model and cannot update the manually deployed controller release.

The service remains in `observe` mode until G3A-01 through G3A-10 hostile verification succeeds. Observe mode verifies and durably records signed deliveries but cannot publish a successful authoritative verdict or advance a task.
