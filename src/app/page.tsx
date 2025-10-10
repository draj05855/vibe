"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery,  } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

const Page =  () => {
  const [value, SetValue] = useState("");
  const trpc = useTRPC();
  const { data: messages } =  useQuery(trpc.messages.getMany.queryOptions());
  const createMessages = useMutation(trpc.messages.create.mutationOptions({
    onSuccess: () => {
      toast.success("Message created")
    }
  }));
  
  return (
   <div className="p-4 max-w-7xl mx-auto">
    <Input value={value} onChange={(e) => SetValue(e.target.value)}/>
    <Button disabled={createMessages.isPending} onClick={() => createMessages.mutate({value: value})}>
      Invoke Background job
    </Button>
    {JSON.stringify(messages, null, 2)}
   </div>
  )
}

export default Page;
