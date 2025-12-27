import Link from 'next/link'

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6 text-center">
            <h2 className="text-4xl font-black text-slate-900 mb-4">404 - Not Found</h2>
            <p className="text-slate-500 text-lg mb-8 max-w-md">
                Oops! The page you are looking for does not exist. It might have been moved or deleted.
            </p>
            <Link
                href="/"
                className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors"
            >
                Return Home
            </Link>
        </div>
    )
}
