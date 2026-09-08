export async function rawBody(request) {
  if (typeof request.body === "string") return request.body;
  if (Buffer.isBuffer(request.body)) return request.body.toString("utf8");
  const chunks = []; for await (const chunk of request) chunks.push(Buffer.from(chunk)); return Buffer.concat(chunks).toString("utf8");
}
export function send(response, status, body) { response.statusCode = status; response.setHeader("content-type", "application/json"); response.end(JSON.stringify(body)); }
export const bearer = request => String(request.headers.authorization || "").replace(/^Bearer\s+/i, "");
