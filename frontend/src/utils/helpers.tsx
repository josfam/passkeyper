import { Button } from '../components/ui/button'; // Replace 'your-button-library' with the actual library you're using
import { toast} from "react-toastify";
import { Check, Clipboard } from 'lucide-react';

export const filterPasswords = (
    passwords: { name?: string; username?: string; url?: string }[],
    searchTerm: string
  ) => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return passwords.filter((password) =>
      password.name?.toLowerCase().includes(lowerCaseSearchTerm) ||
      password.username?.toLowerCase().includes(lowerCaseSearchTerm) ||
      password.url?.toLowerCase().includes(lowerCaseSearchTerm)
    );
  };

  export const copyToClipboard = (
    text: string,
    field: string,
    setCopiedField: React.Dispatch<React.SetStateAction<string | null>>
  ) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopiedField(field);
        toast.success(`${field} has been copied to your clipboard.`);
        setTimeout(() => setCopiedField(null), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
        toast.error("Failed to copy text to clipboard.");
      });
  };
  
  export const renderCopyButton = (
    text: string,
    field: string,
    copiedField: string | null,
    setCopiedField: React.Dispatch<React.SetStateAction<string | null>>
  ) => (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="ml-2"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        copyToClipboard(text, field, setCopiedField);
      }}
    >
      {copiedField === field ? (
        <Check className="h-4 w-4" />
      ) : (
        <Clipboard className="h-4 w-4" />
      )}
    </Button>
  );
  