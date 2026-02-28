import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import * as wikitree from "wikitree-js";
import express from "express";

const WIKITREE_APP_ID = process.env.WIKITREE_APP_ID || "WikiTreeMCP";

export class WikiTreeServer {
  private server: Server;
  private auth?: wikitree.WikiTreeAuthentication;

  constructor() {
    this.server = new Server(
      {
        name: "wikitree-server",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupTools();
  }

  private async getAuth(): Promise<wikitree.WikiTreeAuthentication | undefined> {
    if (this.auth) return this.auth;
    const email = process.env.WIKITREE_EMAIL;
    const password = process.env.WIKITREE_PASSWORD;
    if (email && password) {
      try {
        this.auth = await wikitree.login(email, password);
        return this.auth;
      } catch (error) {
        console.error("WikiTree login failed:", error);
      }
    }
    return undefined;
  }

  private setupTools() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: "get_person",
          description: "Retrieve a single person record from WikiTree",
          inputSchema: {
            type: "object",
            properties: {
              key: { type: "string", description: "WikiTree ID (e.g., 'Smith-1')" },
              bioFormat: { type: "string", enum: ["wiki", "html", "both"], description: "Format of the biography" },
              fields: { type: "array", items: { type: "string" }, description: "Fields to retrieve" },
              resolveRedirect: { type: "boolean", description: "Whether to resolve redirects" },
            },
            required: ["key"],
          },
        },
        {
          name: "get_ancestors",
          description: "Retrieve ancestors for a given person ID",
          inputSchema: {
            type: "object",
            properties: {
              key: { type: "string", description: "WikiTree ID" },
              depth: { type: "number", description: "Number of generations to retrieve" },
              bioFormat: { type: "string", enum: ["wiki", "html", "both"] },
              fields: { type: "array", items: { type: "string" } },
              resolveRedirect: { type: "boolean" },
            },
            required: ["key"],
          },
        },
        {
          name: "get_descendants",
          description: "Retrieve descendants for a given person ID",
          inputSchema: {
            type: "object",
            properties: {
              key: { type: "string", description: "WikiTree ID" },
              depth: { type: "number", description: "Number of generations to retrieve" },
              bioFormat: { type: "string", enum: ["wiki", "html", "both"] },
              fields: { type: "array", items: { type: "string" } },
              resolveRedirect: { type: "boolean" },
            },
            required: ["key"],
          },
        },
        {
          name: "get_relatives",
          description: "Retrieve relatives for a given person ID or list of IDs",
          inputSchema: {
            type: "object",
            properties: {
              keys: { type: "array", items: { type: "string" }, description: "WikiTree IDs" },
              getParents: { type: "boolean" },
              getChildren: { type: "boolean" },
              getSpouses: { type: "boolean" },
              getSiblings: { type: "boolean" },
              bioFormat: { type: "string", enum: ["wiki", "html", "both"] },
              fields: { type: "array", items: { type: "string" } },
            },
            required: ["keys"],
          },
        },
        {
          name: "call_api",
          description: "Call any WikiTree API endpoint directly",
          inputSchema: {
            type: "object",
            properties: {
              action: { type: "string", description: "WikiTree API action (e.g., 'searchPerson')" },
              params: { type: "object", description: "Parameters for the action", additionalProperties: true },
            },
            required: ["action"],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      const auth = await this.getAuth();
      const options = { auth, appId: WIKITREE_APP_ID };

      try {
        switch (name) {
          case "get_person": {
            const { key, bioFormat, fields, resolveRedirect } = args as any;
            const person = await wikitree.getPerson(key, { bioFormat, fields, resolveRedirect }, options);
            return { content: [{ type: "text", text: JSON.stringify(person, null, 2) }] };
          }
          case "get_ancestors": {
            const { key, depth, bioFormat, fields, resolveRedirect } = args as any;
            const ancestors = await wikitree.getAncestors(key, { depth, bioFormat, fields, resolveRedirect }, options);
            return { content: [{ type: "text", text: JSON.stringify(ancestors, null, 2) }] };
          }
          case "get_descendants": {
            const { key, depth, bioFormat, fields, resolveRedirect } = args as any;
            const descendants = await wikitree.getDescendants(key, { depth, bioFormat, fields, resolveRedirect }, options);
            return { content: [{ type: "text", text: JSON.stringify(descendants, null, 2) }] };
          }
          case "get_relatives": {
            const { keys, getParents, getChildren, getSpouses, getSiblings, bioFormat, fields } = args as any;
            const relatives = await wikitree.getRelatives(keys, { getParents, getChildren, getSpouses, getSiblings, bioFormat, fields }, options);
            return { content: [{ type: "text", text: JSON.stringify(relatives, null, 2) }] };
          }
          case "call_api": {
            const { action, params } = args as any;
            const result = await wikitree.wikiTreeGet({ action, ...params }, options);
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
          }
          default:
            throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
        }
      } catch (error: any) {
        return {
          content: [{ type: "text", text: `Error: ${error.message}` }],
          isError: true,
        };
      }
    });
  }

  async runStdio() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("WikiTree MCP Server running on stdio");
  }

  async runSSE(port: number) {
    const app = express();
    app.use(express.json());

    const transports = new Map<string, SSEServerTransport>();

    app.get("/sse", async (req, res) => {
      const transport = new SSEServerTransport("/messages", res);
      const transportId = transport.sessionId;
      transports.set(transportId, transport);
      
      await this.server.connect(transport);

      res.on('close', () => {
        transports.delete(transportId);
      });
    });

    app.post("/messages", async (req, res) => {
      const sessionId = req.query.sessionId as string;
      const transport = transports.get(sessionId);

      if (transport) {
        try {
          await transport.handleMessage(req.body);
          res.status(200).send("OK");
        } catch (error: any) {
          console.error(`Error handling message for session ${sessionId}:`, error);
          res.status(500).send(error.message);
        }
      } else {
        res.status(400).send("No active SSE connection for session: " + sessionId);
      }
    });

    return new Promise<void>((resolve) => {
      app.listen(port, () => {
        console.error(`WikiTree MCP Server running on SSE at http://localhost:${port}/sse`);
      });
      // Handle process termination
      process.on('SIGINT', () => resolve());
      process.on('SIGTERM', () => resolve());
    });
  }
}
