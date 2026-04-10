// /api/mcp — Streamable HTTP endpoint dla MCP servera.
// Stateless (serverless-friendly). Obsluguje POST (JSON-RPC) i GET (SSE).

import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { createMcpServer } from "@/lib/mcp-server";

// Stateless — nowy transport per request
async function handleMcpRequest(req: Request): Promise<Response> {
  const server = createMcpServer();
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined, // stateless
    enableJsonResponse: true,
  });

  await server.connect(transport);

  const response = await transport.handleRequest(req);
  return response;
}

export async function POST(req: Request): Promise<Response> {
  return handleMcpRequest(req);
}

export async function GET(req: Request): Promise<Response> {
  return handleMcpRequest(req);
}

export async function DELETE(): Promise<Response> {
  // Stateless — brak sesji do zamykania
  return new Response(null, { status: 405 });
}
