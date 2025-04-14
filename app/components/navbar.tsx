"use client"
import { useRouter } from "next/navigation";
export const Navbar = () => {
    const router = useRouter();
    return (
      <nav className="bg-gray-900 p-4 text-white flex justify-between items-center shadow-md shadow-black/40">
        <h1 className="text-2xl font-bold tracking-wide text-rose-500">Solvex</h1>
        <button
          className="bg-rose-900 hover:bg-rose-800 text-white px-4 py-2 rounded-md font-medium transition"
          onClick={(e) => {
            e.preventDefault();
            router.push("/login");
          }}
        >
          Login
        </button>
      </nav>
    );
    
};