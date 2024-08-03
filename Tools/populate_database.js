import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import embed_fn from "../models.js";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Chroma } from "@langchain/community/vectorstores/chroma";

async function Main() {
  const doc = await dLoader("data");
  const chunks = await splitdoc(doc);
  const testing = await chunkID(chunks);
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

    const splitDocs = await textSplitter.splitDocuments(doc);

    return splitDocs;
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
      chunk["metadata"]["pageNumber"] = pageNumber;
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

  const docWithID = await chunkID(docs);

  const chunkId = [];

  console.log(docWithID);
  const ids = await vectorStore.addDocuments(docWithID);
  const response = await vectorStore.similaritySearch("school", 5);
  console.log(response);
}

Main();
