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

export const DepartmentSchema = z.object({
  id: z.number(),
  department_name: z.string().nullable().optional(),
  department_code: z.string().nullable().optional(),
  department_status: z.string().nullable().optional(),
});

export const RelatedDocSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string().nullable().optional(),
  docfile: z.string().nullable().optional(),
  departmentId: z.number().nullable().optional(),
  createdById: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  department: DepartmentSchema.nullable().optional(),
  createdBy: CreatedBySchema.optional(),
  relatedAssigns: z.array(z.unknown()).optional(),
});

export type RelatedDoc = z.infer<typeof RelatedDocSchema>;
export type Department = z.infer<typeof DepartmentSchema>;
export type Employee = z.infer<typeof EmployeeSchema>;
export type CreatedBy = z.infer<typeof CreatedBySchema>;
