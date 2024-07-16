import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

import { Document } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

async function Main() {
  const doc = await dLoader("data");
  const splitteddoc = await splitdoc(doc);
}

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

Main();
