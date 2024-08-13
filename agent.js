import { Chroma } from "@langchain/community/vectorstores/chroma";
import { PromptTemplate } from "@langchain/core/prompts";
// import { Ollama } from "@langchain/community/llms/ollama";
import { ChatOllama } from "@langchain/ollama";
import embed_fn from "./models.js";
import readline from "node:readline";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

async function Main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question(``, async (question) => {
    console.log(await response(question));
    rl.close();
  });
}

/////////////////////////
// create the response using PDf
//////////////////////////
const FinalPrompt = new PromptTemplate({
  inputVariables: ["context", "question"],
  template:
    "Answer the question based only on the following context: {context}. Answer the question based on the above context: {question}",
});

const InputPrompt = new PromptTemplate({
  inputVariables: ["inqury"],
  template:
    "You are an tool selecting agent that picks the best tools to use for Trucking Dispatchers to gather shipping - line information and container information. When you see any from the following list, remember they are refering to a shipping line container. Shipping line: CMA, OOCL, ONE, HALAG, YMLU. If the inqury is asking for general shipping line information or containers,use the Shipping-line-document tool.  {inqury}",
});

const response = async function (queryText) {
  // This can be converted in to a tool probably//
  const vectorStore = new Chroma(embed_fn, {
    collectionName: "data-collection",
  });

  const llmForTool = new ChatOllama({
    model: "llama3-groq-tool-use",
  });

  // const qaTool = new DynamicStructuredTool({
  //   name: "Tell user whether yes or no",
  //   description: "tell me yes or no",
  //   schema: z.object({
  //     queryText: z.string().describe("what is the user asking?"),
  //   }),
  //   func: async ({ queryText }) =>
  //     //   {
  //     //   // const response = await vectorStore.similaritySearch(queryText, 5);

  //     //   // const context_text = response
  //     //   //   .map((document) => document["pageContent"])
  //     //   //   .join("\n\n---\n\n");

  //     //   // return context_text;
  //     //   return "testing";
  //     // }
  //     queryText,
  // });

  const qaTool = new DynamicStructuredTool({
    name: "Shipping-line-document",
    description:
      "Retrieve demurrage, return free days or, detention for (including:CMA, OOCL, HALAG) shipping-line. from document from the vectorstore based on the input prompt. ",
    schema: z.object({
      inqury: z.string().describe("The entire prompt "),
    }),
    func: async ({ inputPrompt }) => {
      const response = await vectorStore.similaritySearch(inputPrompt, 5);

      const context_text = response
        .map((document) => document["pageContent"])
        .join("\n\n---\n\n");

      return context_text;
    },
  });

  const randomNumberGenerator = new DynamicStructuredTool({
    name: "random-number-generator",
    description: "generates a random number between two input numbers",
    schema: z.object({
      low: z.number().describe("The lower bound of the generated number"),
      high: z.number().describe("The upper bound of the generated number"),
    }),
    func: async ({ low, high }) =>
      (Math.random() * (high - low) + low).toString(), // Outputs still must be strings,
  });
  const llmWithTools = llmForTool.bindTools([qaTool, randomNumberGenerator]);

  // const fromattedInputPrompt = await InputPrompt.format({
  //   context: context_text,
  //   question: queryText,
  // });

  const fromattedInputPrompt = await InputPrompt.format({
    inqury: queryText,
  });

  const resultFromTool = await llmWithTools.invoke(fromattedInputPrompt);

  // const stream = await ollama.stream(fromattedInputPrompt);
  // //

  // // const chunks = [];
  // // for await (const chunk of stream) {
  // //   chunks.push(chunk);
  // // }

  // // return chunks.join("");

  return resultFromTool;
};

/////////////////////////
// create the response using Excel file
//////////////////////////

Main();
