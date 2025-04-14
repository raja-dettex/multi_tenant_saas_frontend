"use client"
import { useRouter } from "next/navigation";
export const Navbar = () => {
    const router = useRouter();
    return (
      <nav className="bg-blue-600 p-4 text-white flex justify-between">
        <h1 className="text-xl">Client Portal</h1>
        <button className="text-white" onClick={(e) => {e.preventDefault(); router.push("/login")}}>Login</button>
      </nav>
    );
  };