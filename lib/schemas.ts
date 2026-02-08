import { z } from "zod";

export const TaskSchema = z.object({
  title: z.string().min(1, "Task title is required"),
  description: z.string(),
  priority: z.enum(["low", "medium", "high"]),
  estimated_hours: z.number().optional(),
});

export const GroupSchema = z.object({
  title: z.string().min(1, "Group title is required"),
  color: z.string().default("#579BFC"),
  tasks: z.array(TaskSchema),
});

export const AIProjectSchema = z.object({
  title: z.string().min(1, "Project title is required"),
  groups: z.array(GroupSchema),
});

export type AIProjectOutput = z.infer<typeof AIProjectSchema>;
export type AIGroupOutput = z.infer<typeof GroupSchema>;
export type AITaskOutput = z.infer<typeof TaskSchema>;
