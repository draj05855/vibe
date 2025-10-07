import { file, object, z } from "zod";
import { Sandbox, CommandResult } from "@e2b/code-interpreter";
import { gemini, createAgent, createTool, createNetwork } from "@inngest/agent-kit";
import { inngest } from "./client";
import { getSandbox, lastAssistantTextMeassageContent } from "./utills";
import { PROMPT } from "@/prompt";
import { title } from "process";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    // Step 1: Create sandbox
    const sandboxId = await step.run("get-sandbox-id", async () => {
      const sandbox = await Sandbox.create("vibe-nextjs-00001");
      return sandbox.sandboxId;
    });

    // Step 2: Create code agent
    const codeAgent = createAgent({
      name: "codeagent",
      description: "An expert coding agent",
      system: PROMPT,
      model: gemini({ model: "gemini-2.5-flash" }),
      tools: [
        createTool({
          name: "terminal",
          description: "Use the terminal to run commands",
          parameters: z.object({
            command: z.string(),
          }),
          handler: async ({ command }, { step }) => {
            return await step?.run("terminal", async () => {
              const buffers = { stdout: "", stderr: "" };

              try {
                const sandbox = await getSandbox(sandboxId);

                // ✅ Minimal TypeScript fix for latest SDK
                const result: CommandResult = await sandbox.commands.run(command, {
                  background: false,
                  stdin: false,
                  onStdout: (data: string | Buffer) => {
                    buffers.stdout += data.toString();
                  },
                  onStderr: (data: string | Buffer) => {
                    buffers.stderr += data.toString();
                  },
                });

                // ✅ Type assertion to fix red line on `.output`
                return buffers.stdout || (result as any).output || "Command executed.";
              } catch (e) {
                console.error(
                  `Command failed: ${e}\nstdout: ${buffers.stdout}\nstderr: ${buffers.stderr}`
                );
                return `Command failed: ${e}\nstdout: ${buffers.stdout}\nstderr: ${buffers.stderr}`;
              }
            });
          },
        }),
        createTool({
          name: "createOrUpdateFiles",
          description: "Create or update files in the sandbox",
          parameters: z.object({
            files: z.array(
              z.object({
                path: z.string(),
                content: z.string(),
              }),
            ),
          }),
          handler: async (
            { files },
            { step, network }
          ) => {
            const newFiles = await step?.run("createOrUpdateFiles", async () => {
              try{
                const updatedFiles = network.state.data.files || {};
                const sandbox = await getSandbox(sandboxId);
                for(const file of files){
                  await sandbox.files.write(file.path, file.content);
                  updatedFiles[file.path] = file.content;
                }

                return updatedFiles;
              }catch(e){
                return "Error: " + e;
              }
            });
            if(typeof newFiles === "object"){
              network.state.data.files = newFiles;
            }
          }
        }),
        createTool({
          name: "readFiles",
          description: "Read files from the sandbox",
          parameters: z.object({
            files: z.array(z.string()),
          }),
          handler: async ({ files }, { step }) =>{
            return await step?.run("readFiles", async () =>{
              try{
                const sandbox = await getSandbox(sandboxId);
                const contents = [];
                for (const file of files){
                  const content = await sandbox.files.read(file);
                  contents.push({ path: file, content });
                }
                return JSON.stringify(contents);
              }catch(e){
                return "Error" + e;
              }
            })
          },
        })
      ],
      lifecycle: {
        onResponse: async ({ result, network }) => {
          const lastAssistantMessageText = 
          lastAssistantTextMeassageContent(result);

          if(lastAssistantMessageText && network){
            if(lastAssistantMessageText.includes("<task_summary>")){
              network.state.data.summary = lastAssistantMessageText;
            }
          }
          return result;
        },
      },
    });

    const network = createNetwork({
      name: "coding-agent-network",
      agents: [codeAgent],
      maxIter: 15,
      router: async({ network }) => {
        const summary = network.state.data.summary;

        if(summary){
          return;
        }
        return codeAgent;
      },
    })

    // Step 3: Run the code agent
    const result = await network.run(event.data.value);

    // Step 4: Get sandbox URL
    const sandboxUrl = await step.run("get-sandbox-url", async () => {
      const sandbox = await getSandbox(sandboxId);
      const host = sandbox.getHost(3000);
      return `https://${host}`;
    });

    // Step 5: Return both
    return {  
      url: sandboxUrl,
      title: "Fragment",
      files: result.state.data.files,
      summary: result.state.data.summary,
     };
  }
);
