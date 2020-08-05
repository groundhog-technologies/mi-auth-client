import axios from 'axios'

type ID = string

interface UserRegisterInfo {
  username: string,
  email: string,
  password: string,
  role: string,
  brand: ID,
  advertiser?: [ID],
}

interface UserPermission {
  id: string,
  username: string,
  email: string,
  confirmed: boolean,
  role: string,
  brand: ID,
  advertiser?: [ID],
}

interface UserPermissionLogin {
  token: string,
  userPermission: UserPermission
}

interface ClientTool {
  createUser(profile: UserRegisterInfo): Promise<boolean>,
  login(name: string, password: string): Promise<UserPermissionLogin>,
  getMe(token: string): Promise<UserPermission>
}

function strapiClientTool(url: string): ClientTool {
  return {
    createUser: async function (profile: UserRegisterInfo): Promise<boolean> {
      const res = await axios.post(`${url}/auth/local/register`, profile)
      if (res.data.confirmed) return true
      return false
    },
    login: async function (name: string, password: string): Promise<UserPermissionLogin> {
      const res = await axios.post(`${url}/auth/local/`, { name, password })
      return res.data
    },
    getMe: async function (token: string): Promise<UserPermission> {
      const res = await axios.post(`${url}/auth/local/`, { token })
      return res.data
    },
  }
}


export default function createClientTool(url: string): ClientTool {
  return strapiClientTool(url)
}















