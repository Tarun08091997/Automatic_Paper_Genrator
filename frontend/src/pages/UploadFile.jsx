import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import * as XLSX from "xlsx";

const UploadFile = ({ handleFile }) => {

    const parseCSVData = (csvArray) => {
        if (!Array.isArray(csvArray) || csvArray.length < 2) {
          throw new Error("Invalid CSV data");
        }
      
        const headers = csvArray[0]; // First row as headers
        const rows = csvArray.slice(1); // Remaining rows as data
      
        // Map each row to an object with keys from the headers
        return rows.map((row) => {
          const rowObject = {};
          headers.forEach((header, index) => {
            rowObject[header] = row[index];
          });
          return rowObject;
        });
      };
      

  const onDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const binaryStr = e.target.result;
          const workbook = XLSX.read(binaryStr, { type: "binary" }); // Parse Excel file
          const sheetName = workbook.SheetNames[0]; // Get the first sheet name
          const sheet = workbook.Sheets[sheetName]; // Get the first sheet
          const CSVdata = XLSX.utils.sheet_to_json(sheet, { header: 1 }); // Convert sheet to 2D array
          const data = parseCSVData(CSVdata);
          handleFile(data, file.name); // Pass parsed data to handleFile
        };
        reader.readAsBinaryString(file); // Read file as binary string
      }
    },
    [handleFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false, // Allow only one file to be dropped at a time
    accept: [".xlsx", ".xls", ".csv"], // Specify accepted file types as an array
  });

  return (
    <div className="flex items-center justify-center h-250px mx-[100px]">
      <div
        {...getRootProps({
          className: `border-2 border-dashed rounded-md p-6 w-1/2 h-1/2 flex items-center justify-center ${
            isDragActive ? "border-green-500 bg-green-50" : "border-gray-300 bg-gray-50"
          }`,
        })}
      >
        <input {...getInputProps()} />
        <p className="text-center text-gray-600">
          Drag and drop an Excel or CSV file here, or click to select one
        </p>
      </div>
    </div>
  );
};

export default UploadFile;
