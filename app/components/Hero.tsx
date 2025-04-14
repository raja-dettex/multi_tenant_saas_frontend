"use client"
import { useRouter } from "next/navigation";
export const Hero = () => {
    const router = useRouter()
    return (
      <section className="bg-gradient-to-r from-indigo-900 via-purple-900 to-black text-white py-20 px-6 min-h-100">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Welcome to Solvex</h2>
          <p className="text-xl md:text-2xl mb-8">
            The most powerful, secure, and intuitive platform for managing your clients and services.
          </p>
          <button
            className="bg-rose-900 hover:bg-rose-800 text-white px-6 py-3 rounded-md font-medium transition"
            onClick={() => router.push("/login")}
          >
            Get Started
          </button>
        </div>
      </section>
    );
  };
  