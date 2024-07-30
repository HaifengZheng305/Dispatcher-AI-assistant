import { Chroma } from "@langchain/community/vectorstores/chroma";
import { PromptTemplate } from "@langchain/core/prompts";
import { Ollama } from "@langchain/community/llms/ollama";
import embed_fn from "./models.js";
import readline from "node:readline";

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
const InputPrompt = new PromptTemplate({
  inputVariables: ["context", "question"],
  template:
    "Answer the question based only on the following context: {context}. Answer the question based on the above context: {question}",
});

const response = async function (queryText) {
  const vectorStore = new Chroma(embed_fn, {
    collectionName: "data-collection",
  });

  const response = await vectorStore.similaritySearch(queryText, 5);

  const context_text = response
    .map((document) => document["pageContent"])
    .join("\n\n---\n\n");

  const fromattedInputPrompt = await InputPrompt.format({
    context: context_text,
    question: queryText,
  });

  //the LLM model and the output.
  const ollama = new Ollama({
    baseUrl: "http://localhost:11434", // Default value
    model: "llama3", // Default value
  });

  const stream = await ollama.stream(fromattedInputPrompt);
  //

  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }

  return chunks.join("");
};

/////////////////////////
// create the response using Excel file
//////////////////////////

Main();
