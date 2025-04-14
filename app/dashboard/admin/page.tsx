"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/app/contexts/userContext";
import { useRouter } from "next/navigation";
export default function TenantDashboard() {
  const router = useRouter()
  const { user , dispatch} = useUser();
  const [username, setUsername] = useState(user?.username);
  const [email, setEmail] = useState(user?.email);
  const [tenant, setTenant] = useState(user?.tenant);
  const [users, setUsers] = useState(user?.users || []);
  const handleAdminLogout = (e:any) => { 
    e.preventDefault()
    if(localStorage.getItem('user')) { 
      localStorage.removeItem('user')
      
    }
    dispatch({type: 'CLEAR_USER'})
    router.push('/login')
    
  }
  useEffect(()=> { 
    const str = localStorage.getItem('user')
    if(str) {
      const admin = JSON.parse(str)
      dispatch({type: 'SET_USER', payload: { username : admin.username, email: admin.email, role: "admin", users: admin.users}});
    }
  }, [])
  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setEmail(user.email);
      setTenant(user.tenant);
      setUsers(user.users || []);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Tenant Dashboard</h1>
      <button onClick={e=> handleAdminLogout(e)}>Log Out</button>
      {/* Tenant Info Card */}
      <div className="bg-white shadow-lg rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex flex-row items-center space-x-4">
          <div className="h-16 w-16 bg-gray-300 rounded-full"></div> {/* Placeholder for Avatar */}
          <div>
            <h2 className="text-xl font-semibold">{username}</h2>
            <p className="text-gray-500">{email}</p>
            <p className="text-gray-700 mt-2">
              Tenant: <span className="font-semibold">{tenant}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white shadow-lg rounded-xl border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Users in {tenant}</h2>

        {users.length === 0 ? (
          <p className="text-gray-500">No users found in this tenant.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {users.map((u, index) => (
              <li key={index} className="py-4 flex justify-between">
                <div>
                  <p className="text-lg font-medium text-gray-900">{u.username}</p>
                  <p className="text-sm text-gray-500">{u.email}</p>
                </div>
                <span className="text-sm text-gray-700 bg-gray-200 px-3 py-1 rounded-md">{u.role || "User"}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
