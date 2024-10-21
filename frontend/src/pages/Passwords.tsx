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
import { useToast } from "../hooks/use-toast";
import axios from "axios";
import CryptoJS from "crypto-js"; 

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
  const [email, setEmail] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchPasswords();
    fetchEkSalt();
  }, []);

  const fetchEkSalt = async () => {
  try {
    const response = await axios.get("http://127.0.0.1:5000/internal/get-ek-salt", {
      withCredentials: true,
    });
    setEkSalt(response.data.user_id);
    setMasterPassword(response.data.password);
    setEmail(response.data.email);
  } catch (err) {
    console.error("Error fetching ek_salt:", err);
  }
  };
  const fetchPasswords = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_FLASK_APP_API_URL}passwords`, {
        withCredentials: true,
      });
      
      console.log('Raw password data:', response.data); // Debug log
      
      const passwordsArray = response.data.passwords || [];
      console.log('Passwords array before decryption:', passwordsArray); // Debug log
      
      const decryptedPasswords = passwordsArray.map(password => {
        console.log('Processing password:', password); // Debug log
        return {
          ...password,
          username: decryptData(password.username),
          password: decryptData(password.password),
          notes: password.notes ? decryptData(password.notes) : ''
        };
      });
      
      console.log('Decrypted passwords:', decryptedPasswords); // Debug log
      setPasswords(decryptedPasswords);
    } catch (err) {
      setError("Failed to fetch password data");
      console.error("Error fetching passwords:", err);
      if (err.response) {
        console.log("Response data:", err.response.data);
      }
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
    console.log('Password being edited:', password);
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

const encryptData = (data: PasswordEntry) => {
  if (!ekSalt || !masterPassword || !email) return data;
  
  const sensitiveFields = ['password', 'username', 'notes', 'url', 'name'];
  const encryptedData = { ...data };

  const keySize = 256 / 32;
  const salt = CryptoJS.enc.Hex.parse(ekSalt);
  const encryptionKey = CryptoJS.PBKDF2(masterPassword, salt, {
    keySize: keySize,
    iterations: 1000,
  });

  sensitiveFields.forEach(field => {
    if (data[field]) {
      const iv = CryptoJS.lib.WordArray.random(128/32);
      const encrypted = CryptoJS.AES.encrypt(data[field], encryptionKey, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });
      encryptedData[field] = iv.concat(encrypted.ciphertext).toString(CryptoJS.enc.Base64);
    }
  });

  return encryptedData;
};

const decryptData = (encryptedData: any) => {
  if (!ekSalt || !masterPassword) return encryptedData;
  
  const sensitiveFields = ['password', 'username', 'notes'];
  const decryptedData = { ...encryptedData };

  const keySize = 256 / 32;
  const salt = CryptoJS.enc.Hex.parse(ekSalt);
  const decryptionKey = CryptoJS.PBKDF2(masterPassword, salt, {
    keySize: keySize,
    iterations: 1000,
  });

  sensitiveFields.forEach(field => {
    if (encryptedData[field]) {
      try {
        const data = CryptoJS.enc.Base64.parse(encryptedData[field]);
        const iv = CryptoJS.lib.WordArray.create(data.words.slice(0, 4), 16);
        const ciphertext = CryptoJS.lib.WordArray.create(data.words.slice(4), data.sigBytes - 16);
        
        const decrypted = CryptoJS.AES.decrypt({ ciphertext }, decryptionKey, {
          iv: iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7,
        });
        
        decryptedData[field] = decrypted.toString(CryptoJS.enc.Utf8);
      } catch (error) {
        console.error(`Error decrypting ${field}:`, error);
        decryptedData[field] = encryptedData[field];
      }
    }
  });

  return decryptedData;
};

const handleSave = async (updatedPassword: PasswordEntry) => {
  try {
    // Only encrypt sensitive fields
    const dataToSend = {
      ...updatedPassword,
      username: encryptData(updatedPassword.username),
      password: encryptData(updatedPassword.password),
      notes: updatedPassword.notes ? encryptData(updatedPassword.notes) : ''
    };

    const method = updatedPassword.id === 0 ? 'post' : 'patch';
    const url = `${import.meta.env.VITE_FLASK_APP_API_URL}password${
      updatedPassword.id === 0 ? '' : `/${updatedPassword.id}`
    }`;

    const response = await axios({
      method: method,
      url: url,
      data: dataToSend,
      withCredentials: true,
    });

    // Decrypt the response data before updating state
    const decryptedResponse = {
      ...response.data,
      username: decryptData(response.data.username),
      password: decryptData(response.data.password),
      notes: response.data.notes ? decryptData(response.data.notes) : ''
    };

    setPasswords(prevPasswords => 
      updatedPassword.id === 0
        ? [...prevPasswords, decryptedResponse]
        : prevPasswords.map(p => p.id === decryptedResponse.id ? decryptedResponse : p)
    );

    setIsEditModalOpen(false);
    toast({
      title: `Password ${updatedPassword.id === 0 ? 'Added' : 'Updated'}`,
      description: `The password has been successfully ${updatedPassword.id === 0 ? 'added' : 'updated'}.`,
    });
  } catch (error) {
    console.error('Error saving password:', error);
    toast({
      title: "Error",
      description: "Failed to save the password. Please try again.",
      variant: "destructive",
    });
  }
};
  

const handleMoveToTrash = async (password: PasswordEntry, closeModal: boolean = false) => {
  try {
    // First, modify the password object to mark it as trashed
    const updatedPassword = {
      ...password,
      in_trash: true,
      moved_at: new Date().toISOString()
    };

    // Make a delete request instead of DELETE to update the trash status
    const response = await axios.delete(
      `${import.meta.env.VITE_FLASK_APP_API_URL}password/${password.id}/trash`,
      { withCredentials: true }
    );

    // Update local state to remove the password from the list
    setPasswords(prevPasswords =>
      prevPasswords.filter(p => p.id !== password.id)
    );

    // Close modal if we're in edit mode
    if (closeModal) {
      setIsEditModalOpen(false);
    }

    toast({
      title: "Moved to Trash",
      description: "The password has been moved to trash.",
    });
  } catch (error) {
    console.error("Error moving password to trash:", error);
    toast({
      title: "Error",
      description: "Failed to move the password to trash.",
      variant: "destructive",
    });
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
        toast({
          title: "Copied to clipboard",
          description: `${field} has been copied to your clipboard.`,
        });
        setTimeout(() => setCopiedField(null), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
        toast({
          title: "Copy failed",
          description: "Failed to copy text to clipboard.",
          variant: "destructive",
        });
      });
  };

  const renderCopyButton = (text: string, field: string) => (
    <Button
      variant="ghost"
      size="icon"
      className="ml-2"
      onClick={(e) => {
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
    toast({
      title: "Password generated",
      description: "A new strong password has been generated.",
    });
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
                        console.log('Dropdown trash clicked, password:', password); // Debug log
                        if (password && typeof password.id !== 'undefined') {
                          handleMoveToTrash(password, false);
                        } else {
                          console.log('Invalid password from dropdown:', password); // Debug log
                          toast({
                            title: "Error",
                            description: "Cannot delete this password - invalid ID.",
                            variant: "destructive",
                          });
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
            {editingPassword ? (
              <>Edit Password (ID: {editingPassword.id})</>
            ) : (
              "Add Password"
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
                      console.log('Trash button clicked, editingPassword:', editingPassword);
                      if (editingPassword && editingPassword.id) {
                        handleMoveToTrash(editingPassword, true);
                      } else {console.log('Invalid password object:', editingPassword); // Debug log
                        toast({
                          title: "Error",
                          description: "Cannot delete an unsaved password.",
                          variant: "destructive",
                        });
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