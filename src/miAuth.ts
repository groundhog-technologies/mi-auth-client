import axios from 'axios'

type ID = string

interface UserRegisterInfo {
  username: string,
  email: string,
  password: string,
  role: string,
  access: string,
  advertiser?: [ID],
}

interface User {
  id: string,
  username: string,
  email: string,
  confirmed: boolean,
  role: string,
  access: string,
  advertiser?: [ID],
}

interface UserPermissionLogin {
  token: string,
  user: User
}

interface Role {
  id: ID,
  name: string,
  nb_users: number
}

interface Brand {
  id: ID,
  name: string,
  advertisers?: Advertiser[]
}

interface Advertiser {
  id: ID,
  name: string,
  brand: ID
  users: User[]
}

interface ClientTool {
  // user operations
  login?(name: string, password: string): Promise<UserPermissionLogin>,
  getMe?(): Promise<User>
  createUser?(profile: UserRegisterInfo): Promise<boolean>,
  listUsers?(id?: ID[]): Promise<User[]>,
  updateUser?(profile: User): Promise<User>,
  deleteUser?(id: ID): Promise<boolean>,
  // role operations
  listRoles?(): Promise<Role[]>,
  // brand operations
  createBrand?(profile: Brand): Promise<Brand>,
  listBrands?(id?: ID[]): Promise<Brand[]>,
  updateBrand?(profile: Brand): Promise<Brand>,
  deleteBrand?(id: ID): Promise<boolean>,
  // advertiser operations
  createAdvertiser?(profile: Advertiser): Promise<Advertiser>,
  listAdvertisers?(id?: ID[]): Promise<Advertiser[]>,
  updateAdvertiser?(profile: Advertiser): Promise<Advertiser>,
  deleteAdvertiser?(id: ID): Promise<boolean>,

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
    getMe: async function (): Promise<User> {
      const res = await axios.post(`${url}/users/me`, {})
      return res.data
    },
  }
}


export default function createClientTool(url: string): ClientTool {
  return strapiClientTool(url)
}
