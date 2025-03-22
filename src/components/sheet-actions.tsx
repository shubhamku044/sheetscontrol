'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Copy, Download, FileEdit, MoreVertical, Table, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface SheetActionsProps {
  sheet: {
    id: string;
    name: string;
    webViewLink?: string;
  };
}

export function SheetActions({ sheet }: SheetActionsProps) {
  const [isRenaming, setIsRenaming] = useState(false);

  console.log('Is renaming', isRenaming);

  const handleMakeCopy = async () => {
    try {
      setIsRenaming(true);
      const response = await fetch('/api/copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId: sheet.id }),
      });
      setIsRenaming(false);

      if (!response.ok) throw new Error('Failed to copy');

      toast.success('Success', {
        description: 'File copied successfully',
      });
      window.location.reload();
    } catch (error) {
      console.error('Error copying file:', error);
      toast.error('Error', {
        description: 'Failed to copy file',
      });
    }
  };

  const handleDownload = () => {
    window.open(`https://docs.google.com/spreadsheets/d/${sheet.id}/export?format=xlsx`, '_blank');
  };

  const handleRename = async () => {
    const newName = prompt('Enter new name:', sheet.name);
    if (!newName) return;

    try {
      const response = await fetch('/api/rename', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId: sheet.id, newName }),
      });

      if (!response.ok) throw new Error('Failed to rename');
      toast.success('Success', {
        description: 'File renamed successfully',
      });
      window.location.reload();
    } catch (error) {
      console.error('Error renaming file:', error);
      toast.error('Error', {
        description: 'Failed to rename file',
      });
    }
  };

  const handleTrash = async () => {
    try {
      const response = await fetch('/api/trash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId: sheet.id }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      toast.success('Success', {
        description: 'File moved to trash successfully',
      });

      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      console.error('Error trashing file:', error);
      toast.error('Error', {
        description: 'Failed to move file to trash',
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <MoreVertical className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={sheet.webViewLink || '#'} target="_blank" className="cursor-pointer">
            <Table className="mr-2 h-4 w-4" />
            Open in Sheets
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleMakeCopy}>
          <Copy className="mr-2 h-4 w-4" />
          Make a Copy
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDownload}>
          <Download className="mr-2 h-4 w-4" />
          Download
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleRename}>
          <FileEdit className="mr-2 h-4 w-4" />
          Rename
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleTrash} className="text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Move to Trash
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
