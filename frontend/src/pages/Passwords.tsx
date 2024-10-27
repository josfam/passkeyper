import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  ExternalLink,
  Trash2,
  Wand2,
  Eye,
  EyeOff,
} from "lucide-react";
import getFaviconUrl from "../utils/scraping/FaviconExtraction";
import { Textarea } from "../components/ui/textarea";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { filterPasswords, copyToClipboard, renderCopyButton } from '../utils/helpers';
import { encryptData, decryptData } from '../utils/encrypt_decrypt';

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
  favicon_url: string,
  moved_at: string | null;
  folder: string;
  authenticator_key: string;
  match_detection: string;
}

const PasswordDashboard: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPassword, setEditingPassword] = useState<PasswordEntry | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

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

  const { data: passwords = [], isLoading, isError } = useQuery({
    queryKey: ['passwords'],
    queryFn: async () => {
      const response = await axios.get(
        `${import.meta.env.VITE_FLASK_APP_API_URL}passwords`,
        { withCredentials: true }
      );

      return response.data.passwords.map((password: PasswordEntry) => ({
        ...password,
        username: decryptData(password.username, ekSaltData.ek_salt, ekSaltData.password),
        password: decryptData(password.password, ekSaltData.ek_salt, ekSaltData.password),
        notes: password.notes ? decryptData(password.notes, ekSaltData.ek_salt, ekSaltData.password) : "",
        url: decryptData(password.url, ekSaltData.ek_salt, ekSaltData.password),
        name: decryptData(password.name, ekSaltData.ek_salt, ekSaltData.password),
        favicon_url: decryptData(password.favicon_url, ekSaltData.ek_salt, ekSaltData.password),
      }));
    },
    enabled: !!ekSaltData,
    staleTime: 1000,
    cacheTime: 180000,
  });

  // Save Password Mutation
  const saveMutation = useMutation({
    mutationFn: async (updatedPassword: PasswordEntry) => {
      const dataToSend = {
        ...updatedPassword,
        username: encryptData(updatedPassword.username, ekSaltData.ek_salt, ekSaltData.password),
        password: encryptData(updatedPassword.password, ekSaltData.ek_salt, ekSaltData.password),
        notes: updatedPassword.notes ? encryptData(updatedPassword.notes, ekSaltData.ek_salt, ekSaltData.password) : "",
        url: encryptData(updatedPassword.url, ekSaltData.ek_salt, ekSaltData.password),
        name: encryptData(updatedPassword.name, ekSaltData.ek_salt, ekSaltData.password),
        faviconUrl: encryptData(
          await getFaviconUrl(updatedPassword.url),
          ekSaltData.ek_salt,
          ekSaltData.password
        )
      };

      const method = updatedPassword.id === 0 ? "post" : "patch";
      const url = `${import.meta.env.VITE_FLASK_APP_API_URL}password${
        updatedPassword.id === 0 ? "" : `/${updatedPassword.id}`
      }`;

      return axios({
        method,
        url,
        data: dataToSend,
        withCredentials: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['passwords'] });
      setIsEditModalOpen(false);
      toast.success(`Password ${editingPassword?.id === 0 ? 'added' : 'updated'} successfully`, {
        autoClose: 2000 // 2 seconds
      });
    },
    onError: () => {
      toast.error("Failed to save the password. Please try again.", {
        autoClose: 2000
      });
    }
  });

  const trashMutation = useMutation({
    mutationFn: async (passwordId: number) => {
      return axios.delete(
        `${import.meta.env.VITE_FLASK_APP_API_URL}password/${passwordId}/trash`,
        { withCredentials: true }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['passwords'] });
      toast.success("The password has been moved to trash.", {
        autoClose: 2000
      });
    },
    onError: () => {
      toast.error("Failed to move the password to trash.", {
        autoClose: 2000
      });
    }
  });

  const handleEdit = (password: PasswordEntry) => {
    setEditingPassword(password);
    setIsEditModalOpen(true);
  };

  const handleAddPassword = () => {
    setEditingPassword({
      id: 0,
      user_id: 0,
      name: "",
      username: "",
      password: "",
      url: "",
      notes: "",
      favicon_url: "",
      in_trash: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      moved_at: null,
      folder: "",
      authenticator_key: "",
      match_detection: "",
    });
    setIsEditModalOpen(true);
  };

  const handleSave = (updatedPassword: PasswordEntry) => {
    saveMutation.mutate(updatedPassword);
  };

  const handleMoveToTrash = (password: PasswordEntry, closeModal: boolean = false) => {
    if (!password || typeof password.id === "undefined") {
      toast.error("Invalid password object", {
        autoClose: 2000
      });
      return;
    }

    trashMutation.mutate(password.id);
    if (closeModal) {
      setIsEditModalOpen(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditingPassword((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const generatePassword = () => {
    const length = 16;
    const charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=";
    let password = "";
    for (let i = 0, n = charset.length; i < length; ++i) {
      password += charset.charAt(Math.floor(Math.random() * n));
    }
    setEditingPassword((prev) => (prev ? { ...prev, password } : null));
    setShowPassword(true);
    toast.success("A new strong password has been generated.", {
      autoClose: 2000
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isError) {
    return <div>Error loading passwords</div>;
  }

  const filteredPasswords = filterPasswords(passwords, searchTerm);

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Passwords</h1>
        <Button onClick={handleAddPassword}>Add Password</Button>
      </div>
      <div className="flex justify-between items-center mb-4">
        <Input
          className="max-w-sm"
          placeholder="Search passwords..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button variant="outline">Export</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]"></TableHead>
            <TableHead>Name/URL</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredPasswords.map((password) => (
            <TableRow
              key={password.id}
              className="cursor-pointer hover:bg-gray-100"
              onClick={() => handleEdit(password)}
            >
              <TableCell>
                <img src={`${password.favicon_url}`} alt={`Web icon for ${password.name}'s site`}
                className="w-full h-full object-cover"/>
              </TableCell>
              <TableCell>
                <div className="text-lg">{password.name}</div>
                <div className="text-sm text-gray-500">{password.url}</div>
              </TableCell>
              <TableCell>{password.username}</TableCell>
              <TableCell>
                {new Date(password.created_at).toLocaleDateString()}
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
                        handleEdit(password);
                      }}
                    >
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveToTrash(password, false);
                      }}
                    >
                      Move to Trash
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>
              {editingPassword && editingPassword.id > 0
                ? "Edit Password Entry"
                : "Add Password Entry"}
            </DialogTitle>
          </DialogHeader>
          {editingPassword && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSave(editingPassword);
              }}
            >
              <div className="grid gap-4 py-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={editingPassword.name}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <div className="flex">
                      <Input
                        id="username"
                        name="username"
                        value={editingPassword.username}
                        onChange={handleInputChange}
                      />
                      {renderCopyButton(editingPassword.username, "Username", copiedField, setCopiedField)}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="password">Password</Label>
                    <div className="flex relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={editingPassword.password}
                        onChange={handleInputChange}
                        className="pr-20"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={generatePassword}
                        className="absolute right-16"
                      >
                        <Wand2 className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-8"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      {renderCopyButton(editingPassword.password, "Password", copiedField, setCopiedField)}
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="url">URL</Label>
                  <div className="flex">
                    <Input
                      id="url"
                      name="url"
                      value={editingPassword.url}
                      onChange={handleInputChange}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-2"
                      onClick={() => window.open(editingPassword.url, "_blank")}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    {renderCopyButton(editingPassword.url, "URL", copiedField, setCopiedField)}
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={editingPassword.notes}
                    onChange={handleInputChange}
                    rows={4}
                  />
                </div>
              </div>

              <DialogFooter className="mt-6">
                <div className="flex justify-between w-full">
                  <div>
                    <Button type="submit" className="mr-2">
                      Save
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => setIsEditModalOpen(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                  {editingPassword.id > 0 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      onClick={() => handleMoveToTrash(editingPassword, true)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PasswordDashboard;