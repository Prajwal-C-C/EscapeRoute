import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <header className="w-full py-4 px-6 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-2xl font-bold text-green-500">EscapeRoute</h1>
              <ul className="flex-start mx-auto space-x-4">
                <li><a href="#" className="text-gray-600 hover:text-green-500 dark:text-gray-400 dark:hover:text-green-500">Home</a></li>
                <li><a href="#" className="text-gray-600 hover:text-green-500 dark:text-gray-400 dark:hover:text-green-500">Features</a></li>
                <li><a href="#" className="text-gray-600 hover:text-green-500 dark:text-gray-400 dark:hover:text-green-500">About</a></li>
              </ul>
        </header>
    </div>
  );
}
