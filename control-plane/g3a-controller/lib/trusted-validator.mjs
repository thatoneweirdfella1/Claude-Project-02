const SHA = /^[0-9a-f]{40}$/;
const regex = pattern => new RegExp(`^${pattern.split("**").map(part => part.split("*").map(x => x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("[^/]*")).join(".*")}$`);
export const pathAllowed = (path, patterns) => patterns.some(pattern => regex(pattern).test(path));

export async function validateHostChange({ github, repositoryId, repositoryFullName, stagingBranch, baseSha, candidateSha, allowedPaths }) {
  const failures = [];
  if (!SHA.test(baseSha || "") || !SHA.test(candidateSha || "")) failures.push("invalid-sha");
  const repository = await github(`/repositories/${repositoryId}`);
  if (repository.id !== repositoryId || repository.full_name !== repositoryFullName) failures.push("repository-mismatch");
  const ref = await github(`/repos/${repositoryFullName}/git/ref/heads/${encodeURIComponent(stagingBranch)}`);
  if (ref.object?.sha !== candidateSha) failures.push("candidate-not-remote-staging-head");
  const comparison = await github(`/repos/${repositoryFullName}/compare/${baseSha}...${candidateSha}`);
  if (!["ahead", "identical"].includes(comparison.status)) failures.push("candidate-not-descendant-of-base");
  for (const file of comparison.files || []) {
    if (!pathAllowed(file.filename, allowedPaths)) failures.push(`out-of-scope:${file.filename}`);
    if (file.status === "removed") failures.push(`deletion:${file.filename}`);
  }
  return { passed: failures.length === 0, failures, repository_id: repository.id, base_sha: baseSha, candidate_sha: candidateSha, observed_staging_sha: ref.object?.sha, changed_files: (comparison.files || []).map(x => ({ path: x.filename, status: x.status })) };
}
