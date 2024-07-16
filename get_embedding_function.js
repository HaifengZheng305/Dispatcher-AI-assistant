import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";

const embeddings = new OllamaEmbeddings({
  model: "llama4", // default value
  baseUrl: "http://localhost:11434", // default value
});

export default { embeddings };
