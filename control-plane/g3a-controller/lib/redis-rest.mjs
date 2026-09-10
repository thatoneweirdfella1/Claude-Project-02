export class RedisError extends Error {}

export class RedisRest {
  constructor({ url, token, fetchImpl = fetch }) {
    if (!url || !token) throw new RedisError("Redis URL and token are required");
    this.url = url.replace(/\/$/, ""); this.token = token; this.fetch = fetchImpl;
  }

  async command(...command) {
    const response = await this.fetch(this.url, {
      method: "POST",
      headers: { authorization: `Bearer ${this.token}`, "content-type": "application/json" },
      body: JSON.stringify(command)
    });
    if (!response.ok) throw new RedisError(`Redis HTTP ${response.status}`);
    const payload = await response.json();
    if (payload.error) throw new RedisError(payload.error);
    return payload.result;
  }
}
