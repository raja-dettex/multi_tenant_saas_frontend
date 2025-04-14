import axios from 'axios';

const base_url = 'https://multitenantsaas-production.up.railway.app'
export const createTenant = async (username: string, email: string, password: string ) => { 
    try { 
        const response = await axios.post(`${base_url}/tenants/`, {
            username,
            email,
            password
        });
        return response.data;
    } catch(error) { 
        console.log(error)
        throw error
    }
}


export const getUsers = async (tenantId: number) => {
    try { 
        const response = await axios.get(`${base_url}/users/tenant/${tenantId}`)
        return response.data
    } catch(error) { 
        console.log(error)
        return null
    }
}

export const createUser = async (email: string, password: string,  tenantGroup: string) => {
    console.log(tenantGroup)
    try {
        const response = await axios.post(`${base_url}/users/`, {
            username: email.split('@')[0],
            email,
            password,
            tenant_username: tenantGroup
        }, { headers: { 
            "X-Tenant": tenantGroup,
            maxRedirects: 0,
            "Content-Type": "application/json"
        }});
        return response.data;
    } catch (error) {
        console.log(error)
        throw error
    }
}