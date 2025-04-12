import { z } from "zod";

export const DeleteAccountSchema = z.object({
  currentPassword: z
    .string({ required_error: "Current Password is required." })
    .describe("Current Password")
    .min(5, "Password must be at least 5 characters long")
    .max(20, "Password must be at most 20 characters long"),
  confirmCurrentPassword: z
    .string()
    .describe("Confirm Password")
    .min(5, "Password must be at least 5 characters long")
    .max(20, "Password must be at most 20 characters long"),
});

export const ChangePasswordSchema = z.object({
  currentPassword: z
    .string({ required_error: "Old Password is required." })
    .describe("Old Password")
    .min(5, "Password must be at least 5 characters long")
    .max(20, "Password must be at most 20 characters long"),
  newPassword: z
    .string({ required_error: "New Password is required." })
    .describe("Password")
    .min(5, "Password must be at least 5 characters long")
    .max(20, "Password must be at most 20 characters long"),
  confirmNewPassword: z
    .string()
    .describe("Confirm Password")
    .min(5, "Password must be at least 5 characters long")
    .max(20, "Password must be at most 20 characters long"),
});

export const AvatarUpdateSchema = z.object({
  avatar: z.string().describe("Avatar"),
});

export const UpdateStatusSchema = z.object({
  statusMessage: z.string().describe("Status"),
});

export const UpdateAccountSchema = z.object({
  email: z.string().describe("Email").optional(),
  displayName: z.string().describe("Display Name").optional(),
  firstName: z.string().describe("First Name").optional(),
  lastName: z.string().describe("Last Name").optional(),
});
