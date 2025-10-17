import { protectedProcedure, createTRPCRouter } from "@/trpc/init";
import { getUsageStatus } from "@/lib/usage";

export const usageRouter = createTRPCRouter({
  status: protectedProcedure.query(async () => {
    return await getUsageStatus();
  }),
});
