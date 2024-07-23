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
////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////// helper functions///////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////////////
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

////////////////////////////////////////////////////////////////////////////////////
// split document and id each split
const splitdoc = async function (doc) {
  try {
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 800,
      chunkOverlap: 80,
    });

    const splitdocs = await textSplitter.splitDocuments(doc);

    const docWithID = await chunkID(splitdocs);
    return docWithID;
  } catch (error) {
    console.error("Error Splitting Doc:", error);
    throw error;
  }
};

// add ID to the chunks
const chunkID = async function (chunks) {
  try {
    let lastPageId = null;

    let currentChunkIndex = 0;

    for (let chunk of chunks) {
      let source = chunk["metadata"]["source"];
      let pageNumber = chunk["metadata"]["loc"]["pageNumber"];

      if (pageNumber == lastPageId) currentChunkIndex++;
      else currentChunkIndex = 0;

      lastPageId = pageNumber;

      chunk["id"] = `${source}:${pageNumber}:${currentChunkIndex}`;
    }
    return chunks;
  } catch (error) {
    console.error("Error Chunking ID Doc:", error);
    throw error;
  }
};

/////////////////////////////////////////////////////////////////////////////////////////
//add to Chroma dataBase
async function addToChroma(docs) {
  //   // Load the existing database
  const vectorStore = new Chroma(embed_fn, {
    collectionName: "data-collection",
  });
  // const ids = await vectorStore.addDocuments(docs);
  const response = await vectorStore.similaritySearch("Free days", 2);
  console.log(response[1]["pageContent"]);
}

Main();
