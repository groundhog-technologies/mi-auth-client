import { ClientTool, UserPermissionLogin, UserRegisterInfo, User, ClientToolParams, Token, ID, Role, Brand, Advertiser, updateAdvertiser, updateBrand, listParams, Platform, BrandOwner } from './clientTool.interface';
import mockStrapiClientTool from './mock/mockStrapiClientTool';
import axios, { AxiosRequestConfig } from 'axios';
import { assignObject, isEmail, roleNames, isValidKey, setUrl, users } from './utils';
import * as _ from 'lodash'
import { identity, camelCase } from 'lodash';
import { StrapiUser } from './strapi.interface';


function strapiClientTool(url: string): ClientTool {

  axios.defaults.baseURL = setUrl(url);

  return {
    // user operations
    deleteSuperAdmin: async function (token: Token, brand: number): Promise<void> {
      const superAdmins = await this.listUsers(token, { brands: [brand], role: ['superAdmin'] })
      await Promise.all[
        superAdmins.forEach((e: { id: any; }) => {
          this.updateUser(token, e.id, { advertiser: [] })
        })]
    },

    createUser: async function (token: Token, profile: UserRegisterInfo): Promise<User> {
      return new Promise<User>(async (resolve, reject) => {
        if (!profile) {
          throw new Error("Please provide your user profile.");
        }
        const { username, email, password, role, platform, advertisers } = profile;

        if (!username && !email && !password && !role && !platform && !advertisers) {
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

        if (!isValidKey(role, roleNames)) {
          throw new Error("Type of role must be string.");
        }

        if (!Array.isArray(platform)) {
          throw new Error("Type of platform must be array.");
        }

        const allRoles: Role[] = await this.listRoles(token);
        const allPlatforms: Platform[] = await this.listPlatforms(token);

        const data: any = profile;
        data.role = _.find(allRoles, e => e.name == roleNames[role]).id;
        data.platforms = _.map(_.filter(allPlatforms, e => { return platform.includes(e.name) }), e => e.id)

        const config: AxiosRequestConfig = { headers: { Authorization: `Bearer ${token}` } };
        axios.post('/auth/local/register', data, config).then(async res => {
          const { id, email, username, role, platforms = [], advertisers = [] } = res.data.user
          const brandIds = new Set();
          const reducedPlatform: string[] = [];
          advertisers.forEach((e: { brand: number }) => {
            brandIds.add(e.brand);
          });
          platforms.forEach((e: { name: string; }) => {
            reducedPlatform.push(e.name)
          });

          const brand = brandIds.size == 0 ? [] : await this.listBrands(token, { ids: Array.from(brandIds) })
          const data: User = { id, email, username, role: camelCase(role.name), platform: reducedPlatform, brand, advertisers }
          resolve(data)
        }).catch(err => {
          console.log(err)
          if (err.response)
            console.log(err.response.data.data[0])
          reject(err)
        })
      });
    },
    login: async function (name: string, password: string): Promise<UserPermissionLogin> {
      return new Promise<UserPermissionLogin>(async (resolve, reject) => {
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

        axios.post('/auth/local', { identifier: name, password })
          .then(async res => {
            let { jwt, user: { id, email, username, role, platforms, advertisers } } = res.data

            const brandIds = new Set();
            advertisers.forEach((e: { brand: number }) => {
              brandIds.add(e.brand);
            });
            const brand = brandIds.size == 0 ? [] : await this.listBrands(jwt, { ids: Array.from(brandIds) })
            const reducedPlatform = _.map(platforms, e => e.name)
            const reducedAdvertiser = _.map(advertisers, e => { return { id: e.id, name: e.name, brand: e.brand } })
            const data: User = { id, email, username, role: camelCase(role.name), platform: reducedPlatform, brand, advertisers: reducedAdvertiser }
            resolve({ jwt, user: data })
          })
          .catch(err => {
            console.log(err)
            reject(err)
          })
      });
    },
    getMe: async function (token: Token): Promise<User> {
      return new Promise<User>((resolve, reject) => {

        const config: AxiosRequestConfig = {
          headers: { Authorization: `Bearer ${token}` }
        }
        axios.get('/users/me', config)
          .then(async res => {
            let { id, email, username, role, platforms, advertisers } = res.data

            const brandIds = new Set();
            const reducedPlatform: string[] = [];
            advertisers.forEach((e: { brand: number }) => {
              brandIds.add(e.brand);
            });
            const brand = brandIds.size == 0 ? [] : await this.listBrands(token, { ids: Array.from(brandIds) })
            platforms.forEach((e: { name: string; }) => {
              reducedPlatform.push(e.name)
            });
            const data: User = { id, email, username, role: camelCase(role.name), platform: reducedPlatform, brand, advertisers }
            resolve(data)
          })
          .catch(err => {
            console.log(err)
            reject(err)
          })
      });
    },
    listUsers: async function (token: Token, select: listParams): Promise<User[]> {
      return new Promise<User[]>(async (resolve, reject) => {
        if (!token) {
          throw new Error("Please provide your token.");
        }

        const { ids, brands, advertisers, roles } = select
        let params = new URLSearchParams();
        if (ids) {
          ids.forEach(e => {
            if (e) params.append('id_in', e.toString())
          })
        }
        if (brands) {
          brands.forEach(e => {
            if (e) params.append('advertisers.brand_in', e.toString())
          })
        }
        if (advertisers) {
          advertisers.forEach(e => {
            if (e) params.append('advertisers.id_in', e.toString())
          })
        }
        if (roles) {
          roles.forEach(e => {
            if (e) params.append('role.name_in', roleNames[e.toString()])
          })
        }

        const config: AxiosRequestConfig = { params, headers: { Authorization: `Bearer ${token}` } };
        axios.get('/users', config).then(async res => {
          const data: User[] = []
          const allBrands = await this.listBrands(token)
          res.data.forEach((user: { id: any, email: any; username: any; role: any; platforms: any; advertisers: any; }) => {
            const { id, email, username, role, platforms, advertisers } = user
            const brandIds = new Set();
            const reducedPlatform: string[] = [];
            advertisers.forEach((e: { brand: number }) => {
              brandIds.add(e.brand);
            });
            platforms.forEach((e: { name: string; }) => {
              reducedPlatform.push(e.name)
            });

            const brand = allBrands.filter((e: { id: number; }) => Array.from(brandIds).includes(e.id))
            data.push({ id, email, username, role: camelCase(role.name), platform: reducedPlatform, brand, advertisers })

          });
          resolve(data)
        }).catch(err => {
          console.log(err)
          reject(err)
        })
      });
    },
    updateUser: async function (token: Token, id: ID, profile: User): Promise<User> {
      return new Promise<User>(async (resolve, reject) => {
        const { username, email, password, role, platform } = profile;

        if (username) {
          throw new Error("username cannot be updated");
        }

        if (email) {
          throw new Error("email cannot be updated.");
        }

        if (password && typeof (password) != 'string') {
          throw new Error("Type of password must be string.");
        }

        if (role && typeof (role) != 'string') {
          throw new Error("Type of role must be string.");
        }

        if (platform && !Array.isArray(platform)) {
          throw new Error("Type of platform must be array.");
        }

        const data: any = profile;

        if (role) {
          const allRoles: Role[] = await this.listRoles(token);
          data.role = _.find(allRoles, e => e.name == roleNames[role]).id;
        }

        if (platform) {
          const allPlatforms: Platform[] = await this.listPlatforms(token);
          data.platforms = _.map(_.filter(allPlatforms, e => { return platform.includes(e.name) }), e => e.id)
        }

        const config: AxiosRequestConfig = { headers: { Authorization: `Bearer ${token}` } };
        axios.put(`/users/${id}`, data, config).then(async res => {
          const { id, email, username, role, platforms, advertisers } = res.data
          const brandIds = new Set();
          const reducedPlatform: string[] = [];
          advertisers.forEach((e: { brand: number }) => {
            brandIds.add(e.brand);
          });
          platforms.forEach((e: { name: string; }) => {
            reducedPlatform.push(e.name)
          });
          const brand = brandIds.size == 0 ? [] : await this.listBrands(token, { ids: Array.from(brandIds) })
          const data: User = { id, email, username, role: camelCase(role.name), platform: reducedPlatform, brand, advertisers }
          resolve(data)
        }).catch(err => {
          console.log(err)
          reject(err)
        })
      });
    },
    deleteUser: async function (token: Token, id: ID): Promise<boolean> {
      return new Promise<boolean>((resolve, reject) => {
        const config: AxiosRequestConfig = { headers: { Authorization: `Bearer ${token}` } };
        axios.delete(`/users/${id}`, config).then(res => {
          resolve(true)
        }).catch(err => {
          console.log(err)
          reject(err)
        })
      });
    },
    // role operations
    listRoles: async function (token: Token): Promise<Role[]> {
      return new Promise<Role[]>((resolve, reject) => {
        const config: AxiosRequestConfig = {
          headers: { Authorization: `Bearer ${token}` }
        };
        axios.get<{ roles: Role[] }>('/users-permissions/roles', config).then(res => {
          resolve(res.data.roles)
        }).catch(err => {
          console.log(err)
          reject(err)
        })
      });
    },
    // platform operations
    listPlatforms: async function (token: Token): Promise<Platform[]> {
      return new Promise<Platform[]>((resolve, reject) => {
        const config: AxiosRequestConfig = {
          headers: { Authorization: `Bearer ${token}` }
        };
        axios.get<Platform[]>('/platforms', config).then(res => {
          resolve(res.data)
        }).catch(err => {
          console.log(err)
          reject(err)
        })
      });
    },
    // brand operations
    createBrand: async function (token: Token, profile: updateBrand): Promise<Brand> {
      return new Promise<Brand>(async (resolve, reject) => {
        const { name, owner = [] } = profile
        if (!name) {
          throw new Error("Please provie name in profile");
        }

        if (typeof (name) != 'string') {
          throw new Error("Invalid type of name");
        }

        if (owner.length) {
          await this.updateUser(token, owner, { role: 'superAdmin' })
        }

        const config: AxiosRequestConfig = { headers: { Authorization: `Bearer ${token}` } };
        axios.post<Brand>('/brands', profile, config).then(res => {
          const { id, name, advertisers } = res.data;
          resolve({ id, name, advertisers })
        }).catch(err => {
          console.log(err)
          reject(err)
        })
      });
    },
    listBrands: async function (token: Token, select: Pick<listParams, "ids"> = {}): Promise<Brand[]> {
      return new Promise<Brand[]>((resolve, reject) => {
        const { ids } = select

        let params = new URLSearchParams();
        if (ids) {
          ids.forEach(e => {
            if (e) params.append('id_in', e.toString())
          })
        }
        const config: AxiosRequestConfig = { params, headers: { Authorization: `Bearer ${token}` } };
        axios.get<Brand[]>(`/brands`, config).then(async res => {
          const data: Brand[] = []
          const params = new URLSearchParams()
          params.append('role.name', roleNames['superAdmin'])
          const superAdmins: StrapiUser[] = await users(token, params)
          res.data.forEach(async e => {
            let owners = superAdmins.filter(o => {
              const ad = o.advertisers[0] ? o.advertisers[0] : { brand: -1 }
              return ad.brand == e.id
            })
            const owner: BrandOwner[] = owners ?
              owners.map(o => {
                return {
                  username: o.username,
                  email: o.email,
                  id: o.id,
                  role: camelCase(o.role.name),
                  platform: o.platforms.map(e => e.name)
                }
              }) : []

            const brand = { id: e.id, name: e.name, advertisers: e.advertisers, owners: owner }
            data.push(brand)
          })
          resolve(data)
        }).catch(err => {
          console.log(err)
          reject(err)
        })
      });
    },
    updateBrand: async function (token: Token, id: ID, profile: updateBrand): Promise<Brand> {
      if (profile.owner.length) {
        this.updateUser(token, profile.owner, { role: 'superAdmin' })
      } else {
        this.deleteSuperAdmin(token, id)
      }
      return new Promise<Brand>((resolve, reject) => {
        const config: AxiosRequestConfig = { headers: { Authorization: `Bearer ${token}` } };
        axios.put<Brand>(`/brands/${id}`, profile, config).then(res => {
          const { id, name, advertisers } = res.data;
          resolve({ id, name, advertisers })
        }).catch(err => {
          console.log(err)
          reject(err)
        })
      });
    },
    deleteBrand: async function (token: Token, id: ID): Promise<boolean> {
      return new Promise<boolean>((resolve, reject) => {
        const config: AxiosRequestConfig = { headers: { Authorization: `Bearer ${token}` } };
        axios.delete(`/brands/${id}`, config).then(res => {
          resolve(true)
        }).catch(err => {
          console.log(err)
          reject(err)
        })
      });
    },
    // advertiser operations
    createAdvertiser: async function (token: Token, profile: updateAdvertiser): Promise<Advertiser> {
      return new Promise<Advertiser>(async (resolve, reject) => {
        const { name, brand } = profile;

        if (!name && brand) {
          throw new Error("Please provie name, and brand in profile");
        }

        if (typeof (name) != 'string') {
          throw new Error("Invalid type of name");
        }

        const roles = await this.listRoles(token);

        const config: AxiosRequestConfig = { headers: { Authorization: `Bearer ${token}` } };
        axios.post('/advertisers', profile, config).then(res => {
          let { data } = res
          data = {
            id: data.id,
            name: data.name,
            brand: data.brand,
            users: data.users.map((e: { id: any; email: any; username: any; role: any; }) => {
              let { id, email, username, role } = e
              return { id, email, username, role: roles.find((i: { id: any; }) => role == i.id).name }
            })
          }
          resolve(data)
        }).catch(err => {
          console.log(err)
          reject(err)
        })
      });
    },
    listAdvertisers: async function (token: Token, select: Pick<listParams, "ids" | "brands">): Promise<Advertiser[]> {
      return new Promise<Advertiser[]>(async (resolve, reject) => {
        const { ids, brands } = select

        let params = new URLSearchParams();
        if (ids) {
          ids.forEach(e => {
            if (e) params.append('id_in', e.toString())
          })
        }
        if (brands) {
          brands.forEach(e => {
            if (e) params.append('brand_in', e.toString())
          })
        }
        const roles = await this.listRoles(token);
        const config: AxiosRequestConfig = { params, headers: { Authorization: `Bearer ${token}` } };
        axios.get('advertisers', config).then(res => {
          const data: Advertiser[] = []
          res.data.forEach((e: { id: any; name: any; brand: any; users: any; }) => {
            data.push({
              id: e.id,
              name: e.name,
              brand: e.brand,
              users: e.users.map((user: { id: any; email: any; username: any; role: any; }) => {
                let { id, email, username, role } = user
                return { id, email, username, role: roles.find((i: { id: any; }) => role == i.id).name }
              })
            })
          })
          resolve(data)
        }).catch(err => {
          console.log(err)
          reject(err)
        })
      });
    },
    updateAdvertiser: async function (token: Token, id: ID, profile: Advertiser): Promise<Advertiser> {
      return new Promise<Advertiser>(async (resolve, reject) => {
        const roles = await this.listRoles(token);
        const config: AxiosRequestConfig = { headers: { Authorization: `Bearer ${token}` } };
        axios.put(`/advertisers/${id}`, profile, config).then(res => {
          let { data } = res
          data = {
            id: data.id,
            name: data.name,
            brand: data.brand,
            users: data.users.map((user: { id: any; email: any; username: any; role: any; }) => {
              let { id, email, username, role } = user
              return { id, email, username, role: roles.find((i: { id: any; }) => role == i.id).name }
            })
          }
          resolve(data)
        }).catch(err => {
          console.log(err)
          reject(err)
        })
      });
    },
    deleteAdvertiser: async function (token: Token, id: ID): Promise<boolean> {
      return new Promise<boolean>((resolve, reject) => {
        const config: AxiosRequestConfig = { headers: { Authorization: `Bearer ${token}` } };
        axios.delete(`/advertisers/${id}`, config).then(res => {
          resolve(true)
        }).catch(err => {
          console.log(err)
          reject(err)
        })
      });
    },
  }
}


export default function createClientTool(setting: ClientToolParams): ClientTool {
  const { mock = false, url } = setting;
  if (mock) return mockStrapiClientTool();
  return strapiClientTool(url);
}
