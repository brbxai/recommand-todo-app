import { Server } from "@recommand/lib/api";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { db } from "@recommand/db";
import { tasks } from "../db/schema";
import { eq, asc } from "drizzle-orm";
import { actionFailure, actionSuccess } from "@recommand/lib/utils";
import { logger } from "../index";

const server = new Server();

// Get all tasks
const getAllTasks = server.get("/tasks", async (c) => {
  try {
    const allTasks = await db.select().from(tasks).orderBy(asc(tasks.id));
    return c.json(actionSuccess({ tasks: allTasks }));
  } catch (e) {
    console.error(e);
    return c.json(actionFailure("Failed to fetch tasks"), 500);
  }
});

// Get a single task by ID
const getTaskById = server.get(
  "/tasks/:id",
  async (c) => {
    try {
      const id = parseInt(c.req.param("id"));
      if (isNaN(id)) {
        return c.json(actionFailure("Invalid ID"), 400);
      }

      const task = await db.select().from(tasks).where(eq(tasks.id, id));
      
      if (task.length === 0) {
        return c.json(actionFailure("Task not found"), 404);
      }

      return c.json(actionSuccess({ task: task[0] }));
    } catch (e) {
      console.error(e);
      return c.json(actionFailure("Failed to fetch task"), 500);
    }
  }
);

// Create a new task
const createTask = server.post(
  "/tasks",
  zValidator(
    "json",
    z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      completed: z.boolean().optional(),
    })
  ),
  async (c) => {
    logger.info("Creating task");
    try {
      const data = c.req.valid("json");
      logger.info(data);
      const result = await db.insert(tasks).values({
        title: data.title,
        description: data.description || "Default description",
        completed: data.completed !== undefined ? data.completed : false,
      }).returning();

      return c.json(actionSuccess({ task: result[0] }), 201);
    } catch (e) {
      console.error(e);
      return c.json(actionFailure("Failed to create task"), 500);
    }
  }
);

// Update a task
const updateTask = server.put(
  "/tasks/:id",
  zValidator(
    "json",
    z.object({
      title: z.string().min(1).optional(),
      description: z.string().optional(),
      completed: z.boolean().optional(),
    })
  ),
  async (c) => {
    try {
      const id = parseInt(c.req.param("id"));
      if (isNaN(id)) {
        return c.json(actionFailure("Invalid ID"), 400);
      }

      const data = c.req.valid("json");
      
      // Check if task exists
      const existingTask = await db.select().from(tasks).where(eq(tasks.id, id));
      if (existingTask.length === 0) {
        return c.json(actionFailure("Task not found"), 404);
      }

      // Update task with new values, only updating provided fields
      const updatedTask = await db.update(tasks)
        .set({
          ...(data.title && { title: data.title }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.completed !== undefined && { completed: data.completed }),
        })
        .where(eq(tasks.id, id))
        .returning();

      return c.json(actionSuccess({ task: updatedTask[0] }));
    } catch (e) {
      console.error(e);
      return c.json(actionFailure("Failed to update task"), 500);
    }
  }
);

// Delete a task
const deleteTask = server.delete(
  "/tasks/:id",
  async (c) => {
    try {
      const id = parseInt(c.req.param("id"));
      if (isNaN(id)) {
        return c.json(actionFailure("Invalid ID"), 400);
      }

      await db.delete(tasks).where(eq(tasks.id, id));
      return c.json(actionSuccess({ message: "Task deleted successfully" }));
    } catch (e) {
      console.error(e);
      return c.json(actionFailure("Failed to delete task"), 500);
    }
  }
);


export type Task = typeof tasks.$inferSelect;

export type Tasks = typeof getAllTasks | typeof getTaskById | typeof createTask | typeof updateTask | typeof deleteTask;

export default server;
