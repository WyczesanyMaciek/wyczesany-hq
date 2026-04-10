// Wyczesany HQ — MCP server (Etap 9).
// Reusuje istniejace server actions i query jako cienka warstwa.
// Stateless (serverless-friendly). Bez autoryzacji (Etap 8 magic link).

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod/v4";
import { getContextTree } from "@/lib/queries/contexts";
import { getContextDashboard, getGlobalStats } from "@/lib/queries/dashboard";
import { prisma } from "@/lib/db";

export function createMcpServer() {
  const server = new McpServer({
    name: "wyczesany-hq",
    version: "1.0.0",
  });

  // ---- 1. list_contexts ----
  server.registerTool(
    "list_contexts",
    {
      title: "List Contexts",
      description:
        "Returns the hierarchical tree of all contexts (projects areas) with aggregated counts of projects, tasks, ideas, and problems.",
    },
    async () => {
      const tree = await getContextTree();
      return {
        content: [{ type: "text" as const, text: JSON.stringify(tree, null, 2) }],
      };
    }
  );

  // ---- 2. get_context_dashboard ----
  server.registerTool(
    "get_context_dashboard",
    {
      title: "Get Context Dashboard",
      description:
        "Returns dashboard data for a specific context: projects, loose tasks, ideas, problems — aggregated from this context and all descendants.",
      inputSchema: {
        contextId: z.string().describe("ID of the context"),
      },
    },
    async ({ contextId }) => {
      const data = await getContextDashboard(contextId);
      if (!data) {
        return {
          content: [{ type: "text" as const, text: "Context not found." }],
          isError: true,
        };
      }
      return {
        content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
      };
    }
  );

  // ---- 3. get_global_dashboard ----
  server.registerTool(
    "get_global_dashboard",
    {
      title: "Get Global Dashboard",
      description:
        "Returns global counts: active projects, open tasks, ideas, problems across all contexts.",
    },
    async () => {
      const stats = await getGlobalStats();
      return {
        content: [{ type: "text" as const, text: JSON.stringify(stats, null, 2) }],
      };
    }
  );

  // ---- 4. add_task ----
  server.registerTool(
    "add_task",
    {
      title: "Add Task",
      description:
        "Create a new task. Provide contextId for a loose task, or projectId to add it to a specific project.",
      inputSchema: {
        contextId: z.string().optional().describe("Context ID (for loose task)"),
        projectId: z.string().optional().describe("Project ID (to add task to project)"),
        title: z.string().describe("Task title"),
        priority: z.number().min(0).max(3).optional().describe("Priority: 0=none, 1=low, 2=medium, 3=high"),
        deadline: z.string().optional().describe("Deadline in YYYY-MM-DD format"),
      },
    },
    async ({ contextId, projectId, title, priority, deadline }) => {
      // Walidacja
      if (!contextId && !projectId) {
        return {
          content: [{ type: "text" as const, text: "Provide contextId or projectId." }],
          isError: true,
        };
      }

      let resolvedContextId = contextId;
      if (projectId && !contextId) {
        const project = await prisma.project.findUnique({
          where: { id: projectId },
          select: { contextId: true },
        });
        if (!project) {
          return { content: [{ type: "text" as const, text: "Project not found." }], isError: true };
        }
        resolvedContextId = project.contextId;
      }

      const last = await prisma.task.findFirst({
        where: projectId ? { projectId } : { contextId: resolvedContextId!, projectId: null },
        orderBy: { order: "desc" },
        select: { order: true },
      });

      const task = await prisma.task.create({
        data: {
          title,
          contextId: resolvedContextId!,
          projectId: projectId ?? null,
          priority: priority ?? 0,
          deadline: deadline ? new Date(deadline) : null,
          order: (last?.order ?? -1) + 1,
        },
      });

      return {
        content: [{ type: "text" as const, text: JSON.stringify({ id: task.id, title: task.title }) }],
      };
    }
  );

  // ---- 5. add_idea ----
  server.registerTool(
    "add_idea",
    {
      title: "Add Idea",
      description: "Add a new idea (raw thought) to a context. Ideas can later be converted to tasks or projects.",
      inputSchema: {
        contextId: z.string().describe("Context ID"),
        content: z.string().max(500).describe("Idea content (max 500 chars)"),
      },
    },
    async ({ contextId, content }) => {
      const ctx = await prisma.context.findUnique({ where: { id: contextId } });
      if (!ctx) {
        return { content: [{ type: "text" as const, text: "Context not found." }], isError: true };
      }
      const idea = await prisma.idea.create({ data: { content, contextId } });
      return {
        content: [{ type: "text" as const, text: JSON.stringify({ id: idea.id }) }],
      };
    }
  );

  // ---- 6. add_problem ----
  server.registerTool(
    "add_problem",
    {
      title: "Add Problem",
      description: "Add a new problem (blocker) to a context. Problems can later be converted to tasks or projects.",
      inputSchema: {
        contextId: z.string().describe("Context ID"),
        content: z.string().max(500).describe("Problem content (max 500 chars)"),
      },
    },
    async ({ contextId, content }) => {
      const ctx = await prisma.context.findUnique({ where: { id: contextId } });
      if (!ctx) {
        return { content: [{ type: "text" as const, text: "Context not found." }], isError: true };
      }
      const problem = await prisma.problem.create({ data: { content, contextId } });
      return {
        content: [{ type: "text" as const, text: JSON.stringify({ id: problem.id }) }],
      };
    }
  );

  // ---- 7. add_note ----
  server.registerTool(
    "add_note",
    {
      title: "Add Note",
      description: "Add a freeform note to a context or project.",
      inputSchema: {
        contextId: z.string().describe("Context ID"),
        content: z.string().describe("Note content"),
        projectId: z.string().optional().describe("Project ID (optional — note belongs to project)"),
      },
    },
    async ({ contextId, content, projectId }) => {
      const ctx = await prisma.context.findUnique({ where: { id: contextId } });
      if (!ctx) {
        return { content: [{ type: "text" as const, text: "Context not found." }], isError: true };
      }
      const note = await prisma.note.create({
        data: { content, contextId, projectId: projectId ?? null },
      });
      return {
        content: [{ type: "text" as const, text: JSON.stringify({ id: note.id }) }],
      };
    }
  );

  // ---- 8. toggle_task ----
  server.registerTool(
    "toggle_task",
    {
      title: "Toggle Task Done",
      description: "Toggle a task between done and not done.",
      inputSchema: {
        taskId: z.string().describe("Task ID"),
      },
    },
    async ({ taskId }) => {
      const task = await prisma.task.findUnique({ where: { id: taskId }, select: { done: true } });
      if (!task) {
        return { content: [{ type: "text" as const, text: "Task not found." }], isError: true };
      }
      const updated = await prisma.task.update({
        where: { id: taskId },
        data: { done: !task.done },
        select: { id: true, done: true },
      });
      return {
        content: [{ type: "text" as const, text: JSON.stringify(updated) }],
      };
    }
  );

  // ---- 9. list_tasks ----
  server.registerTool(
    "list_tasks",
    {
      title: "List Tasks",
      description: "List tasks with optional filters: by context, project, or done status.",
      inputSchema: {
        contextId: z.string().optional().describe("Filter by context ID"),
        projectId: z.string().optional().describe("Filter by project ID"),
        done: z.boolean().optional().describe("Filter by done status"),
      },
    },
    async ({ contextId, projectId, done }) => {
      const where: Record<string, unknown> = {};
      if (contextId) where.contextId = contextId;
      if (projectId) where.projectId = projectId;
      if (done !== undefined) where.done = done;

      const tasks = await prisma.task.findMany({
        where,
        orderBy: [{ done: "asc" }, { order: "asc" }],
        take: 50,
        select: {
          id: true,
          title: true,
          done: true,
          priority: true,
          deadline: true,
          projectId: true,
          contextId: true,
        },
      });

      return {
        content: [{ type: "text" as const, text: JSON.stringify(tasks, null, 2) }],
      };
    }
  );

  // ---- 10. create_project ----
  server.registerTool(
    "create_project",
    {
      title: "Create Project",
      description: "Create a new project in a context.",
      inputSchema: {
        contextId: z.string().describe("Context ID"),
        name: z.string().describe("Project name"),
        description: z.string().optional().describe("Project description"),
      },
    },
    async ({ contextId, name, description }) => {
      const ctx = await prisma.context.findUnique({ where: { id: contextId } });
      if (!ctx) {
        return { content: [{ type: "text" as const, text: "Context not found." }], isError: true };
      }
      const last = await prisma.project.findFirst({
        where: { contextId },
        orderBy: { order: "desc" },
        select: { order: true },
      });
      const project = await prisma.project.create({
        data: {
          name,
          description: description ?? null,
          contextId,
          order: (last?.order ?? -1) + 1,
        },
      });
      return {
        content: [{ type: "text" as const, text: JSON.stringify({ id: project.id, name: project.name }) }],
      };
    }
  );

  return server;
}
