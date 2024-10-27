import React, { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  Lock,
  MoreHorizontal,
  Eye,
  EyeOff,
  ExternalLink,
  Trash2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { copyToClipboard, renderCopyButton } from "../utils/helpers";
import { decryptData } from "../utils/encrypt_decrypt";

interface PasswordEntry {
  id: number;
  user_id: number;
  name: string;
  username: string;
  password: string;
  url: string;
  notes: string;
  in_trash: boolean;
  created_at: string;
  updated_at: string;
  moved_at: string | null;
  favicon_url: string;
}

const PasswordTrashPage: React.FC = () => {
  const [trashedPasswords, setTrashedPasswords] = useState<PasswordEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewingPassword, setPreviewingPassword] =
    useState<PasswordEntry | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isDeleteAllDialogOpen, setIsDeleteAllDialogOpen] = useState(false);
  const [ekSalt, setEkSalt] = useState<string | null>(null);
  const [masterPassword, setMasterPassword] = useState<string | null>(null);

  useEffect(() => {
    fetchEkSalt();
  }, []);

  useEffect(() => {
    if (ekSalt && masterPassword) {
      fetchTrashedPasswords();
    }
  }, [ekSalt, masterPassword]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const fetchEkSalt = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:5000/internal/get-ek-salt",
        {
          withCredentials: true,
        }
      );
      setEkSalt(response.data.ek_salt);
      setMasterPassword(response.data.password);
      return response.data;
    } catch (err) {
      console.error("Error fetching ek_salt:", err);
      throw err;
    }
  };

  const fetchTrashedPasswords = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://127.0.0.1:5000/passwords", {
        withCredentials: true,
        params: { in_trash: true },
      });
      const passwordsArray = response.data.passwords || [];
      const decryptedPasswords = passwordsArray.map(
        (password: PasswordEntry) => {
          try {
            const decrypted = {
              ...password,
              username: decryptData(password.username, ekSalt, masterPassword),
              password: decryptData(password.password, ekSalt, masterPassword),
              notes: password.notes
                ? decryptData(password.notes, ekSalt, masterPassword)
                : "",
              url: decryptData(password.url, ekSalt, masterPassword),
              name: decryptData(password.name, ekSalt, masterPassword),
              favicon_url: decryptData(
                password.favicon_url,
                ekSalt,
                masterPassword
              ),
            };
            return decrypted;
          } catch (error) {
            console.error(`Error decrypting password ${password.id}:`, error);
            return password;
          }
        }
      );
      setTrashedPasswords(decryptedPasswords);
    } catch (err) {
      setError("Failed to fetch trashed password data");
      console.error("Error fetching trashed passwords:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (password: PasswordEntry) => {
    try {
      await axios.patch(
        `http://127.0.0.1:5000/password/${password.id}/restore`,
        {},
        {
          withCredentials: true,
        }
      );
      setTrashedPasswords(trashedPasswords.filter((p) => p.id !== password.id));
      setIsPreviewModalOpen(false);
      toast.success(`${password.name} has been restored from the trash.`, {
        autoClose: 2000
      });
    } catch (err) {
      console.error("Error restoring password:", err);
      toast.error("Failed to restore the password. Please try again.", {
        autoClose: 2000
      });
    }
  };

  const handlePermanentDelete = async (password: PasswordEntry) => {
    try {
      await axios.delete(
        `http://127.0.0.1:5000/password/${password.id}/permanent`,
        {
          withCredentials: true,
        }
      );
      setTrashedPasswords(trashedPasswords.filter((p) => p.id !== password.id));
      setIsPreviewModalOpen(false);
      toast.success(`${password.name} has been permanently deleted.`, {
        autoClose: 2000
      });
    } catch (err) {
      console.error("Error deleting password permanently:", err);
      toast.error("Failed to delete the password permanently. Please try again.", {
        autoClose: 2000
      });
    }
  };

  const handleDeleteAll = async () => {
    try {
      await axios.delete("http://127.0.0.1:5000/passwords", {
        withCredentials: true,
      });
      setTrashedPasswords([]);
      setIsDeleteAllDialogOpen(false);
      toast.success("All trashed passwords have been permanently deleted.", {
        autoClose: 2000
      });
    } catch (err) {
      console.error("Error deleting all passwords:", err);
      toast.error("Failed to delete all passwords. Please try again.", {
        autoClose: 2000
      });
    }
  };

  const handlePreview = (password: PasswordEntry) => {
    setPreviewingPassword(password);
    setIsPreviewModalOpen(true);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value));
    setCurrentPage(1);
  };

  const filteredPasswords = trashedPasswords.filter((password) =>
    searchTerm
      ? password.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        password.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        password.url.toLowerCase().includes(searchTerm.toLowerCase())
      : true
  );

  const totalItems = filteredPasswords.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentPageData =
    totalItems <= 7
      ? filteredPasswords
      : filteredPasswords.slice(startIndex, endIndex);

  const Pagination = () => (
    <div className="flex items-center justify-between px-2 py-4">
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <p className="text-sm text-muted-foreground">Rows per page</p>
          <Select
            value={pageSize.toString()}
            onValueChange={handlePageSizeChange}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent>
              {[5, 10, 20].map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="icon"
              onClick={() => handlePageChange(page)}
            >
              {page}
            </Button>
          ))}
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Password Trash</h1>
        {trashedPasswords.length > 0 && (
          <Button
            onClick={() => setIsDeleteAllDialogOpen(true)}
            className="flex items-center"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Empty Trash
          </Button>
        )}
      </div>
      <div className="flex justify-between items-center mb-4">
        <Input
          className="max-w-sm"
          placeholder="Search trashed passwords..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]"></TableHead>
            <TableHead>Name/URL</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Moved to Trash</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentPageData.map((password) => (
            <TableRow
              key={password.id}
              className="cursor-pointer hover:bg-gray-100"
              onClick={() => handlePreview(password)}
            >
              <TableCell>
                <img
                  src={`${password.favicon_url}`}
                  alt={`Web icon for ${password.name}'s site`}
                  className="w-full h-full object-cover"
                />
              </TableCell>
              <TableCell>
                <div>{password.name}</div>
                <div className="text-sm text-gray-500">{password.url}</div>
              </TableCell>
              <TableCell>{password.username}</TableCell>
              <TableCell>
                {password.moved_at
                  ? new Date(password.moved_at).toLocaleDateString()
                  : "Unknown"}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRestore(password);
                      }}
                    >
                      Restore
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePermanentDelete(password);
                      }}
                    >
                      Delete Permanently
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {totalItems > 5 && <Pagination />}

      {/* Delete All Confirmation Dialog */}
      <Dialog
        open={isDeleteAllDialogOpen}
        onOpenChange={setIsDeleteAllDialogOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Empty Trash</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-500">
              Are you sure you want to permanently delete all items in the
              trash? This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteAllDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" className="bg-red-500 hover:bg-red-600 active:bg-red-700" onClick={handleDeleteAll}>
              Delete All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      <Dialog open={isPreviewModalOpen} onOpenChange={setIsPreviewModalOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>VIEW TRASHED ITEM</DialogTitle>
          </DialogHeader>
          {previewingPassword && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols items-center gap-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={previewingPassword.name}
                    readOnly
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 items-center gap-4">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <div className="flex">
                    <Input
                      className="text-base"
                      id="username"
                      name="username"
                      value={previewingPassword.username}
                      readOnly
                    />
                    {renderCopyButton(
                      previewingPassword.username,
                      "Username",
                      copiedField,
                      setCopiedField
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="flex relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={previewingPassword.password}
                      readOnly
                      className="pr-20 text-base"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-8 top-0 bottom-0"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    {renderCopyButton(
                      previewingPassword.password,
                      "Password",
                      copiedField,
                      setCopiedField
                    )}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols items-center gap-4">
                <div>
                  <Label htmlFor="url">URL</Label>
                  <div className="flex">
                    <Input
                      id="url"
                      name="url"
                      value={previewingPassword.url}
                      readOnly
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-2"
                      onClick={() =>
                        window.open(previewingPassword.url, "_blank")
                      }
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    {renderCopyButton(
                      previewingPassword.url,
                      "URL",
                      copiedField,
                      setCopiedField
                    )}
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={previewingPassword.notes}
                  readOnly
                  rows={4}
                />
              </div>
            </div>
          )}
          <DialogFooter className="mt-6">
            <div className="flex justify-between w-full">
              <div>
                <Button onClick={() => setIsPreviewModalOpen(false)}>
                  Close
                </Button>
              </div>
              <div>
                <Button
                  variant="secondary"
                  onClick={() => handleRestore(previewingPassword!)}
                  className="mr-2"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Restore
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handlePermanentDelete(previewingPassword!)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Permanently
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PasswordTrashPage;
