"use client";

import { useState, useEffect, useRef } from "react";
import { useUser } from "@/app/contexts/userContext";
import { useRouter, useParams } from "next/navigation";
import { getUsers } from "@/app/lib/utils";
import {  deleteTicket, raiseTicket, Ticket, updateTicket } from "@/app/lib/tickets";
interface TeamMember {
  username: string;
  email: string;
  role: string;
  tenant: string;
}

type Message = {
  header: string;
  value?: string;
  group: string;
  connId?: string;
  timestamp?: number;
};

export default function ClientDashboard() {
  const router = useRouter();
  const params = useParams();
  const tenantId = params?.tenantId?.toString();
  const { user, dispatch } = useUser();

  const [username, setUsername] = useState(user?.username);
  const [email, setEmail] = useState(user?.email);
  const [tenant, setTenant] = useState(user?.tenant);
  const [teamMates, setTeamMates] = useState<TeamMember[]>([]);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showTicketsModal, setShowTicketsModal] = useState(false);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [chatMessage, setChatMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const [ticketEvent, setTicketEvent] = useState<EventSource | null>(null); 
  
  
  const handleUserLogout = (e: any) => {
    e.preventDefault();
    localStorage.removeItem("teamMates");
    localStorage.removeItem("user");
    dispatch({ type: "CLEAR_USER" });
    router.push("/login");
  };

  const handleGroupChat = (e: any) => {
    e.preventDefault();
    const ws = new WebSocket("wss://multi-tenant-user-service-production.up.railway.app");
    console.log(user?.tenant?.replace(" ", "_"))
    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          header: "join",
          value: null,
          group: user?.tenant?.replace(" ", "_") ?? "",
          connId: user?.username,
          timestamp: Date.now() / 1000,
        })
      );
    };

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data.toString());
      setMessages((m) => [...m, data]);
    };

    setWs(ws);
    setShowChatModal(true);
  };

  useEffect(() => {
    const teamMatesStr = localStorage.getItem("teamMates");
    if (teamMatesStr) {
      setTeamMates(JSON.parse(teamMatesStr));
    }

    const str = localStorage.getItem("user");
    if (str) {
      const userItem = JSON.parse(str);
      setUsername(userItem.username);
      setEmail(userItem.email);
      setTenant(userItem.tenant);
      console.log(userItem)
      dispatch({
        type: "SET_USER",
        payload: {
          username: userItem.username,
          email: userItem.email,
          role: "client",
          tenant: userItem.tenant,
          users: [],
        },
      });
    }
  }, []);

  useEffect(() => {
    if (user && teamMates.length === 0 && tenantId) {
      getUsers(parseInt(tenantId))
        .then((data) => {
          const members = data
            .filter((u: any) => u.email !== user.email)
            .map((u: any) => ({
              username: u.username,
              email: u.email,
              role: "client",
              tenant: u.tenant,
            }));
          setTeamMates(members);
          localStorage.setItem("teamMates", JSON.stringify(members));
        })
        .catch(console.error);
      setUsername(user.username);
      setEmail(user.email);
      setTenant(user.tenant);
    }
  }, [user]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  const ticketStream = (e:any) => { 
    e.preventDefault()
    setShowTicketsModal(true)
    const eventSource = new EventSource(`https://multi-tenant-user-service-production-3a65.up.railway.app/events/${user?.tenant?.replace(" ", "_")}`);
    setTicketEvent(eventSource)
    

    eventSource.onopen = () => {
      console.log('EventSource connected')
      eventSource.addEventListener('TicketEvent', function (event) {
          console.log(event)
          const ticket = JSON.parse(event.data);
          console.log('ticket here', ticket);
          setTickets(t=> [...t, ticket])
      });
  
      eventSource.addEventListener('TicketAdded', function (event) {
          console.log(event)
          const ticket = JSON.parse(event.data);
          console.log('ticket added', ticket);
          setTickets(t=> [...t, ticket])
      });
  
      eventSource.addEventListener('TicketUpdated', function (event) {
          console.log(event)
          const ticket = JSON.parse(event.data);
          console.log('ticket updated', ticket);
          setTickets(t=> [...t, ticket])
      });
      eventSource.onerror = (error) => {
        console.error('EventSource failed', error)
        //eventSource.close()
      }
  
      eventSource.onmessage = (event) => {
          console.log("received message: ", event)
      }

      console.log(tickets)

    }
  }
  const closeTicketStream = (e: any) => { 
    e.preventDefault()
    
    if(ticketEvent) { 
      ticketEvent.close()
      setTickets([])
      setTicketEvent(null)
    }
    setShowTicketsModal(false)
  }
  const [newTicketSubject, setNewTicketSubject] = useState<string>("");
  const [newTicketDescription, setNewTicketDescription] = useState<string>("");
  
  const addTicket = async (e: any) => {
    e.preventDefault() 
    const ticket = { 
      subject: newTicketSubject,
      description: newTicketDescription,
      status: "open",
      tenant_name: user?.tenant?.replaceAll(" ", "_") ?? "",
    }
    console.log(ticket)
    const res = await raiseTicket( {...ticket})
    if (res) { 
      const { status, data } = res
      if(status === 201) { 
        setNewTicketSubject("")
        setNewTicketDescription("")
      }
    } 
  }
  const [updatedStatus, setUpdatedStatus] = useState<string>("")
  const handleUpdateTicket = async( e: any, ticketId: number, tenant_name: string, status: string) => { 
    e.preventDefault()
    const updatedRes = await updateTicket({ticketId, tenant_name, status})
    if(updatedRes) { 
      if(updatedRes.status === 201) { 
        setTickets(tickets => tickets.filter(t=> t.id !== ticketId))
      }
    }
  }


  const closeTicket = async(e: any, ticketId: number, tenant_name: string) => { 
    const res = await deleteTicket(ticketId, tenant_name)
    if(res) { 
      if(res.status === 200) { 
        setTickets(tickets => tickets.filter(t=> t.id !== ticketId))
      }
    } 
  }


  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 w-full mx-auto bg-gray-900 min-h-screen text-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Client Dashboard</h1>
        <button
          onClick={handleUserLogout}
          className="bg-red-900 text-white px-4 py-2 rounded-lg hover:bg-red-800 transition"
        >
          Log out
        </button>
      </div>
  
      <div className="bg-gray-800 shadow-lg rounded-xl border border-gray-700 p-6 mb-8">
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 bg-gray-600 rounded-full"></div>
          <div>
            <h2 className="text-xl font-semibold text-white">{username}</h2>
            <p className="text-gray-400">{email}</p>
          </div>
        </div>
        <div className="mt-4">
          <p>
            Tenant: <span className="font-semibold">{tenant}</span>
          </p>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={handleGroupChat}
              className="bg-teal-600 text-white py-2 px-4 rounded-lg hover:bg-teal-800 transition w-full"
            >
              Start Group Chat
            </button>
            <button
              onClick={(e) => ticketStream(e)}
              className="bg-cyan-600 text-white py-2 px-4 rounded-lg hover:bg-cyan-800 transition w-full"
            >
              View Tickets
            </button>
          </div>
        </div>
      </div>
  
      <div className="bg-gray-800 shadow-md rounded-xl p-6 border border-gray-700">
        <h2 className="text-2xl font-semibold mb-4 text-white">Team Members</h2>
        {teamMates.length > 0 ? (
          <ul className="space-y-3">
            {teamMates.map((member, index) => (
              <li
                key={index}
                className="border p-3 rounded-lg flex justify-between bg-gray-700 border-gray-600"
              >
                <div>
                  <p className="font-medium text-white">{member.username}</p>
                  <p className="text-sm text-gray-400">{member.email}</p>
                </div>
                <div className="text-sm text-gray-300">
                  Role: <span className="font-medium">{member.role}</span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400">No team members available.</p>
        )}
      </div>
  
      {/* Group Chat Fullscreen Modal */}
      {showChatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex flex-col">
          <div className="flex justify-between items-center p-4 bg-gray-800 shadow-md text-white">
            <h3 className="text-xl font-bold">
              Group Chat - {user.tenant ?? ""}
            </h3>
            <button
              onClick={(e) => {
                e.preventDefault();
                ws?.send(
                  JSON.stringify({
                    header: "close",
                    group: user?.tenant?.replace(" ", "_") ?? "",
                    connId: user.username,
                    value: null,
                    timestamp: Date.now() / 1000,
                  })
                );
                ws?.close();
                setWs(null);
                setMessages([]);
                setShowChatModal(false);
              }}
              className="text-gray-400 hover:text-red-400 text-sm"
            >
              ✕ Close
            </button>
          </div>
  
          <div className="flex-1 overflow-y-auto bg-gray-900 p-6 space-y-4">
            {messages.map((msg, idx) => {
              const isOwn = msg.connId === user.username;
              return (
                <div
                  key={idx}
                  className={`max-w-xl px-4 py-2 rounded-lg text-white ${
                    isOwn
                      ? "bg-green-600 self-end ml-auto text-right"
                      : "bg-gray-700 self-start mr-auto text-left"
                  }`}
                >
                  <p className="text-sm font-medium">{msg.value}</p>
                  <span className="text-xs text-gray-300 block mt-1">
                    {msg.connId}
                  </span>
                </div>
              );
            })}
            <div ref={messageEndRef} />
          </div>
  
          <div className="p-4 bg-gray-800 flex items-center gap-2">
            <input
              type="text"
              className="flex-1 border border-gray-600 bg-gray-900 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Type a message..."
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && chatMessage.trim()) {
                  const newMsg = {
                    header: "chat",
                    value: chatMessage,
                    group: user?.tenant?.replace(" ", "_") ?? "",
                    connId: user.username,
                    timestamp: Date.now() / 100,
                  };
                  setMessages((m) => [...m, newMsg]);
                  ws?.send(JSON.stringify(newMsg));
                  setChatMessage("");
                }
              }}
            />
            <button
              onClick={(e) => {
                e.preventDefault();
                const newMsg = {
                  header: "chat",
                  value: chatMessage,
                  group: user?.tenant?.replace(" ", "_") ?? "",
                  connId: user.username,
                  timestamp: Date.now() / 100,
                };
                setMessages((m) => [...m, newMsg]);
                ws?.send(JSON.stringify(newMsg));
                setChatMessage("");
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Send
            </button>
          </div>
        </div>
      )}
  
      {showTicketsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 w-full h-full max-w-screen-xl max-h-screen-lg overflow-auto">
            <h3 className="text-2xl font-semibold mb-6 text-white">Tickets</h3>
            <div className="space-y-4 h-full overflow-y-auto">
              {tickets.length > 0 ? (
                tickets.map((ticket, idx) => (
                  <div key={idx} className="border p-6 rounded-lg bg-gray-800 border-gray-700 mb-4">
                    <h4 className="font-semibold text-white">{ticket.subject}</h4>
                    <p className="text-gray-400">Status: {ticket.status}</p>
                    <div className="flex space-x-4 mt-4">
                      <button
                        onClick={(e) => closeTicket(e, ticket.id, ticket.tenant_name)}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                      >
                        Close
                      </button>
                      {ticket.status === 'open' && (
                        <button
                          onClick={(e) => handleUpdateTicket(e, ticket.id, ticket.tenant_name, "processing")}
                          className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700"
                        >
                          Mark as Processing
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400">No tickets available</p>
              )}
              <form onSubmit={addTicket} className="space-y-4">
                <div className="space-y-2">
                  <input
                    type="text"
                    className="border border-gray-600 bg-gray-800 text-white p-3 w-full rounded-lg"
                    placeholder="Subject"
                    value={newTicketSubject}
                    onChange={(e) => setNewTicketSubject(e.target.value)}
                  />
                  <textarea
                    className="border border-gray-600 bg-gray-800 text-white p-3 w-full rounded-lg"
                    placeholder="Description"
                    value={newTicketDescription}
                    onChange={(e) => setNewTicketDescription(e.target.value)}
                    rows={4}
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg w-full hover:bg-blue-700"
                  >
                    Add Ticket
                  </button>
                </div>
              </form>
            </div>
            <button
              onClick={closeTicketStream}
              className="mt-6 bg-red-900 text-white px-6 py-3 rounded-lg w-full hover:bg-red-800"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
  
}
