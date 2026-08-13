import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0A0A0A] text-white px-6 text-center">
      <h2 className="text-4xl font-bold mb-4">404 - Position Not Found</h2>
      <p className="text-white/60 mb-8 max-w-md">The page or move you are looking for does not exist.</p>
      <Link
        href="/"
        className="px-6 py-3 rounded-full bg-white text-[#0A0A0A] font-semibold text-xs uppercase tracking-wider hover:bg-white/90 transition-colors"
      >
        Return to Home
      </Link>
    </div>
  );
}
