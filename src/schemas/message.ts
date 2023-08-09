import { z } from "zod";

export const messageSchema = z.object({
  id: z.string(),
  content: z.string(),
  roomId: z.string(),
  ownerId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  owner: z.object({
    name: z.string().nullish(),
    username: z.string(),
    image: z.string().nullable(),
  }),
});

export type Message = z.infer<typeof messageSchema>;
