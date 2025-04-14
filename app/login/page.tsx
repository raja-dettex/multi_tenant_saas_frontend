"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createUser, createTenant } from "../lib/utils";
import { useUser } from "../contexts/userContext";
export default function Login() {
  const [role, setRole] = useState("admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tenant, setTenant] = useState("");
  const [name, setName] = useState("");
  const { user, dispatch } = useUser();
  const router = useRouter();
  const handleLogin = async (e: React.MouseEvent<HTMLButtonElement>) => {
    console.log("handling login")
    e.preventDefault();
    try { 
      if(role === "admin") {
        console.log('creating teanat')
        const admin = await createTenant(tenant, email, password);
        console.log(admin)
        // setTimeout(()=> { 
        localStorage.setItem('user', JSON.stringify({ username : admin.username, email: admin.email, role: "admin", users: admin.users}))
        
        // }, 4000)
          dispatch({type: 'SET_USER', payload: { username : admin.username, email: admin.email, role: "admin", users: admin.users}});
          router.push("/dashboard/admin")
        return
      }
      console.log('creating user')
      const user = await createUser( email, password, name);
      console.log(user)
      localStorage.setItem('user', JSON.stringify({username: user.username, email: user.email, role: "client", tenant: user.tenant_username, users: []}))
      dispatch({type: 'SET_USER', payload: {username: user.username, email: user.email, role: "client", tenant: user.tenant_username, users: []}});
      console.log("routing")
      console.log(user.tenant_id)
      router.push(`/dashboard/${user.tenant_id}/client`)
      return
    } catch(error) { 
      console.log(error)
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="flex flex-col items-center bg-gray-900 p-6 rounded-2xl shadow-lg shadow-black/40 w-80">
        <h2 className="text-xl font-semibold text-white mb-4">Login</h2>
  
        <input
          className="p-2 border border-gray-700 bg-gray-800 text-gray-200 rounded w-full mb-2 placeholder-gray-400"
          type="text"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
  
        <input
          className="p-2 border border-gray-700 bg-gray-800 text-gray-200 rounded w-full mb-2 placeholder-gray-400"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
  
        <h2 className="text-lg text-white mb-2">Select Your Role</h2>
        <select
          className="p-2 border border-gray-700 bg-gray-800 text-gray-200 rounded w-full mb-2"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="admin">Admin</option>
          <option value="client">Client</option>
        </select>
  
        {role === "client" && (
          <input
            className="p-2 border border-gray-700 bg-gray-800 text-gray-200 rounded w-full mb-2 placeholder-gray-400"
            type="text"
            placeholder="Tenant group"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}
  
        {role === "admin" && (
          <input
            className="p-2 border border-gray-700 bg-gray-800 text-gray-200 rounded w-full mb-2 placeholder-gray-400"
            type="text"
            placeholder="Corp name"
            value={tenant}
            onChange={(e) => setTenant(e.target.value)}
          />
        )}
  
        <button
          className="bg-rose-900 hover:bg-rose-800 text-white p-2 rounded w-full mt-2 font-semibold shadow shadow-rose-900/40"
          onClick={(e) => handleLogin(e)}
        >
          Login
        </button>
      </div>
    </div>
  );
  
}
