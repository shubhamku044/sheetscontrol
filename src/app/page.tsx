import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="mb-10 text-5xl">Sheetscontrol</h1>
      <div className="flex gap-2">
        <Button size="sm">Give permission</Button>
        <Button size="sm">Organise</Button>
      </div>
    </div>
  );
}
