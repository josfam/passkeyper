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
  const { toast } = useToast();

  useEffect(() => {
    fetchPasswords();
  }, []);

  const fetchPasswords = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://127.0.0.1:5000/passwords", {
        withCredentials: true,
      });
      setPasswords(response.data.passwords);
    } catch (err) {
      setError("Failed to fetch password data");
      console.error("Error fetching passwords:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPasswords = passwords.filter(
    (password) =>
      password.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      password.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      password.url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (password: PasswordEntry) => {
    setEditingPassword(password);
    setIsEditModalOpen(true);
  };

  const handleSave = (updatedPassword: PasswordEntry) => {
    // TODO: Make an API call to update the password
    // For now, we'll just update it in our local state
    setPasswords(
      passwords.map((p) => (p.id === updatedPassword.id ? updatedPassword : p))
    );
    setIsEditModalOpen(false);
  };

  const handleMoveToTrash = (password: PasswordEntry) => {
    // TODO: Make an API call to move the password to trash
    // For now, we'll just update it in our local state
    setPasswords(
      passwords.map((p) =>
        p.id === password.id ? { ...p, in_trash: true } : p
      )
    );
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
        <Button>Add Password</Button>
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
                        handleMoveToTrash(password);
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
            <DialogTitle>EDIT ITEM</DialogTitle>
          </DialogHeader>
          {editingPassword && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSave(editingPassword);
              }}
            >
              <div className="grid gap-4 py-4">
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
                <div className="grid grid-cols-2 items-center gap-4">
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
                        onClick={() =>
                          window.open(editingPassword.url, '_blank')
                        }
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      {renderCopyButton(editingPassword.url, 'URL')}
                    </div>
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
                  <div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleMoveToTrash(editingPassword)}
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
