import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";

const embed_fn = new OllamaEmbeddings({
  model: "llama3", // default value
  baseUrl: "http://localhost:11434", // default value
});

export default embed_fn;
