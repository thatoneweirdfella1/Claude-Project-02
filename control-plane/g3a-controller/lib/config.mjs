const required = (env, key) => { if (!env[key]) throw new Error(`Missing ${key}`); return env[key]; };
export function loadConfig(env = process.env) {
  const repositoryId = Number(env.GITHUB_REPOSITORY_ID || 1272469738);
  if (repositoryId !== 1272469738) throw new Error("Unexpected repository ID");
  return {
    mode: env.CONTROLLER_MODE || "observe",
    repositoryId,
    repositoryFullName: env.GITHUB_REPOSITORY_FULL_NAME || "thatoneweirdfella1/Claude-Project-02",
    stagingBranch: env.GITHUB_STAGING_BRANCH || "divergence/reliability-staging",
    appId: required(env, "GITHUB_APP_ID"), installationId: required(env, "GITHUB_INSTALLATION_ID"),
    privateKey: required(env, "GITHUB_APP_PRIVATE_KEY").replace(/\\n/g, "\n"),
    webhookSecret: required(env, "GITHUB_WEBHOOK_SECRET"), attestationSecret: required(env, "ATTESTATION_SECRET"),
    releaseDigest: required(env, "CONTROLLER_RELEASE_DIGEST"), redisUrl: required(env, "UPSTASH_REDIS_REST_URL"), redisToken: required(env, "UPSTASH_REDIS_REST_TOKEN"),
    cronSecret: required(env, "CRON_SECRET"), bootstrapSecret: required(env, "BOOTSTRAP_SECRET"),
    author: { principal: required(env, "AUTHOR_WORKER_PRINCIPAL"), token: required(env, "AUTHOR_WORKER_TOKEN"), url: env.AUTHOR_WORKER_URL },
    auditor: { principal: required(env, "AUDITOR_WORKER_PRINCIPAL"), token: required(env, "AUDITOR_WORKER_TOKEN"), url: env.AUDITOR_WORKER_URL }
  };
}
