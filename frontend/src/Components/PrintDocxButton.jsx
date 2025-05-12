import React from "react";
import { saveAs } from "file-saver";
import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  AlignmentType,
  WidthType,
  ImageRun,
} from "docx";
import logo from "../assets/CT_University_logo.png";

const PrintDocxButton = ({ examData, data, selectedQuestions, questionSelector, instructions }) => {
  
  console.log({
    examData,
    data,
    selectedQuestions,
    questionSelector,
    instructions,
  })

  

  // Function to fetch and convert image to Uint8Array
  const fetchImage = async () => {
    const response = await fetch(logo);
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  };

  //function to createText
  const createText = (text, fontSize, bold = false, italics = false) => {
    return new TextRun({
      text,
      font: "Trebuchet MS",
      size: fontSize,   
      bold: bold,
      italics: italics,
    });
  };
  
  const createParagraph = (text, fontSize, bold = false, italics = false , alignment = "LEFT",lineSpace = 360) => {
    return new Paragraph({
      children: [createText(text, fontSize, bold, italics)],
      alignment: AlignmentType[alignment],
      spacing: { line: lineSpace, top: 200, bottom: 200 },
    });
  };

  // Helper: Create a table cell
  const tableCell = (span, text ,spanWidth, bold=false , italics=false,size = 20 , alignment="CENTER") => {
    return new TableCell({
      columnSpan: span,
      width: { size: spanWidth, type: WidthType.PERCENTAGE },
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text,
              font: "Trebuchet MS",
              size: size,
              bold: bold,
              italics: italics,
            }),
          ],
          alignment: AlignmentType[alignment],
          spacing: { line: 360, top: 200, bottom: 200 },
        }),
      ],
    });
  };





  
  

  // Header line with Registration, Seat No., Q.P Set
  const headerLine = new Paragraph({
    children: [
      createText("Registration No. ........................ \t", 20),
      createText("    Exam Seat No. ....................... \t", 20),
      createText("    Q.P Set ...........", 20),
    ],
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
  });
  

  


  // Helper: Create a row with two key-value pairs
  const createTableRow = (key1, val1, key2, val2) => {
    return [
      tableCell(1, key1,25),
      tableCell(1, val1,25),
      tableCell(1, key2,25),
      tableCell(1, val2,25),
    ];
  };
  
  // Paper Info Table
  const PaperInfoTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [tableCell(4, `${examData.examinationType} – ${examData.month}, ${examData.year}`,100)],
      }),
      new TableRow({
        children: [tableCell(1, "School Name",25), tableCell(3, examData.school,75)],
      }),
      new TableRow({
        children: createTableRow("Program ", data.program, "Semester ", data.semester),
      }),
      new TableRow({
        children: createTableRow("Subject Code ", data.subjectCode, "Subject Name ", data.subject),
      }),
      new TableRow({
        children: createTableRow("Max Marks ", `${examData.total_marks}`, "Duration ", examData.duration),
      }),
    ],
  });

  

  // Instruction Heading
  const instructionHeading = createParagraph("Instructions",24,true,false,"CENTER",400)
  
  return(
    <div>LOL</div>
  )
  

  const addTopInstruction = () =>{

    const createRowForInstructions = (i) => {
      return new TableRow({
        children: [tableCell(4, instructions.TopInstruction[i], 100,false ,true, 17,"LEFT")],
      });
    }

    const arr = [];
    const totalInstructions = instructions.TopInstruction.length;
    for (let i = 0; i < totalInstructions; i++) {
      arr.push(createRowForInstructions(i));
    }
    return arr;
  }

  const topInstructionTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows:[
      ...addTopInstruction() ,
    ]
  });

  
  
  // /////////////////////////// QUESTION SECTION ////////////////////////////
  const sectionHeading = createParagraph("Section A" , 28 , true , false , "CENTER" , 600)
  const questionSection = ()=>{
    Object.keys(selectedQuestions).forEach((marks) => {
      console.log(`Key: ${key}, Value: ${selectedQuestions[key]}`); });
  }

  const questionTable = (marks ,index) =>{
    const total_que = selectedQuestions[marks].length;
    if(total_que === 0) return null; // Skip if no questions

    const total_marks = total_que * marks;

    const createRow = (i) => {
      return new TableRow({
        children: [tableCell(4, instructions.TopInstruction[i], 100,false ,true, 17,"LEFT")],
      });
    }
    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows:[
        new TableRow({
          children: [tableCell(3, instructions.SectionInstruction[index], 80,false ,false, 20,"LEFT") ,
          tableCell(1, total_marks , 20,false ,false, 20,"CENTER")
        ],
        })
      ]
    })
  }

  







  // Main function to generate the DOCX file
  const generateDocx = async () => {
    const imageData = await fetchImage(); // ✅ Await the image data

    // Logo Image paragraph (must be created after fetching)
    const logoImage = new Paragraph({
      children: [
        new ImageRun({
          data: imageData,
          transformation: {
            width: 194,
            height: 64,
          },
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    });

    

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 800,
                bottom: 720,
                left: 720,
                right: 720,
              },
            },
          },
          children: [
            // headerLine, 
            // logoImage, 
            // PaperInfoTable,
            // instructionHeading,
            // topInstructionTable,

            // sectionHeading,
            // questionTable(1,0),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${data.subject}-${data.subjectCode}.docx`);
  };

  return (
    <button
      onClick={generateDocx}
      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mt-4"
    >
      Print to DOCX
    </button>
  );
};

export default PrintDocxButton;
