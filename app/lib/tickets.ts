import axios, { AxiosError } from 'axios'
import { EventEmitter } from 'node:stream'


export interface Ticket {  
    id: number,
    tenant_name: string,
    subject: string,
    description: string,
    status: string,
    assignee?: string
} 

export interface TicketRequest {  
    tenant_name: string,
    subject: string,
    description: string,
    status: string,
    assignee?: string
} 

const ticketUrl = 'https://multi-tenant-user-service-production-3a65.up.railway.app'

export const raiseTicket = async (ticket: TicketRequest) => { 
    try { 
        const res = await axios.post(ticketUrl + "/add", { ...ticket})
        console.log(res )
        return { status: res.status, data: res.data}
    } catch(err) { 
        console.log(err)
        if(err instanceof AxiosError) return { status: err.response?.status, data: err.response?.data} 
        return null 
    }
}


export const updateTicket = async ({ticketId, tenant_name, status} : {ticketId: number, tenant_name: string, status: string}) => {
    try { 
        const res = await axios.post(ticketUrl + "/update", { ticketId, tenant_name, status})
        
        return { status: res.status, data: res.data}
    } catch(err) { 
        console.log(err)
        if(err instanceof AxiosError) return { status: err.response?.status, data: err.response?.data} 
        return null 
    }
}

export const deleteTicket = async (ticketId: number, tenant_name: string) => { 
    try { 
        const res = await axios.delete(ticketUrl + `/delete/${tenant_name}/${ticketId}`)
        return { status: res.status, data: res.data}
    } catch(err) { 
        console.log(err)
        if(err instanceof AxiosError) return { status: err.response?.status, data: err.response?.data} 
        return null 
    }
}