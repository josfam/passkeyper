import React, { useState, useEffect } from 'react';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../components/ui/dropdown-menu";
import { Lock, MoreHorizontal } from "lucide-react";
import axios from 'axios';

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
}

const PasswordDashboard: React.FC = () => {
  const [passwords, setPasswords] = useState<PasswordEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPassword, setEditingPassword] = useState<PasswordEntry | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);


  useEffect(() => {
    const fetchPasswords = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://127.0.0.1:5000/passwords', { withCredentials: true });
        setPasswords(response.data.passwords);
      } catch (err) {
        setError('Failed to fetch password data');
        console.error('Error fetching passwords:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPasswords();
  }, []);

  const filteredPasswords = passwords.filter(password =>
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
    setPasswords(passwords.map(p => p.id === updatedPassword.id ? updatedPassword : p));
    setIsEditModalOpen(false);
  };

  const handleMoveToTrash = (password: PasswordEntry) => {
    // TODO: Make an API call to move the password to trash
    // For now, we'll just update it in our local state
    setPasswords(passwords.map(p => p.id === password.id ? {...p, in_trash: true} : p));
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Passwords</h1>
        {/* TODO: Implement Add Password functionality */}
        <Button>Add Password</Button>
      </div>
      <div className="flex justify-between items-center mb-4">
        <Input 
          className="max-w-sm" 
          placeholder="Search passwords..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {/* TODO: Implement Export functionality */}
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
              onClick={() => handleEdit(password)}
              className="cursor-pointer hover:bg-gray-100"
            >
              <TableCell>
                <Lock className="h-4 w-4" />
              </TableCell>
              <TableCell>
                <div>{password.name}</div>
                <div className="text-sm text-gray-500">{password.url}</div>
              </TableCell>
              <TableCell>{password.username}</TableCell>
              <TableCell>{new Date(password.created_at).toLocaleDateString()}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(password);
                    }}>
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      handleMoveToTrash(password);
                    }}>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Password</DialogTitle>
          </DialogHeader>
          {editingPassword && (
            <form onSubmit={(e) => {
              e.preventDefault();
              handleSave(editingPassword);
            }}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Name</Label>
                  <Input id="name" value={editingPassword.name} onChange={(e) => setEditingPassword({...editingPassword, name: e.target.value})} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="username" className="text-right">Username</Label>
                  <Input id="username" value={editingPassword.username} onChange={(e) => setEditingPassword({...editingPassword, username: e.target.value})} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="password" className="text-right">Password</Label>
                  <Input id="password" type="password" value={editingPassword.password} onChange={(e) => setEditingPassword({...editingPassword, password: e.target.value})} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="url" className="text-right">URL</Label>
                  <Input id="url" value={editingPassword.url} onChange={(e) => setEditingPassword({...editingPassword, url: e.target.value})} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="notes" className="text-right">Notes</Label>
                  <Input id="notes" value={editingPassword.notes} onChange={(e) => setEditingPassword({...editingPassword, notes: e.target.value})} className="col-span-3" />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Save changes</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PasswordDashboard;