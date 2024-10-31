import React, { useState, ChangeEvent } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Upload, Download } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { encryptData, decryptData } from '../utils/encrypt_decrypt';
import axios from "axios";
import { FaCloudUploadAlt } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_FLASK_APP_API_URL;

type FileType = "json" | "csv";

interface DataObject {
  [key: string]: string | number | boolean | null;
}

const toastContainerStyle = {
  position: 'fixed' as const,
  top: '1rem',
  right: '1rem',
  zIndex: 9999,
};

const ImportExportPage: React.FC = () => {
  const [importedData, setImportedData] = useState<DataObject[] | null>(null);
  const [importFileType, setImportFileType] = useState<FileType>("json");
  const [exportFileType, setExportFileType] = useState<FileType>("json");

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

  // Fetch EK Salt
  const { data: ekSaltData } = useQuery({
    queryKey: ['ekSalt'],
    queryFn: async () => {
      const response = await axios.get(
        `${import.meta.env.VITE_FLASK_APP_API_URL}internal/get-ek-salt`,
        { withCredentials: true }
      );
      return response.data;
    },
    staleTime: Infinity,
    cacheTime: Infinity,
  });

  const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // File size check with toast notification
    if (file.size > MAX_FILE_SIZE) {
      toast.error("File is too large. Maximum allowed size is 5 MB.", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      });
      return;
    }

    const loadingToast = toast.loading("Importing data...", {
      position: "top-right"
    });

    try {
      // Step 1: Read and parse file data
      const fileContent = await file.text();
      let parsedData;

      if (importFileType === 'csv') {
        parsedData = parseCSV(fileContent);
      } else if (importFileType === 'json') {
        parsedData = JSON.parse(fileContent);
      }

      // Step 2: Encrypt parsed data
      const encryptedData = parsedData.map((entry: any) => ({
        ...entry,
        username: encryptData(entry.username, ekSaltData.ek_salt, ekSaltData.password),
        password: encryptData(entry.password, ekSaltData.ek_salt, ekSaltData.password),
        notes: entry.notes ? encryptData(entry.notes, ekSaltData.ek_salt, ekSaltData.password) : "",
        url: encryptData(entry.url, ekSaltData.ek_salt, ekSaltData.password),
        name: encryptData(entry.name, ekSaltData.ek_salt, ekSaltData.password),
        favicon_url: entry.favicon_url ? encryptData(entry.favicon_url, ekSaltData.ek_salt, ekSaltData.password) : ""
      }));

      // Step 3: Send encrypted data to the server
      const response = await axios.post(`${API_URL}/import`, encryptedData, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });

      toast.update(loadingToast, {
        render: "Data imported successfully!",
        type: "success",
        isLoading: false,
        autoClose: 2000,
        closeOnClick: true
      });

    } catch (error) {
      toast.update(loadingToast, {
        render: "Error importing data. Please try again.",
        type: "error",
        isLoading: false,
        autoClose: 3000,
        closeOnClick: true
      });
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

  const handleExport = async () => {
    const loadingToast = toast.loading("Exporting data...", {
      position: "top-right"
    });

    try {
      const response = await axios.get(`${API_URL}/export`, {
        params: { fileType: exportFileType },
        responseType: "blob",
        withCredentials: true,
      });

      let data;
      if (exportFileType === 'json') {
        const responseData = await response.data.text();
        data = JSON.parse(responseData).map(item => ({
          ...item,
          name: decryptData(item.name, ekSaltData.ek_salt, ekSaltData.password),
          username: decryptData(item.username, ekSaltData.ek_salt, ekSaltData.password),
          password: decryptData(item.password, ekSaltData.ek_salt, ekSaltData.password),
          url: decryptData(item.url, ekSaltData.ek_salt, ekSaltData.password),
          favicon_url: decryptData(item.favicon_url, ekSaltData.ek_salt, ekSaltData.password),
          notes: decryptData(item.notes, ekSaltData.ek_salt, ekSaltData.password),
        }));

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `exported_data.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else if (exportFileType === 'csv') {
        const responseData = await response.data.text();
        const rows = responseData.split('\n').map(row => row.split(','));
        const headers = rows[0];
        const decryptedRows = rows.slice(1).map(row => {
          return row.map((cell, index) => {
            if (index === 0 || index === 1 || index === 2 || index === 3 || index === 4 || index === 5) {
              return decryptData(cell, ekSaltData.ek_salt, ekSaltData.password);
            }
            return cell;
          });
        });

        const decryptedCSV = [headers].concat(decryptedRows).map(row => row.join(',')).join('\n');
        const blob = new Blob([decryptedCSV], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `exported_data.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }

      toast.update(loadingToast, {
        render: "Data exported successfully!",
        type: "success",
        isLoading: false,
        autoClose: 2000,
        closeOnClick: true
      });
    } catch (error) {
      toast.update(loadingToast, {
        render: "Error exporting data. Please try again.",
        type: "error",
        isLoading: false,
        autoClose: 2000,
        closeOnClick: true
      });
      console.error("Error exporting data:", error);
    }
  };

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        style={toastContainerStyle}
        className="fixed-toast"
      />
      <div className="container mx-auto">
        <h1 className="page-header">Import / Export</h1>
        <div className="flex flex-col gap-14">
          <section className="flex flex-col items-start justify-center">
            <Card className="card-shadow text-sky-950 w-full sm:w-3/4 lg:w-1/2 transition-all ease-in-out duration-300">
              <CardHeader className="text-center text-xl pb-0">Import</CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="w-full h-28 border-2 border-dashed border-gray-200 rounded-lg flex items-center
                  justify-center bg-gray-50 hover:bg-gray-100 cursor-pointer relative">
                    <Input
                      type="file"
                      onChange={handleImport}
                      accept={`.${importFileType}`}
                      className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                    />
                    <div className="text-center text-gray-400">
                      <FaCloudUploadAlt className="mx-auto h-8 w-8" />
                      <p className="text-sm">Drag & drop</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Select
                      onValueChange={(value) => setImportFileType(value as FileType)}
                      defaultValue={importFileType}
                    >
                      <SelectTrigger className="w-full text-sm h-11">
                        <SelectValue placeholder="Select file type" />
                      </SelectTrigger>
                      <SelectContent size="sm" className="w-full">
                        <SelectItem value="json">JSON</SelectItem>
                        <SelectItem value="csv">CSV</SelectItem>
                      </SelectContent>
                    </Select>
                    <button
                      onClick={() => document.querySelector('input[type="file"]')?.click()}
                      className="btn-primary flex-nowrap"
                    >
                      <Upload className="mr-2 h-4" /> Import{" "}
                      {importFileType.toUpperCase()}
                    </button>
                  </div>
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

          <section className="flex flex-col items-start justify-center">
            <Card className="card-shadow text-sky-950 w-full sm:w-3/4 lg:w-1/2">
              <CardHeader className="text-center text-xl pb-0">Export</CardHeader>
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <Select
                    onValueChange={(value) => setExportFileType(value as FileType)}
                    defaultValue={exportFileType}
                  >
                    <SelectTrigger className="w-full text-sm h-11">
                      <SelectValue placeholder="Select file type" />
                    </SelectTrigger>
                    <SelectContent size="sm" className="w-full">
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                    </SelectContent>
                  </Select>
                  <button
                    onClick={handleExport}
                    className="btn-primary flex-nowrap">
                    <Download className="mr-2 h-4" /> Export{" "}
                    {exportFileType.toUpperCase()}
                  </button>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </>
  );
};

export default ImportExportPage;