import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";
import { Ollama } from "@langchain/community/llms/ollama";

const embed_fn = new OllamaEmbeddings({
  model: "nomic-embed-text", // default value
  baseUrl: "http://localhost:11434", // default value
});

export default embed_fn;
