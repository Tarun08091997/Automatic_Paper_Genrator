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

// Utility functions
const createText = (text, fontSize, bold = false, italics = false) => {
  return new TextRun({
    text,
    font: "Trebuchet MS",
    size: fontSize,
    bold,
    italics,
  });
};

const createParagraph = (text, fontSize, bold = false, italics = false, alignment = "LEFT", lineSpace = 360) => {
  return new Paragraph({
    children: [createText(text, fontSize, bold, italics)],
    alignment: AlignmentType[alignment],
    spacing: { line: lineSpace, top: 200, bottom: 200 },
  });
};

const tableCell = (span, text, spanWidth, bold = false, italics = false, size = 20, alignment = "CENTER") => {
  return new TableCell({
    columnSpan: span,
    width: { size: spanWidth, type: WidthType.PERCENTAGE },
    children: [
      new Paragraph({
        children: [new TextRun({ text, font: "Trebuchet MS", size, bold, italics })],
        alignment: AlignmentType[alignment],
        spacing: { line: 360, top: 200, bottom: 200 },
      }),
    ],
  });
};

const fetchImage = async () => {
  const response = await fetch(logo);
  const blob = await response.blob();
  const arrayBuffer = await blob.arrayBuffer();
  return new Uint8Array(arrayBuffer);
};




const generateExamDocx = async (examData, data, selectedQuestions, questionSelector, instructions ,singleDocx = true , setNo = 1) => {

  console.log({
    examData,
    data,
    selectedQuestions,
    questionSelector,
    instructions,
    setNo
  });

  const imageData = await fetchImage();

  const logoImage = new Paragraph({
    children: [
      new ImageRun({
        data: imageData,
        transformation: { width: 194, height: 64 },
      }),
    ],
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
  });

  const headerLine = new Paragraph({
    children: [
      createText("Registration No. ........................ \t", 20),
      createText("    Exam Seat No. ....................... \t", 20),
      createText(`    Q.P Set .....${setNo}.....`, 20),
    ],
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
  });

  const createTableRow = (key1, val1, key2, val2) => [
    tableCell(1, key1, 25),
    tableCell(1, val1, 25),
    tableCell(1, key2, 25),
    tableCell(1, val2, 25),
  ];

  const maxMarks = () =>{
    let total = 0;
    Object.keys(examData.sections).map((mark)=>{
      total += examData.sections[mark].reqQuestions * mark;
    })

    return total;
  }

  const PaperInfoTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [tableCell(4, `${examData.examinationType} – ${examData.month}, ${examData.year}`, 100)],
      }),
      new TableRow({
        children: [tableCell(1, "School Name", 25), tableCell(3, examData.school, 75)],
      }),
      new TableRow({ children: createTableRow("Program ", data.program, "Semester ", data.semester) }),
      new TableRow({ children: createTableRow("Subject Code ", data.subjectCode, "Subject Name ", data.subject) }),
      new TableRow({ children: createTableRow("Max Marks ", `${maxMarks()}`, "Duration ", examData.duration) }),
    ],
  });

  const instructionHeading = createParagraph("Instructions", 24, true, false, "CENTER", 400);

  const addTopInstruction = () => {
    return instructions.TopInstruction.map((instr) => new TableRow({
      children: [tableCell(4, instr, 100, false, true, 17, "LEFT")],
    }));
  };

  const topInstructionTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [...addTopInstruction()],
  });

  // /////////////////////////// QUESTION SECTION ////////////////////////////

  

  const questionTable = (marks ,index) =>{

    const COLUMN_SPAN = [10,60,10,20]; // Q No., Question, CO's, RBT Level

    const total_que = examData.sections[marks].reqQuestions;
    const total_marks = total_que * marks;

    const addQuestion = () => {

      const arr = [];
      selectedQuestions[marks].forEach((question, index) => {
        arr.push(new TableRow({
          children: [
            tableCell(1, String(index + 1), COLUMN_SPAN[0], false, false, 20, "CENTER"),
            tableCell(1, question.Question, COLUMN_SPAN[1], false, false, 20, "LEFT"),
            tableCell(1, question.CO, COLUMN_SPAN[2], false, false, 20, "CENTER"),
            tableCell(1, question.RBT, COLUMN_SPAN[3], false, false, 20, "CENTER"),
          ],
        }));
      });

      return arr;
    }
    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows:[
        new TableRow({
          children: [tableCell(3, instructions.SectionInstruction[index], 80,false ,false, 20,"LEFT") ,
          tableCell(1, `(${marks} x ${total_que} = ${total_marks})` , 20,false ,false, 20,"CENTER")
        ],
        }),

        new TableRow({
          children:[
            tableCell(1, "Q No." ,COLUMN_SPAN[0] ,false ,false, 20,"CENTER"),
            tableCell(1, "Question" , COLUMN_SPAN[1],false ,false, 20,"CENTER"),
            tableCell(1, "CO's" , COLUMN_SPAN[2],false ,false, 20,"CENTER"),
            tableCell(1, "RBT Level" , COLUMN_SPAN[3],false ,false, 20,"CENTER"),
          ]
        }),
        ...addQuestion(),
      ]
    })
  }

  const questionSection = ()=>{
    const arr = [];
    Object.keys(selectedQuestions).forEach((marks,index) => {
      
      arr.push(createParagraph("Section " + String.fromCharCode(65 + index) , 28 , true , false , "CENTER" , 600))
      arr.push(questionTable(marks,index));
    });
    return arr;
  }





  // Build the document
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 800, bottom: 720, left: 720, right: 720 },
          },
        },
        children: [
          headerLine,
          logoImage,
          PaperInfoTable,
          instructionHeading,
          topInstructionTable,
          ...questionSection(),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  if (singleDocx) {
    saveAs(blob, `${data.subject}-${data.subjectCode}.docx`);
  } else {
    return {
      blob,
      filename: `${data.subject}-${data.subjectCode} set-${setNo}.docx`,
    };
  }
};

export {generateExamDocx};