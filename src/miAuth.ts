import { ClientTool, UserPermissionLogin, UserRegisterInfo, User, ClientToolParams, Token, ID, Role, Brand, Advertiser, updateAdvertiser, updateBrand, listParams, Platform, BrandOwner, result, sortParams } from './clientTool.interface';
import mockStrapiClientTool from './mock/mockStrapiClientTool';
import axios, { AxiosRequestConfig } from 'axios';
import { assignObject, isEmail, roleNames, isValidKey, setUrl, users, sortSetting, parseErrorMessage } from './utils';
import * as _ from 'lodash'
import { identity, camelCase } from 'lodash';
import { StrapiUser } from './strapi.interface';


function strapiClientTool(url: string): ClientTool {

  axios.defaults.baseURL = setUrl(url);

  return {
    // user operations
    addBrandOwner: async function (token: Token, owners: number[], advertisers: number[]): Promise<void> {
      const { data: superAdmins }: { data: User[] } = await this.listUsers(token, { ids: owners })
      superAdmins.forEach(user => {
        this.updateUser(token, user.id, { advertisers: _.concat(user.advertisers.map(e => e.id), advertisers) })
      })
    },
    deleteSuperAdmin: async function (token: Token, brand: number): Promise<void> {
      const { data: superAdmins } = await this.listUsers(token, { brands: [brand], roles: ['superAdmin'] })
      const { data: advertisers } = await this.listAdvertisers(token, { brands: [brand] })
      await Promise.all[
        superAdmins.forEach((e: { id: any, advertisers: Advertiser[] }) => {
          const updatedAdvertisers = _.filter(e.advertisers, advertiser => (!advertisers.includes(advertiser.id)))
          this.updateUser(token, e.id, { advertisers: updatedAdvertisers.map(e => e.id) })
        })]
    },
    createUser: async function (token: Token, profile: UserRegisterInfo): Promise<result> {
      return new Promise<result>(async (resolve) => {
        if (!profile) {
          resolve({ data: null, error: "Please provide your user profile." });
        }
        const { username, email, password, role, platform, advertisers } = profile;

        if (!username && !email && !password && !role && !platform && !advertisers) {
          resolve({ data: null, error: "Please provide username, email, password, role, access, advertiser in profile." });
        }

        if (typeof (username) != 'string') {
          resolve({ data: null, error: "Type of username must be string." });
        }

        if (!isEmail(email)) {
          resolve({ data: null, error: "Invalid email format." });
        }

        if (typeof (password) != 'string') {
          resolve({ data: null, error: "Type of password must be string." });
        }

        if (!isValidKey(role, roleNames)) {
          resolve({ data: null, error: "Type of role must be string." });
        }

        if (!Array.isArray(platform)) {
          resolve({ data: null, error: "Type of platform must be array." });
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
          const data: User = { id, email, username, role: camelCase(role.name), platform: reducedPlatform, brand: brand.data, advertisers }
          resolve({ data, error: null })
        }).catch(err => {
          resolve({ data: null, error: parseErrorMessage(err) })
        })
      });
    },
    login: async function (name: string, password: string): Promise<result> {
      return new Promise<result>(async (resolve, reject) => {
        if (!name) {
          resolve({ data: null, error: "Please provide your name, which is email." });
        }

        if (!password) {
          resolve({ data: null, error: "Please provide your password." });
        }

        if (!isEmail(name)) {
          resolve({ data: null, error: "Invalid email format." });
        }

        if (typeof (password) != 'string') {
          resolve({ data: null, error: "Type of password must be string." })
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
            const data: User = { id, email, username, role: camelCase(role.name), platform: reducedPlatform, brand: brand.data, advertisers: reducedAdvertiser }
            resolve({ data: { jwt, user: data }, error: null })
          })
          .catch(err => {
            resolve({ data: null, error: parseErrorMessage(err) })
          })
      });
    },
    getMe: async function (token: Token): Promise<result> {
      return new Promise<result>((resolve, reject) => {

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
            const data: User = { id, email, username, role: camelCase(role.name), platform: reducedPlatform, brand: brand.data, advertisers }
            resolve({ data, error: null })
          })
          .catch(err => {
            resolve({ data: null, error: parseErrorMessage(err) })
          })
      });
    },
    listUsers: async function (token: Token, select: listParams = {}, options: sortParams): Promise<result> {
      return new Promise<result>(async (resolve, reject) => {
        if (!token) {
          resolve({ data: null, error: "Please provide your token." });
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

        if (options) {
          const { limit = -1, sort = {} } = options
          let sortFilter: string[] = []
          params.append('_limit', limit.toString())
          _.keys(sort).forEach(e => {
            sortFilter.push(`${e}:${sortSetting[sort[e]]}`)
          })
          if (sortFilter.length) params.append('_sort', sortFilter.join(','))
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

            const brand = allBrands.data.filter((e: { id: number; }) => Array.from(brandIds).includes(e.id))
            data.push({ id, email, username, role: camelCase(role.name), platform: reducedPlatform, brand, advertisers })

          });
          resolve({ data, error: null })
        }).catch(err => {
          resolve({ data: null, error: parseErrorMessage(err) })
        })
      });
    },
    updateUser: async function (token: Token, id: ID, profile: User): Promise<result> {
      return new Promise<result>(async (resolve, reject) => {
        const { username, email, password, role, platform } = profile;

        if (email) {
          resolve({ data: null, error: "email cannot be updated." });
        }

        if (password && typeof (password) != 'string') {
          resolve({ data: null, error: "Type of password must be string." });
        }

        if (role && typeof (role) != 'string') {
          resolve({ data: null, error: "Type of role must be string." });
        }

        if (platform && !Array.isArray(platform)) {
          resolve({ data: null, error: "Type of platform must be array." });
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
          const data: User = { id, email, username, role: camelCase(role.name), platform: reducedPlatform, brand: brand.data, advertisers }
          resolve({ data, error: null })
        }).catch(err => {
          resolve({ data: null, error: parseErrorMessage(err) })
        })
      });
    },
    deleteUser: async function (token: Token, id: ID): Promise<result> {
      return new Promise<result>((resolve, reject) => {
        const config: AxiosRequestConfig = { headers: { Authorization: `Bearer ${token}` } };
        axios.delete(`/users/${id}`, config).then(res => {
          resolve({ data: true, error: null })
        }).catch(err => {
          resolve({ data: null, error: parseErrorMessage(err) })
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
    createBrand: async function (token: Token, profile: updateBrand): Promise<result> {
      return new Promise<result>(async (resolve, reject) => {
        const { name, owners = [] } = profile
        if (!name) {
          resolve({ data: null, error: "Please provie name in profile" });
        }

        if (typeof (name) != 'string') {
          resolve({ data: null, error: "Invalid type of name" });
        }
        // create brand
        const config: AxiosRequestConfig = { headers: { Authorization: `Bearer ${token}` } };
        axios.post<Brand>('/brands', profile, config).then(async res => {
          const { id, name, advertisers } = res.data;
          resolve({ data: { id, name, advertisers }, error: null })
        }).catch(err => {
          resolve({ data: null, error: parseErrorMessage(err) })
        })
      });
    },
    listBrands: async function (token: Token, select: Pick<listParams, "ids"> = {}, options: sortParams): Promise<result> {
      return new Promise<result>((resolve, reject) => {
        const { ids } = select

        let params = new URLSearchParams();
        if (ids) {
          ids.forEach(e => {
            if (e) params.append('id_in', e.toString())
          })
        }

        if (options) {
          const { limit, sort = {} } = options
          let sortFilter: string[] = []
          if (limit) params.append('_limit', limit.toString())
          _.keys(sort).forEach(e => {
            sortFilter.push(`${e}:${sortSetting[sort[e]]}`)
          })
          if (sortFilter.length) params.append('_sort', sortFilter.join(','))
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
          resolve({ data, error: null })
        }).catch(err => {
          resolve({ data: null, error: parseErrorMessage(err) })
        })
      });
    },
    updateBrand: async function (token: Token, id: ID, profile: updateBrand): Promise<result> {
      const { name, owners, advertisers } = profile
      // remove owner
      if (owners) await this.deleteSuperAdmin(token, id)
      // update brand
      return new Promise<result>((resolve, reject) => {
        const config: AxiosRequestConfig = { headers: { Authorization: `Bearer ${token}` } };
        axios.put<Brand>(`/brands/${id}`, { name, advertisers }, config).then(async res => {
          const { id, name, advertisers } = res.data;

          //add owner
          if (owners) await this.addBrandOwner(token, owners, advertisers.map(e => e.id))

          resolve({ data: { id, name, advertisers }, error: null })
        }).catch(err => {
          resolve({ data: null, error: parseErrorMessage(err) })
        })
      });
    },
    deleteBrand: async function (token: Token, id: ID): Promise<result> {
      return new Promise<result>((resolve, reject) => {
        const config: AxiosRequestConfig = { headers: { Authorization: `Bearer ${token}` } };
        axios.delete(`/brands/${id}`, config).then(res => {
          resolve({ data: true, error: null })
        }).catch(err => {
          resolve({ data: null, error: parseErrorMessage(err) })
        })
      });
    },
    // advertiser operations
    createAdvertiser: async function (token: Token, profile: updateAdvertiser): Promise<result> {
      return new Promise<result>(async (resolve, reject) => {
        const { name, brand } = profile;

        if (!name && brand) {
          resolve({ data: null, error: "Please provie name, and brand in profile" });
        }

        if (typeof (name) != 'string') {
          resolve({ data: null, error: "Invalid type of name" });
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
              return { id, email, username, role: camelCase(roles.find((i: { id: any; }) => role == i.id).name) }
            })
          }
          resolve({ data, error: null })
        }).catch(err => {
          resolve({ data: null, error: parseErrorMessage(err) })
        })
      });
    },
    listAdvertisers: async function (token: Token, select: Pick<listParams, "ids" | "brands">, options: sortParams): Promise<result> {
      return new Promise<result>(async (resolve, reject) => {
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

        if (options) {
          const { limit, sort = {} } = options
          let sortFilter: string[] = []
          if (limit) params.append('_limit', limit.toString())
          _.keys(sort).forEach(e => {
            sortFilter.push(`${e}:${sortSetting[sort[e]]}`)
          })
          if (sortFilter.length) params.append('_sort', sortFilter.join(','))
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
                return { id, email, username, role: camelCase(roles.find((i: { id: any; }) => role == i.id).name) }
              })
            })
          })
          resolve({ data, error: null })
        }).catch(err => {
          resolve({ data: null, error: parseErrorMessage(err) })
        })
      });
    },
    updateAdvertiser: async function (token: Token, id: ID, profile: Advertiser): Promise<result> {
      return new Promise<result>(async (resolve, reject) => {
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
              return { id, email, username, role: camelCase(roles.find((i: { id: any; }) => role == i.id).name) }
            })
          }
          resolve({ data, error: null })
        }).catch(err => {
          resolve({ data: null, error: parseErrorMessage(err) })
        })
      });
    },
    deleteAdvertiser: async function (token: Token, id: ID): Promise<result> {
      return new Promise<result>((resolve, reject) => {
        const config: AxiosRequestConfig = { headers: { Authorization: `Bearer ${token}` } };
        axios.delete(`/advertisers/${id}`, config).then(res => {
          resolve({ data: true, error: null })
        }).catch(err => {
          resolve({ data: null, error: parseErrorMessage(err) })
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
