import React, { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { toast, Flip } from "react-toastify";
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
import { FaPlus } from "react-icons/fa";
import getFaviconUrl from "../utils/scraping/FaviconExtraction";
import { Textarea } from "../components/ui/textarea";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import { filterPasswords, copyToClipboard, renderCopyButton } from '../utils/helpers';
import { encryptData, decryptData } from '../utils/encrypt_decrypt';
import { faPlus } from "@fortawesome/free-solid-svg-icons";

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
  const location = useLocation();

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

  const formatUrl = (url: string): string => {
    if (!url) return url;
    
    if (!/^https?:\/\//i.test(url)) {
      return `https://${url}`;
    }
    return url;
  }
  // show toast message from the login page
  useEffect(() => {
    if (location.state?.showSuccessToast) {
      toast.success(
        "Logged in successfully",
        {
          autoClose: 1500,
          hideProgressBar: true,
          pauseOnFocusLoss: false,
          position: 'top-right',
          transition: Flip,
        }
      )
    }
  }, [location.state])

  // Save Password Mutation
  const saveMutation = useMutation({
    mutationFn: async (updatedPassword: PasswordEntry) => {
      const dataToSend = {
        ...updatedPassword,
        username: encryptData(updatedPassword.username, ekSaltData.ek_salt, ekSaltData.password),
        password: encryptData(updatedPassword.password, ekSaltData.ek_salt, ekSaltData.password),
        notes: updatedPassword.notes ? encryptData(updatedPassword.notes, ekSaltData.ek_salt, ekSaltData.password) : "",
        url: encryptData(formatUrl(updatedPassword.url), ekSaltData.ek_salt, ekSaltData.password),
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

  const handleUrlKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  const handleOpenUrl = (e: React.MouseEvent, url: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const formattedUrl = formatUrl(url);
    if (formattedUrl) {
      window.open(formattedUrl, "_blank");
    }
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
    <div className="container mx-auto">
      <div className="flex justify-center items-center">
        <h1 className="page-header">Passwords</h1>
        <div className="group flex flex-row-reverse gap-2 justify-center items-center w-fit h-11
          absolute right-6 bottom-20">
          <button className="btn-primary w-14 h-14 flex justify-center items-center gap-3 rounded-full relative
            z-10 shadow-lg shadow-indigo-300 hover:scale-105 transition-all ease-in-out"
            onClick={handleAddPassword}
            >
            <FaPlus className="transition-all ease-in-out"/>
          </button>
          {/* tooltip on hover */}
          <span className="bg-sky-100 px-3 py-2 rounded-lg text-sky-950 relative hidden
          group-hover:opacity-100 group-hover:block transition-all ease-in-out z-10">Add a password
           {/* Tooltip triangle */}
          </span>
        </div>
      </div>
      <div className="flex justify-center items-center mb-8">
        <Input
          className="w-full text-lg border-2 border-indigo-200 sm:w-3/4 md:w-1/2 transition-all ease-in-out h-11"
          placeholder="Search passwords..."
          value={searchTerm}
          autoFocus
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <Table>
        <TableHeader>
          <TableRow className="hidden sm:table-row">
            <TableHead className="w-[50px]"></TableHead>
            <TableHead>Name/URL</TableHead>
            <TableHead className="hidden sm:table-cell">Username</TableHead>
            <TableHead className="hidden lg:table-cell">Created At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="transition-all ease-in-out">
          {filteredPasswords.map((password) => (
            <TableRow
              key={password.id}
              className="cursor-pointer hover:bg-sky-100 hover:text-sky-800 max-h-16"
              onClick={() => handleEdit(password)}
            >
              <TableCell className="w-12">
                <div className="h-12 w-12 max-sm:max-h-9 sm:max-w-9">
                  <img src={`${password.favicon_url}`} alt={`Web icon for ${password.name}'s site`}
                  className="w-full h-full object-contain"/>
                </div>
              </TableCell>
              <TableCell>
                <div className="max-w-80 text-ellipsis overflow-clip text-lg font-medium">{password.name}</div>
                <div className="w-40 text-sm text-nowrap text-gray-500 text-ellipsis overflow-x-clip">{password.url}</div>
              </TableCell>
              <TableCell className="text-base hidden sm:table-cell">
                {password.username}
              </TableCell>
              <TableCell className="text-base hidden lg:table-cell">
                {new Date(password.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-center sm:text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-9 w-9 sm:h-6 sm:w-6" />
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
                      onKeyPress={handleUrlKeyPress}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="ml-2"
                      onClick={(e) => handleOpenUrl(e, editingPassword.url)}
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