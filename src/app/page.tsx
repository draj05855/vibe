import { trpc, getQueryClient } from "@/trpc/server"
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Client } from "./client";
import { Suspense } from "react";

//prefetching the data
const page = async () => {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.createAI.queryOptions({ text: "Raj dubey"}));
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<p>Loading...</p>}>
    <Client />
    </Suspense>
    </HydrationBoundary>
  )
}

export default page
