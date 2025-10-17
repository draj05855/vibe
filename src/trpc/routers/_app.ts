
import {  createTRPCRouter } from '../init';
import { messagesRouter } from '@/modules/messages/server/procedures';
import { projectRouter } from '@/modules/projects/server/procedures'
import { usageRouter } from '@/modules/usage/server/procedures';

export const appRouter = createTRPCRouter({
  messages: messagesRouter,
  projects: projectRouter,
  usage: usageRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;