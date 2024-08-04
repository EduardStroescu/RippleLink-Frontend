import { z } from "zod";

export const AvatarSchema = z.object({
  avatarUrl: z
    .string({ required_error: "E-mail is required." })
    .describe("Avatar URL"),
});
