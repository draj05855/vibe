import {  gemini, createAgent } from "@inngest/agent-kit";
import { inngest } from "./client";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event }) => {
    const codeAgent = createAgent({
      name: "codeagent",
      system:
        "You are an expert next.js developer. You write reddable, maintainable code. you write simple next.js & React snnipets.",
      model: gemini({ model: "gemini-2.5-flash" }), // model ka naam bhi Gemini ke hisab se badal jayega
    });

    const { output } = await codeAgent.run(
  `Write the following snnipet: ${event.data.value}`,
);
console.log(output);

    return { output };
  }
);
