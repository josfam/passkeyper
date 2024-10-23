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
  Clipboard,
  Eye,
  EyeOff,
  ExternalLink,
  Trash2,
  Check,
  Wand2,
} from "lucide-react";
import { Textarea } from "../components/ui/textarea";
import axios from "axios";
import CryptoJS from "crypto-js";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


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
  folder: string;
  authenticator_key: string;
  match_detection: string;
}

const PasswordDashboard: React.FC = () => {
  const [passwords, setPasswords] = useState<PasswordEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPassword, setEditingPassword] = useState<PasswordEntry | null>(
    null
  );
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [ekSalt, setEkSalt] = useState<string | null>(null);
  const [masterPassword, setMasterPassword] = useState<string | null>(null);

  useEffect(() => {
    fetchEkSalt();
  }, []);

  useEffect(() => {
    if (ekSalt && masterPassword) {
      fetchPasswords()
    }
  }, [ekSalt, masterPassword]);

  const fetchEkSalt = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_FLASK_APP_API_URL}internal/get-ek-salt`, {
        withCredentials: true,
      });

      setEkSalt(response.data.ek_salt);
      setMasterPassword(response.data.password);
      return response.data;

    } catch (err) {
      console.error("Error fetching ek_salt:", err);
      throw err;
    }
  };

  const fetchPasswords = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_FLASK_APP_API_URL}passwords`,
        { withCredentials: true }
      );
      
      const passwordsArray = response.data.passwords || [];

      const decryptedPasswords = passwordsArray.map((password: PasswordEntry) => {
        try {
          const decrypted = {
            ...password,
            username: decryptData(password.username),
            password: decryptData(password.password),
            notes: password.notes ? decryptData(password.notes) : '',
            url: decryptData(password.url),
            name: decryptData(password.name)
          };
          return decrypted;
        } catch (error) {
          console.error(`Error decrypting password ${password.id}:`, error);
          return password;
        }
      });
      
      setPasswords(decryptedPasswords);
    } catch (err) {
      setError("Failed to fetch password data");
      console.error("Error fetching passwords:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPasswords = passwords.filter(
    (password) =>
      password.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      password.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      password.url?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (password: PasswordEntry) => {
    setEditingPassword(password);
    setIsEditModalOpen(true);
  };

  const handleAddPassword = () => {
    setEditingPassword({
      id: 0,
      user_id: 0,
      name: '',
      username: '',
      password: '',
      url: '',
      notes: '',
      in_trash: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      moved_at: null,
      folder: '',
      authenticator_key: '',
      match_detection: '',
    });
    setIsEditModalOpen(true);
  };

  const encryptData = (data: string): string => {
    if (!ekSalt || !masterPassword || !data) return data;
    
    try {
      // Generate encryption key
      const salt = CryptoJS.enc.Hex.parse(ekSalt);
      const key = CryptoJS.PBKDF2(masterPassword, salt, {
        keySize: 256/32,
        iterations: 1000
      });
      
      // Generate random IV
      const iv = CryptoJS.lib.WordArray.random(16);
      
      // Encrypt the data
      const encrypted = CryptoJS.AES.encrypt(data, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });
      
      // Combine IV and ciphertext
      const combined = CryptoJS.lib.WordArray.create()
        .concat(iv)
        .concat(encrypted.ciphertext);
      
      // Return as base64 string
      return combined.toString(CryptoJS.enc.Base64);
    } catch (error) {
      console.error('Encryption error:', error);
      return data;
    }
  };

  const decryptData = (encryptedData: string): string => {
    if (!ekSalt || !masterPassword || !encryptedData) return encryptedData;
    
    try {
      // Convert the combined base64 string back to WordArray
      const combined = CryptoJS.enc.Base64.parse(encryptedData);
      
      // Extract IV and ciphertext
      const iv = CryptoJS.lib.WordArray.create(combined.words.slice(0, 4));
      const ciphertext = CryptoJS.lib.WordArray.create(
        combined.words.slice(4),
        combined.sigBytes - 16
      );
      
      // Generate decryption key
      const salt = CryptoJS.enc.Hex.parse(ekSalt);
      const key = CryptoJS.PBKDF2(masterPassword, salt, {
        keySize: 256/32,
        iterations: 1000
      });
      
      // Decrypt the data
      const decrypted = CryptoJS.AES.decrypt(
        { ciphertext: ciphertext },
        key,
        {
          iv: iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7
        }
      );

      // Convert to UTF8 string
      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Decryption error:', error);
      console.error('Encrypted data:', encryptedData);
      console.error('Salt:', ekSalt);
      return encryptedData;
    }
  };

  const handleSave = async (updatedPassword: PasswordEntry) => {
    try {
      const dataToSend = {
        ...updatedPassword,
        username: encryptData(updatedPassword.username),
        password: encryptData(updatedPassword.password),
        notes: updatedPassword.notes ? encryptData(updatedPassword.notes) : '',
        url: encryptData(updatedPassword.url),
        name: encryptData(updatedPassword.name)
      };

      const method = updatedPassword.id === 0 ? 'post' : 'patch';
      const url = `${import.meta.env.VITE_FLASK_APP_API_URL}password${
        updatedPassword.id === 0 ? '' : `/${updatedPassword.id}`
      }`;

      const response = await axios({
        method,
        url,
        data: dataToSend,
        withCredentials: true,
      });

      // Update the passwords list with the new/updated password
      await fetchPasswords();

      setIsEditModalOpen(false);
      toast.success(
        `The password has been successfully ${updatedPassword.id === 0 ? 'added' : 'updated'}`
      );
    } catch (error) {
      console.error('Error saving password:', error);
      toast.error('Failed to save the password. Please try again.');
    }
  };
    

  const handleMoveToTrash = async (password: PasswordEntry, closeModal: boolean = false) => {
    try {
      if (!password || typeof password.id === 'undefined') {
        throw new Error('Invalid password object');
      }

      await axios.delete(
        `${import.meta.env.VITE_FLASK_APP_API_URL}password/${password.id}/trash`,
        { withCredentials: true }
      );

      await fetchPasswords();

      if (closeModal) {
        setIsEditModalOpen(false);
      }

      toast.success('The password has been moved to trash.');
    } catch (error) {
      console.error("Error moving password to trash:", error);
      toast.error('Failed to move the password to trash.');
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditingPassword((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopiedField(field);
        toast.success(`${field} has been copied to your clipboard.`);
        setTimeout(() => setCopiedField(null), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
        toast.error('Failed to copy text to clipboard.');
      });
  };

  const renderCopyButton = (text: string, field: string) => (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="ml-2"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        copyToClipboard(text, field);
      }}
    >
      {copiedField === field ? (
        <Check className="h-4 w-4" />
      ) : (
        <Clipboard className="h-4 w-4" />
      )}
    </Button>
  );

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
    toast.success('A new strong password has been generated.');
  };

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
                <Lock className="h-4 w-4" />
              </TableCell>
              <TableCell>
                <div>{password.name}</div>
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
                        if (password && typeof password.id !== 'undefined') {
                          handleMoveToTrash(password, false);
                        } else {
                          toast.error('Cannot delete this password - invalid ID.');
                        }
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
            {editingPassword && editingPassword.id > 0 ? (
              <>Edit A Password Entry</>
            ) : (
              "Add A Password Entry"
            )}
          </DialogTitle>
        </DialogHeader>
        {editingPassword !== null && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSave(editingPassword);
            }}
          >
            <div className="grid gap-4 py-4">
              {/* Name Input */}
              <div className="grid grid-cols items-center gap-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={editingPassword.name}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* Username and Password Inputs */}
              <div className="grid grid-cols-2 items-center gap-4">
                {/* Username Input */}
                <div>
                  <Label htmlFor="username">Username</Label>
                  <div className="flex">
                    <Input
                      className="text-base"
                      id="username"
                      name="username"
                      value={editingPassword.username}
                      onChange={handleInputChange}
                    />
                    {renderCopyButton(editingPassword.username, "Username")}
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="flex relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={editingPassword.password}
                      onChange={handleInputChange}
                      className="pr-20 text-base"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={generatePassword}
                      className="absolute right-16 top-0 bottom-0"
                    >
                      <Wand2 className="h-4 w-4" />
                    </Button>
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
                    {renderCopyButton(editingPassword.password, "Password")}
                  </div>
                </div>
              </div>

              {/* URL Input */}
              <div className="grid grid-cols items-center gap-4">
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
                      onClick={() => window.open(editingPassword.url, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    {renderCopyButton(editingPassword.url, 'URL')}
                  </div>
                </div>
              </div>

              {/* Notes Input */}
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

            {/* Dialog Footer with Action Buttons */}
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
                <div>
                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      if (editingPassword && editingPassword.id) {
                        handleMoveToTrash(editingPassword, true);
                      } else {toast.error('Cannot delete an unsaved password.');
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
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