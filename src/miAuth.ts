import { ClientTool, UserPermissionLogin, UserRegisterInfo, User, ClientToolParams } from './clientTool.interface';
import mockStrapiClientTool from './mock/mockStrapiClientTool';
import axios from 'axios';

function strapiClientTool(url: string): ClientTool {
  return mockStrapiClientTool();
  // createUser: async function (profile: UserRegisterInfo): Promise<User> {
  //   const res = await axios.post(`${url}/auth/local/register`, profile)
  //   if (res.data.confirmed) return res.data
  //   return res.data
  // },
  // login: async function (name: string, password: string): Promise<UserPermissionLogin> {
  //   const res = await axios.post(`${url}/auth/local/`, { name, password })
  //   return res.data
  // },
  // getMe: async function (): Promise<User> {
  //   const res = await axios.post(`${url}/users/me`, {})
  //   return res.data
  // },

}


export default function createClientTool(setting: ClientToolParams): ClientTool {
  const { mock = false, url } = setting;
  if (mock) return mockStrapiClientTool();
  return strapiClientTool(url);
}
