import { z } from "zod";

export const isAuthenticatedSchema = z.object({
  _id: z.string().min(1, { message: "Missing User ID" }),
  access_token: z.string().min(1, { message: "Missing Access Token" }),
  refresh_token: z.string().min(1, { message: "Missing Refresh Token" }),
  email: z
    .string()
    .min(1, {
      message: "Missing Email",
    })
    .email({ message: "Invalid Email" }),
  firstName: z.string().min(1, { message: "Missing First Name" }),
  lastName: z.string().min(1, { message: "Missing Last Name" }),
  displayName: z.string().min(1, { message: "Missing Display Name" }),
  avatarUrl: z.string().nullish(),
  status: z.record(z.unknown()).nullish(),
  settings: z.record(z.unknown()).nullish(),
  updatedAt: z.string().nullish(),
  createdAt: z.string().nullish(),
});
