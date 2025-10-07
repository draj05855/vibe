import { Sandbox } from "@e2b/code-interpreter"
import {  gemini, createAgent } from "@inngest/agent-kit";
import { inngest } from "./client";
import { getSandbox } from "@/app/api/inngest/utils";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event,step }) => {
    const SandboxId = await step.run("get-sandbox-id" , async () =>{
      const sandbox = await Sandbox.create("vibe-nextjs-00001");
      return sandbox.sandboxId;
    });
    const codeAgent = createAgent({
      name: "codeagent",
      system:
        "You are an expert next.js developer. You write reddable, maintainable code. you write simple next.js & React snnipets.",
      model: gemini({ model: "gemini-2.5-flash" }), // model ka naam bhi Gemini ke hisab se badal jayega
    });

    const { output } = await codeAgent.run(
  `Write the following snnipet: ${event.data.value}`,
);

const sandboxUrl = await step.run("get-sandbox-url" , async () =>{
  const sandbox = await getSandbox(SandboxId)
  const host =  sandbox.getHost(3000);
  return `https://${host}`;
})

    return { output, sandboxUrl };
  }
);
