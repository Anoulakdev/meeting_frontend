import { z } from "zod";

export const userSchema = z.object({
  name: z.string().min(1, "Name is required").min(2, "Name must be at least 2 characters"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  department: z.string().optional(),
  role: z.enum(["Admin", "Editor", "Viewer", "Manager"]),
  status: z.enum(["Active", "Inactive", "Pending"]),
});

export type UserFormData = z.infer<typeof userSchema>;

export const fullUserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  role: z.enum(["Admin", "Editor", "Viewer", "Manager"]),
  status: z.enum(["Active", "Inactive", "Pending"]),
  department: z.string(),
  joinDate: z.string(),
  avatar: z.string(),
  avatarColor: z.string(),
});

export type User = z.infer<typeof fullUserSchema>;
