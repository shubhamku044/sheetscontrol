import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h2 className="text-3xl font-bold">404 - Page Not Found</h2>
      <p className="text-muted-foreground mt-4">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link href={'/'} className="">
        Go to home page
      </Link>
    </div>
  );
}
