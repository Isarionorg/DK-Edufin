// app/page.tsx
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen p-8">
      <section className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-4xl font-bold">
          🚀 Next.js Frontend – Getting Started
        </h1>

        <p className="text-gray-600">
          This page is for frontend developers to understand the structure,
          responsibilities, and workflow of our Next.js application.
        </p>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">📁 Project Structure</h2>
          <ul className="list-disc pl-6 space-y-1 text-gray-700">
            <li><strong>app/</strong> – Routes, layouts, and pages (App Router)</li>
            <li><strong>components/</strong> – Reusable UI components</li>
            <li><strong>lib/</strong> – Helpers, API clients, utilities</li>
            <li><strong>services/</strong> – Business logic & API calls</li>
            <li><strong>store/</strong> – Global state (Zustand/Redux)</li>
            <li><strong>styles/</strong> – Global styles & Tailwind config</li>
            <li><strong>types/</strong> – Shared TypeScript types</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">🧠 Key Rules</h2>
          <ul className="list-disc pl-6 space-y-1 text-gray-700">
            <li>Pages live inside <code>app/</code></li>
            <li>Each folder inside <code>app/</code> becomes a route</li>
            <li><code>page.tsx</code> = route entry point</li>
            <li><code>layout.tsx</code> = persistent UI (navbar, sidebar)</li>
            <li>Keep business logic outside UI components</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">🔗 Useful Links</h2>
          <div className="flex gap-4">
            <Link
              href="https://nextjs.org/docs"
              target="_blank"
              className="text-blue-600 underline"
            >
              Next.js Docs
            </Link>
            <Link
              href="https://tailwindcss.com/docs"
              target="_blank"
              className="text-blue-600 underline"
            >
              Tailwind Docs
            </Link>
          </div>
        </section>

        <footer className="pt-8 text-sm text-gray-500">
          Frontend Team • Next.js App Router
        </footer>
      </section>
    </main>
  );
}
