import { createHmac, createPrivateKey, sign, timingSafeEqual } from "node:crypto";
import { authoritativeCheck } from "./github-events.mjs";
import { validateHostChange } from "./trusted-validator.mjs";

const b64 = value => Buffer.from(JSON.stringify(value)).toString("base64url");
export class GitHubHost {
  constructor(config, fetchImpl = fetch) { this.config = config; this.fetch = fetchImpl; this.token = null; this.tokenExpires = 0; }
  async appToken() {
    if (this.token && Date.now() < this.tokenExpires - 60_000) return this.token;
    const now = Math.floor(Date.now() / 1000), unsigned = `${b64({ alg: "RS256", typ: "JWT" })}.${b64({ iat: now - 30, exp: now + 540, iss: this.config.appId })}`;
    const jwt = `${unsigned}.${sign("RSA-SHA256", Buffer.from(unsigned), createPrivateKey(this.config.privateKey)).toString("base64url")}`;
    const response = await this.fetch(`https://api.github.com/app/installations/${this.config.installationId}/access_tokens`, { method: "POST", headers: { authorization: `Bearer ${jwt}`, accept: "application/vnd.github+json", "x-github-api-version": "2022-11-28" } });
    if (!response.ok) throw new Error(`GitHub installation token HTTP ${response.status}`);
    const data = await response.json(); this.token = data.token; this.tokenExpires = Date.parse(data.expires_at); return this.token;
  }
  async github(path, options = {}) {
    const response = await this.fetch(`https://api.github.com${path}`, { ...options, headers: { authorization: `Bearer ${await this.appToken()}`, accept: "application/vnd.github+json", "x-github-api-version": "2022-11-28", "content-type": "application/json", ...options.headers } });
    if (!response.ok) throw new Error(`GitHub API ${response.status} ${path}`); return response.status === 204 ? null : response.json();
  }
  signAttestation(attestation) { return createHmac("sha256", this.config.attestationSecret).update(JSON.stringify(attestation)).digest("hex"); }
  async verifyAttestation(attestation) {
    if (!attestation?.host_signature) return false;
    const { host_signature: supplied, ...unsigned } = attestation, expected = this.signAttestation(unsigned);
    const a = Buffer.from(supplied), b = Buffer.from(expected); return a.length === b.length && timingSafeEqual(a, b);
  }
  async getRemoteTruth(repositoryId) {
    const repository = await this.github(`/repositories/${repositoryId}`), ref = await this.github(`/repos/${this.config.repositoryFullName}/git/ref/heads/${encodeURIComponent(this.config.stagingBranch)}`);
    if (repository.id !== repositoryId || repository.full_name !== this.config.repositoryFullName) throw new Error("Host repository mismatch");
    return { repository_id: repository.id, repository_full_name: repository.full_name, staging_branch: this.config.stagingBranch, staging_sha: ref.object?.sha };
  }
  async runTrustedValidation({ repositoryId, baseSha, candidateSha, allowedPaths, policyVersion }) {
    if (policyVersion !== this.config.releaseDigest) throw new Error("Controller release mismatch");
    return validateHostChange({ github: this.github.bind(this), repositoryId, repositoryFullName: this.config.repositoryFullName, stagingBranch: this.config.stagingBranch, baseSha, candidateSha, allowedPaths });
  }
  async publishCheck({ repositoryId, candidateSha, conclusion, policyVersion }) {
    if (policyVersion !== this.config.releaseDigest) throw new Error("Controller release mismatch");
    const failed = conclusion === "failure";
    const body = authoritativeCheck({ repositoryId, candidateSha, controllerReleaseDigest: this.config.releaseDigest, validation: failed ? "failed" : "passed", audit: failed ? "Failed" : "Independently verified", decisionState: "none" });
    return this.github(`/repos/${this.config.repositoryFullName}/check-runs`, { method: "POST", body: JSON.stringify(body) });
  }
}
