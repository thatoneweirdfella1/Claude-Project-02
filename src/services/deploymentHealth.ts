export interface DeploymentIdentity {
  status: "ok";
  commit: string;
  branch: string;
  environment: string;
}

export function deploymentHealth(request: Request, env: {
  VERCEL_GIT_COMMIT_SHA?: string;
  VERCEL_GIT_COMMIT_REF?: string;
  VERCEL_ENV?: string;
}): Response {
  if (request.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "content-type": "application/json" },
    });
  }
  const body: DeploymentIdentity = {
    status: "ok",
    commit: env.VERCEL_GIT_COMMIT_SHA ?? "local",
    branch: env.VERCEL_GIT_COMMIT_REF ?? "local",
    environment: env.VERCEL_ENV ?? "local",
  };
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
    },
  });
}
