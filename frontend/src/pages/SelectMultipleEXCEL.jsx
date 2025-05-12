import React, { useState } from 'react';

export default function SelectMultipleEXCEL() {
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleFileSelection = async () => {
    try {
      const handle = await window.showDirectoryPicker();
      const files = [];
      
      for await (const entry of handle.values()) {
        if (entry.kind === 'file' && entry.name.endsWith('.xlsx')) {
          files.push(entry);
        }
      }
      
      setSelectedFiles(files);
      console.log(files)
    } catch (error) {
      console.error('Error selecting folder:', error);
    }
  };

  return (
    <div>
      <button onClick={handleFileSelection} className="p-2 bg-blue-500 text-white rounded">Select Excel Files</button>
      {selectedFiles.length > 0 && (
        <ul className="mt-2">
          {selectedFiles.map((file, index) => (
            <li key={index}>{file.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
