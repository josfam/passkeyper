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

  const handleImport = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsedData =
          importFileType === "json" ? JSON.parse(content) : parseCSV(content);
        setImportedData(Array.isArray(parsedData) ? parsedData : [parsedData]);
        setMessage("Data imported successfully!");
      } catch (error) {
        setMessage(
          `Error importing data. Please ensure it's a valid ${importFileType.toUpperCase()} file.`
        );
      }
    };
    reader.readAsText(file);
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

  const handleExport = () => {
    if (!exportData.trim()) {
      setMessage("Please enter some data to export.");
      return;
    }

    try {
      let parsedData: DataObject[];

      // Try to parse the input as JSON first
      try {
        parsedData = JSON.parse(exportData);
        if (!Array.isArray(parsedData)) {
          parsedData = [parsedData];
        }
      } catch {
        // If it's not valid JSON, try to parse as CSV
        parsedData = parseCSV(exportData);
      }

      let dataToExport: string;
      let filename: string;

      if (exportFileType === "json") {
        dataToExport = JSON.stringify(parsedData, null, 2);
        filename = "exported_data.json";
      } else {
        dataToExport = convertToCSV(parsedData);
        filename = "exported_data.csv";
      }

      const blob = new Blob([dataToExport], {
        type:
          exportFileType === "json"
            ? "application/json"
            : "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setMessage("Data exported successfully!");
    } catch (error) {
      setMessage(
        `Error exporting data. Please ensure it's valid JSON or CSV data.`
      );
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
              <Input
                type="file"
                onChange={handleImport}
                accept={`.${importFileType}`}
                className="w-2/4 text-sm"
              />
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
              <textarea
                className="w-full h-24 p-2 text-sm border rounded mb-2"
                value={exportData}
                onChange={(e) => setExportData(e.target.value)}
                placeholder={`Enter JSON or CSV data to export...`}
              />
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
