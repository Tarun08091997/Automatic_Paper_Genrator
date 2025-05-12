import Papa from "papaparse"; // For CSV files
import * as XLSX from "xlsx"; // For Excel files
import { saveAs } from 'file-saver';
import html2canvas from "html2canvas";
import jsPDF from "jspdf";


/**
 * Parses a file and returns its data.
 * @param {File} file - The file to parse (CSV or Excel).
 * @returns {Promise<Array>} - A promise that resolves to the parsed data.
 */

const getLevel = (level) => {
  const key = level?.trim().toLowerCase();

  if (!key) return -1; // Handle null, undefined, or empty strings

  if (key.includes("y")) {
      return 1;
  }
  if (key.includes("f")) {
      return 3;
  }
  if (key.includes("o")) {
      return 2;
  }
  return -1;
};

const getUnit=(unit) =>{
  const romanToNumber = {
    "I": 1, "II": 2, "III": 3, "IV": 4, "V": 5,
    "VI": 6, "VII": 7, "VIII": 8, "IX": 9, "X": 10
  };
  if (typeof unit !== "string") return -1;
  const match = unit.match(/(I{1,3}|IV|V?I{0,3}|IX|X)$/i);
  if (!match) return -1;
  return romanToNumber[match[0].toUpperCase()] || -1;
}


export const parseFile = async (file) => {
  const reader = new FileReader();

  // Wrap FileReader in a Promise to use with async/await
  const readFile = () => {
    return new Promise((resolve, reject) => {
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (error) => reject(new Error("Error reading file: " + error.message));
      reader.readAsBinaryString(file); // Read file as binary string
    });
  };

  try {
    const content = await readFile(); // Wait for the file to be read
    let dataResult = [];

    // Check file type (CSV or Excel)
    const ext = file.name.split(".").pop().toLowerCase();

    if (ext === "csv") {
      // Parse CSV file
      const result = await new Promise((resolve, reject) => {
        Papa.parse(content, {
          header: true, // Use first row as headers
          dynamicTyping: true, // Automatically convert data types
          complete: (result) => resolve(result.data), // Resolve with parsed data
          error: (error) => reject(new Error("Error parsing CSV: " + error.message)),
        });
      });
      dataResult =  result; // Return parsed CSV data
    } else if (ext === "xls" || ext === "xlsx") {
      // Parse Excel file
      const workbook = XLSX.read(content, { type: "binary" });
      const sheetName = workbook.SheetNames[0]; // Get the first sheet
      const sheet = workbook.Sheets[sheetName];
      dataResult = XLSX.utils.sheet_to_json(sheet, { header: 1 }); // Convert sheet to JSON
      
    } else {
      throw new Error("Unsupported file type: " + ext);
    }
    const rawQuestions = dataResult.slice(5)
    const questions = []
    
    for(let q of rawQuestions){
      questions.push({
        "Question":q[1],
        "Marks":q[2],
        "Unit":getUnit(q[4]),
        "Level":getLevel(q[5]),
        "CO":q[6],
        "RBT":q[7]
      })
    }

    const data = {
      "program" : dataResult[1][1],
      "semester" : dataResult[1][3],
      "subject": dataResult[2][1],
      "code": dataResult[2][3],
      "questions" : questions
    }    
    return data;

  } catch (error) {
    console.error(error.message);
    throw error; // Re-throw the error for handling in the calling function
  }
};


export const printAsWord = (content , name) =>{
   // Create a Blob with the HTML content
  const blob = new Blob(
      [
        `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
          <head>
            <meta charset="UTF-8">
            <title>Document</title>
          </head>
          <body>
            ${content}
          </body>
        </html>
        `,
      ],
      { type: 'application/msword' }
    );

  // Save the file using file-saver
  saveAs(blob, `${name}.docx`);
}


export const printAsPDF = (content, name) => {
  // Create a temporary container to hold the HTML content
  const tempContainer = document.createElement("div");
  tempContainer.style.position = "absolute";
  tempContainer.style.left = "-9999px"; // Move off-screen
  tempContainer.innerHTML = content;
  document.body.appendChild(tempContainer);

  // Use html2canvas to capture the content as an image
  html2canvas(tempContainer, { scale: 2 }).then((canvas) => {
    const imgData = canvas.toDataURL("image/png"); // Convert canvas to image data
    const pdf = new jsPDF("p", "mm", "a4"); // Create a new PDF with A4 size

    const pageWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm

    // Customizable margins (in mm)
    const topMargin = 20;
    const bottomMargin = 20;
    const leftMargin = 15;
    const rightMargin = 15;

    // Calculate the printable area
    const printableWidth = pageWidth - leftMargin - rightMargin;
    const printableHeight = pageHeight - topMargin - bottomMargin;

    // Set the image size to the full content without scaling
    const imgAspectRatio = canvas.width / canvas.height;
    const imgWidth = printableWidth;
    const imgHeight = (imgWidth / imgAspectRatio);

    // Handle content that exceeds one page
    let yOffset = topMargin;
    const imgHeightPerPage = printableHeight;

    if (imgHeight > printableHeight) {
      // Split into multiple pages
      const totalPages = Math.ceil(imgHeight / imgHeightPerPage);
      for (let page = 0; page < totalPages; page++) {
        if (page > 0) {
          pdf.addPage();
        }
        const currentY = yOffset - (page * imgHeightPerPage);
        pdf.addImage(
          imgData,
          "PNG",
          leftMargin,
          currentY,
          imgWidth,
          imgHeightPerPage
        );
      }
    } else {
      // Single page content
      pdf.addImage(imgData, "PNG", leftMargin, yOffset, imgWidth, imgHeight);
    }

    pdf.save(`${name}.pdf`); // Save the PDF

    // Clean up the temporary container
    document.body.removeChild(tempContainer);
  });
};
