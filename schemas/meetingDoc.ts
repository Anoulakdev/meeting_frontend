import { z } from "zod";

export const EmployeeSchema = z.object({
  id: z.number(),
  first_name: z.string(),
  last_name: z.string(),
  gender: z.string().nullable().optional(),
  emp_code: z.string(),
});

export const CreatedBySchema = z.object({
  id: z.number(),
  employee: EmployeeSchema,
});

export const MeetingDocSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string().nullable().optional(),
  startDate: z.string(),
  endDate: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  location: z.string().nullable().optional(),
  docfile: z.string().nullable().optional(),
  createdById: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  createdBy: CreatedBySchema,
  assigns: z.array(z.unknown()),
});

export type MeetingDoc = z.infer<typeof MeetingDocSchema>;
export type Employee = z.infer<typeof EmployeeSchema>;
export type CreatedBy = z.infer<typeof CreatedBySchema>;
