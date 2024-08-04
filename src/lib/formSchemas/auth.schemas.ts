import { z } from "zod";

export const LoginSchema = z.object({
  email: z
    .string({ required_error: "E-mail is required." })
    .describe("Email")
    .email({ message: "Invalid Email" }),
  password: z
    .string()
    .describe("Password")
    .min(5, "Password must be at least 5 characters long")
    .max(20, "Password must be at most 20 characters long"),
});

export const RegisterSchema = z
  .object({
    email: z
      .string({ required_error: "E-mail is required." })
      .describe("Email")
      .email({ message: "Invalid Email" }),
    firstName: z
      .string({ required_error: "First Name is required." })
      .describe("First Name")
      .min(1, "First Name is required"),
    lastName: z
      .string({ required_error: "Last Name is required." })
      .describe("Last Name")
      .min(1, "Last Name is required"),
    displayName: z
      .string()
      .describe("Display Name")
      .min(5, "Display Name must be at least 5 characters long")
      .optional()
      .or(z.literal("")),
    avatarUrl: z.string().describe("Avatar URL"),
    password: z
      .string({ required_error: "Password is required." })
      .describe("Password")
      .min(5, "Password must be at least 5 characters long")
      .max(20, "Password must be at most 20 characters long"),
    confirmPassword: z
      .string()
      .min(5, {
        message: "Confirm password must be at least 5 characters long",
      })
      .max(20, {
        message: "Confirm password must be at most 20 characters long",
      }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
