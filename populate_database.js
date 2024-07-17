import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import embed_fn from "./get_embedding_function.js";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Chroma } from "@langchain/community/vectorstores/chroma";

async function Main() {
  const doc = await dLoader("data");
  const chunks = await splitdoc(doc);
  addToChroma(chunks);
}

// helper functions
// import document load
const dLoader = async function (Path) {
  try {
    const directoryLoader = new DirectoryLoader(Path, {
      ".pdf": (path) => new PDFLoader(path),
    });

    const docs = await directoryLoader.load();
    return docs;
  } catch (error) {
    console.error("Error loading documents:", error);
    throw error;
  }
};

// split document
const splitdoc = async function (doc) {
  try {
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 800,
      chunkOverlap: 80,
    });

    const splitdocs = await textSplitter.splitDocuments(doc);

    return splitdocs;
  } catch (error) {
    console.error("Error Splitting Doc:", error);
    throw error;
  }
};

async function addToChroma(docs) {
  // Load the existing database
  const vectorStore = await Chroma.fromExistingCollection(embed_fn, {
    collectionName: "a-test-collection",
  });
  const response = await vectorStore.similaritySearch("college", 1);

  console.log(response);
}

Main();
