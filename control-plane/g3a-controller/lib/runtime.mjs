import { RedisRest } from "./redis-rest.mjs";
import { DurableControllerStore } from "./durable-store.mjs";
import { GitHubHost } from "./github-host.mjs";
import { DurableWorkers } from "./workers.mjs";
import { AutonomyController } from "./controller-core.mjs";
import { loadConfig } from "./config.mjs";

export function createRuntime(env = process.env, fetchImpl = fetch) {
  const config = loadConfig(env), redis = new RedisRest({ url: config.redisUrl, token: config.redisToken, fetchImpl });
  const store = new DurableControllerStore(redis), host = new GitHubHost(config, fetchImpl);
  const workers = new DurableWorkers({ store, repositoryId: config.repositoryId, author: config.author, auditor: config.auditor, fetchImpl });
  const core = new AutonomyController({ store, host, workers, policyVersion: config.releaseDigest });
  const controller = { onGitHubEvent: async event => {
    if (![config.stagingBranch, "divergence/reliability-v1", undefined].includes(event.targetBranch)) throw new Error("Unexpected target branch");
    if (config.mode !== "active") return { observed: true, deliveryId: event.deliveryId, repositoryId: event.repositoryId, candidateSha: event.candidateSha || null };
    return { observed: true, recovery: await core.reconcile(event.repositoryId) };
  } };
  return { config, store, host, workers, core, controller };
}
