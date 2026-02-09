import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="text-center">
        <h1 className="text-6xl font-bold">404</h1>
        <h2 className="mb-4 text-2xl font-bold">Page Not Found</h2>
        <p className="mb-8 text-gray-600">The page you are looking for does not exist.</p>
        <Link href="/" className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
          Go Home
        </Link>
      </div>
    </div>
  );
}
