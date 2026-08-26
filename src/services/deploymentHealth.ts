export interface DeploymentIdentity {
  status: "ok";
  layer: 7;
  commit: string;
  environment: string;
  connectedExecution: true;
}

export function deploymentHealth(request: Request, env: {
  VERCEL_GIT_COMMIT_SHA?: string;
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
    layer: 7,
    commit: env.VERCEL_GIT_COMMIT_SHA ?? "local",
    environment: env.VERCEL_ENV ?? "local",
    connectedExecution: true,
  };
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
    },
  });
}
