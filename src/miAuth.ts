import { ClientTool, UserPermissionLogin, UserRegisterInfo, User, ClientToolParams, Token, ID, Role, Brand, Advertiser } from './clientTool.interface';
import mockStrapiClientTool from './mock/mockStrapiClientTool';
import axios, { AxiosRequestConfig } from 'axios';
import { mockUsers, mockBrands, mockAdvertisers, mockRoles } from './mock/mockObjects';
import { assignObject, isEmail } from './utils';

function strapiClientTool(url: string): ClientTool {

  return {
    // user operations
    createUser: async function (token: Token, profile: UserRegisterInfo): Promise<User> {
      return new Promise<User>((resolve) => {
        if (token != 'strapi_mock_token') {
          throw new Error("Invalid token.");
        }

        if (!profile) {
          throw new Error("Please provide your user profile.");
        }
        const { username, email, password, role, access, advertisers } = profile;

        if (!username && !email && !password && !role && !access && !advertisers) {
          throw new Error("Please provide username, email, password, role, access, advertiser in profile.");
        }

        if (typeof (username) != 'string') {
          throw new Error("Type of username must be string.");
        }

        if (!isEmail(email)) {
          throw new Error("Invalid email format.");
        }

        if (typeof (password) != 'string') {
          throw new Error("Type of password must be string.");
        }

        if (typeof (role) != 'string') {
          throw new Error("Type of role must be string.");
        }

        if (typeof (access) != 'string') {
          throw new Error("Type of access must be string.");
        }

        const request: AxiosRequestConfig = { url: url + '/auth/local/register', method: 'post', data: profile };
        axios(request).then(user => {
          console.log(user)
        })
        resolve(mockUsers[0])
      });
    },
    login: async function (name: string, password: string): Promise<UserPermissionLogin> {
      return new Promise<UserPermissionLogin>(async (resolve) => {
        if (!name) {
          throw new Error("Please provide your name, which is email.");
        }

        if (!password) {
          throw new Error("Please provide your password.");
        }

        if (!isEmail(name)) {
          throw new Error("Invalid email format.");
        }

        if (typeof (password) != 'string') {
          throw new Error("Type of password must be string.");
        }

        const request: AxiosRequestConfig = {
          url: url + '/auth/local', method: 'post', data: {
            identifier: name,
            password
          }
        }
        axios.request<UserPermissionLogin>(request)
          .then(res => {
            resolve(res.data)
          })
          .catch(err => console.log(err))
      });
    },
    getMe: async function (token: Token): Promise<User> {
      return new Promise<User>((resolve) => {
        if (token != 'strapi_mock_token') {
          throw new Error("Invalid token.");
        }

        const request: AxiosRequestConfig = {
          url: url + '/users/me', method: 'get', headers: { Authorizaiton: token }
        }
        axios.request<User>(request)
          .then(res => {
            resolve(res.data)
          })
          .catch(err => console.log(err))
      });
    },
    listUsers: async function (token: Token, id?: ID, brand?: ID, advertiser?: ID): Promise<User[]> {
      return new Promise<User[]>((resolve) => {
        if (!token) {
          throw new Error("Please provide your token.");
        }
        if (token != 'strapi_mock_token') {
          throw new Error("Invalid token.");
        }

        if (id) {
          const users = mockUsers.filter(e => e.id == id)
          resolve(users)
        }

        if (brand) {
          const users = mockUsers.filter(e => e.advertisers.find(a => a.brand == id))
          resolve(users)
        }
        if (advertiser) {
          const users = mockUsers.filter(e => e.advertisers.find(a => a.id == id))
          resolve(users)
        }
        //list all users
        resolve(mockUsers)
      });
    },
    updateUser: async function (token: Token, id: ID, profile: User): Promise<User> {
      return new Promise<User>((resolve) => {
        if (token != 'strapi_mock_token') {
          throw new Error("Invalid token.");
        }

        const { username, email, password, role, access } = profile;

        if (username) {
          throw new Error("username cannot be updated");
        }

        if (email) {
          throw new Error("email cannot be updated.");
        }

        if (password && typeof (password) != 'string') {
          throw new Error("Type of password must be string.");
        }

        if (role && typeof (role) != 'number') {
          throw new Error("Type of role must be id.");
        }

        if (access && typeof (access) != 'string') {
          throw new Error("Type of access must be string.");
        }


        resolve(mockUsers[0])
      });
    },
    deleteUser: async function (token: Token, id: ID): Promise<boolean> {
      return new Promise<boolean>((resolve) => {
        if (token != 'strapi_mock_token') {
          throw new Error("Invalid token.");
        }
        try {
          const user = mockUsers.find(e => e.id == id);
          const index = mockUsers.indexOf(user);
          mockUsers.splice(index, 1)
        }
        catch (err) {
          throw new Error("Invalid id");
        }
        resolve(true)
      });
    },
    // role operations
    // listRoles: async function (token: Token): Promise<Role[]> {
    //   return new Promise<Role[]>((resolve) => {
    //     if (token != 'strapi_mock_token') {
    //       throw new Error("Invalid token.");
    //     }
    //     resolve(mockRoles)
    //   });
    // },
    // brand operations
    createBrand: async function (token: Token, profile: Brand): Promise<Brand> {
      return new Promise<Brand>((resolve) => {
        if (token != 'strapi_mock_token') {
          throw new Error("Invalid token.");
        }

        const { name } = profile
        if (!name) {
          throw new Error("Please provie name in profile");
        }

        if (typeof (name) != 'string') {
          throw new Error("Invalid type of name");
        }

        resolve(mockBrands[0])
      });
    },
    listBrands: async function (token: Token, id?: ID[]): Promise<Brand[]> {
      return new Promise<Brand[]>((resolve) => {
        if (token != 'strapi_mock_token') {
          throw new Error("Invalid token.");
        }
        if (id) {
          const brand = mockBrands.filter(e => id.includes(e.id))
          resolve(brand)
        }
        resolve(mockBrands)
      });
    },
    updateBrand: async function (token: Token, id: ID, profile: Brand): Promise<Brand> {
      return new Promise<Brand>((resolve) => {
        if (token != 'strapi_mock_token') {
          throw new Error("Invalid token.");
        }

        resolve(mockBrands[0])
      });
    },
    deleteBrand: async function (token: Token, id: ID): Promise<boolean> {
      return new Promise<boolean>((resolve) => {
        if (token != 'strapi_mock_token') {
          throw new Error("Invalid token.");
        }
        try {
          const brand = mockBrands.find(e => e.id == id);
          const index = mockBrands.indexOf(brand);
          mockBrands.splice(index, 1)
        }
        catch (err) {
          throw new Error("Invalid id");
        }
        resolve(true)
      });
    },
    // advertiser operations
    createAdvertiser: async function (token: Token, profile: Advertiser): Promise<Advertiser> {
      return new Promise<Advertiser>((resolve) => {
        if (token != 'strapi_mock_token') {
          throw new Error("Invalid token.");
        }

        const { name, brand } = profile;

        if (!name && brand) {
          throw new Error("Please provie name, and brand in profile");
        }

        if (typeof (name) != 'string') {
          throw new Error("Invalid type of name");
        }

        if (typeof (brand) != 'number') {
          throw new Error("Invalid type of brand");
        }

        resolve(mockAdvertisers[0])
      });
    },
    listAdvertisers: async function (token: Token, id?: ID[], brands?: ID[]): Promise<Advertiser[]> {
      return new Promise<Advertiser[]>((resolve) => {
        if (token != 'strapi_mock_token') {
          throw new Error("Invalid token.");
        }
        if (id) {
          const advertiser = mockAdvertisers.filter(e => id.includes(e.id))
          resolve(advertiser)
        }
        if (brands) {
          const advertiser = mockAdvertisers.filter(e => brands.includes(e.brand))
          resolve(advertiser)
        }
        resolve(mockAdvertisers)
      });
    },
    updateAdvertiser: async function (token: Token, id: ID, profile: Advertiser): Promise<Advertiser> {
      return new Promise<Advertiser>((resolve) => {
        if (token != 'strapi_mock_token') {
          throw new Error("Invalid token.");
        }

        resolve(mockAdvertisers[0]);
      });
    },
    deleteAdvertiser: async function (token: Token, id: ID): Promise<boolean> {
      return new Promise<boolean>((resolve) => {
        if (token != 'strapi_mock_token') {
          throw new Error("Invalid token.");
        }
        try {
          const advertiser = mockAdvertisers.find(e => e.id == id);
          const index = mockAdvertisers.indexOf(advertiser);
          mockAdvertisers.splice(index, 1);
        }
        catch (err) {
          throw new Error("Invalid id.");
        }
        resolve(true)
      });
    },
  }
}


export default function createClientTool(setting: ClientToolParams): ClientTool {
  const { mock = false, url } = setting;
  if (mock) return mockStrapiClientTool();
  return strapiClientTool(url);
}
