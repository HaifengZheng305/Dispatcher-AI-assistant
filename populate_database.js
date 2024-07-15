import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { Document } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

async function Main(){
    const docs = await loader.load();
    const text = `Hi.\n\nI'm Harrison.\n\nHow? Are? You?\nOkay then f f f f.
    This is a weird text to write, but gotta test the splittingggg some how.\n\n
    Bye!\n\n-H.`;

    const docOutput = await splitter.splitDocuments([
        new Document({ pageContent: docs[0]["pageContent"] }),
      ]);


    console.log(docOutput.slice(0, 3))

};


// import document load
const loader = new PDFLoader("data/Per_Diem_Document.pdf", {
    parsedItemSeparator: "",
    splitPages: false,
});

const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 80,
  });

Main();