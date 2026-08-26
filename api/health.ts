/// <reference types="node" />
import { deploymentHealth } from "../src/services/deploymentHealth.js";

export const config = { runtime: "edge" };

export default function handler(request: Request): Response {
  return deploymentHealth(request, {
    VERCEL_GIT_COMMIT_SHA: process.env.VERCEL_GIT_COMMIT_SHA,
    VERCEL_ENV: process.env.VERCEL_ENV,
  });
}
