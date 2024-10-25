import React, { useState, ChangeEvent } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import { Alert, AlertDescription } from "../components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Upload, Download } from "lucide-react";
import axios from "axios";

const API_URL = import.meta.env.VITE_FLASK_APP_API_URL;

type FileType = "json" | "csv";

interface DataObject {
  [key: string]: string | number | boolean | null;
}

const ImportExportPage: React.FC = () => {
  const [importedData, setImportedData] = useState<DataObject[] | null>(null);
  const [exportData, setExportData] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [importFileType, setImportFileType] = useState<FileType>("json");
  const [exportFileType, setExportFileType] = useState<FileType>("json");

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

  const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // File size limiting logic
    if (file.size > MAX_FILE_SIZE) {
      setMessage("File is too large. Maximum allowed size is 5 MB.");
      return;
    }
  
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileType', importFileType);
  
    try {
      const response = await axios.post(`${API_URL}/import`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      });
  
      setMessage(response.data.message || "Data imported successfully!");
    } catch (error) {
      setMessage("Error importing data. Please try again.");
      console.error("Error importing data:", error);
    }
  };
  

  const parseCSV = (csvString: string): DataObject[] => {
    const lines = csvString.trim().split("\n");
    const headers = lines[0].split(",").map((header) => header.trim());
    return lines.slice(1).map((line) => {
      const values = line.split(",");
      return headers.reduce((obj, header, index) => {
        obj[header] = values[index]?.trim() ?? "";
        return obj;
      }, {} as DataObject);
    });
  };

  const convertToCSV = (data: DataObject[]): string => {
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(","),
      ...data.map((row) =>
        headers.map((header) => JSON.stringify(row[header] ?? "")).join(",")
      ),
    ];
    return csvRows.join("\n");
  };

  const handleExport = async () => {
    try {
      const response = await axios.get(`${API_URL}/export`, {
        params: { fileType: exportFileType },
        responseType: "blob", // Ensures we get the data as a binary blob
        withCredentials: true, // Include credentials like cookies
      });
  
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `exported_data.${exportFileType}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setMessage("Data exported successfully!");
    } catch (error) {
      setMessage("Error exporting data.");
      console.error("Error exporting data:", error);
    }
  };
  

  return (
    <div className="container mx-auto p-4 space-y-8">
      <section>
        <h3 className="text-lg font-semibold mb-3">Import</h3>
        <Card className="shadow-sm max-w-2xl">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <Select
                onValueChange={(value) => setImportFileType(value as FileType)}
                defaultValue={importFileType}
              >
                <SelectTrigger className="w-24 text-sm">
                  <SelectValue placeholder="Select file type" />
                </SelectTrigger>
                <SelectContent size="sm" className="w-24">
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
              <Button
                size="sm"
                onClick={() =>
                  document.querySelector('input[type="file"]')?.click()
                }
              >
                <Upload className="mr-1 h-3 w-3" /> Import{" "}
                {importFileType.toUpperCase()}
              </Button>
            </div>
            {importedData && (
              <div className="mt-4">
                <h5 className="size-sm font-semibold">Imported Data:</h5>
                <pre className="bg-gray-100 text-sm p-2 rounded mt-2 overflow-auto max-h-40">
                  {JSON.stringify(importedData, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">Export</h3>
        <Card className="shadow-sm max-w-2xl">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <Select
                onValueChange={(value) => setExportFileType(value as FileType)}
                defaultValue={exportFileType}
              >
                <SelectTrigger className="w-24 text-sm">
                  <SelectValue placeholder="Select file type" />
                </SelectTrigger>
                <SelectContent size="sm" className="w-24">
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
              <Button size="sm" onClick={handleExport}>
                <Download className="mr-1 h-3 w-3" /> Export{" "}
                {exportFileType.toUpperCase()}
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {message && (
        <Alert className="mt-4 text-sm max-w-2xl">
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ImportExportPage;
