'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Logout failed');
      }

      toast.success('Successfully logged out');
      router.push('/');
    } catch (error) {
      console.log('Error logging out:', error);
      toast.error('Failed to log out');
    }
  };

  return (
    <Button
      onClick={handleLogout}
      variant="secondary"
      className="text-destructive hover:text-destructive/80"
    >
      Log Out
    </Button>
  );
}
