import { ClientTool, UserPermissionLogin, UserRegisterInfo, User, ID, Role, Brand, Advertiser, Token, updateBrand, updateAdvertiser, listParams, result, updateUser } from '../clientTool.interface'
import { roleNames, isValidKey, isEmail, lastElement, assignObject } from '../utils'
let { mockJwt, mockUsers, mockBrands, mockAdvertisers, mockRoles }
    : { mockJwt: Token, mockUsers: User[], mockBrands: Brand[], mockAdvertisers: Advertiser[], mockRoles: Role[] } = require('./mockObjects')
import * as R from 'ramda';

let mockMe: User

console.log('use mock strapi')

export default function mockStrapiClientTool(): ClientTool {
    return {
        // user operations
        createUser: async function (token: Token, profile: UserRegisterInfo): Promise<result> {
            return new Promise<result>((resolve) => {
                if (token != 'strapi_mock_token') {
                    resolve({ data: null, error: "Invalid token" })
                }

                if (!profile) {
                    resolve({ data: null, error: "Please provide your user profile." })
                }
                let { username, email, password, role, platform, advertisers } = profile

                if (!username && !email && !password && !role && !platform && !advertisers) {
                    resolve({ data: null, error: "Please provide username, email, password, role, access, advertiser in profile." })
                }

                if (typeof (username) != 'string') {
                    resolve({ data: null, error: "Type of username must be string." })
                }

                if (!isEmail(email)) {
                    resolve({ data: null, error: "Invalid email format." })
                }

                if (typeof (password) != 'string') {
                    resolve({ data: null, error: "Type of password must be string." })
                }

                if (typeof (role) != 'string') {
                    resolve({ data: null, error: "Type of role must be string." })
                }

                if (!isValidKey(role, roleNames)) {
                    resolve({ data: null, error: "Please select role in one of root, superAdmin, admin, user" })
                }

                if (!Array.isArray(platform)) {
                    resolve({ data: null, error: "Type of platform must be array." })
                }

                const id = lastElement(mockUsers).id + 1;
                const advertiserInfo = mockAdvertisers.filter((e) => advertisers.includes(e.id));
                const brand: Brand[] = [];
                const newUser = { id, username, email, password, role, platform, brand, advertisers: advertiserInfo }
                //update owner to brand
                advertiserInfo.forEach(e => {
                    const index = mockBrands.findIndex(c => c.id == e.brand)
                    if (role == 'superAdmin')
                        mockBrands[index].owners = mockBrands[index].owners.concat(newUser)
                    newUser.brand.push(R.pick(['id', 'name'], mockBrands[index]))
                })
                //update user to advertiser
                mockAdvertisers = mockAdvertisers.map(e => {
                    if (advertisers.includes(e.id)) {
                        e.users.push(R.pick(['id', 'username', 'email', 'role', 'platform', 'brand'], newUser))
                    }
                    return e
                })

                mockUsers.push(newUser);

                resolve({ data: lastElement(mockUsers), error: null })
            });
        },
        login: async function (name: string, password: string): Promise<result> {
            return new Promise<result>((resolve) => {
                if (!name) {
                    resolve({ data: null, error: "Please provide your name, which is email." })
                }

                if (!password) {
                    resolve({ data: null, error: "Please provide your password." })
                }

                if (!isEmail(name)) {
                    resolve({ data: null, error: "nvalid email format." })
                }

                if (typeof (password) != 'string') {
                    resolve({ data: null, error: "Type of password must be string." })
                }

                const index = mockUsers.findIndex(e => e.email == name)
                mockMe = mockUsers[index]
                resolve({ data: { jwt: mockJwt, user: mockMe }, error: null })
            });
        },
        getMe: async function (token: Token): Promise<result> {
            return new Promise<result>((resolve) => {
                if (token != 'strapi_mock_token') {
                    resolve({ data: null, error: "Invalid token" })
                }
                resolve({ data: mockMe, error: null })
            });
        },
        listUsers: async function (token: Token, select: listParams): Promise<result> {
            return new Promise<result>((resolve) => {
                if (!token) {
                    resolve({ data: null, error: "Invalid token" })
                }
                if (token != 'strapi_mock_token') {
                    resolve({ data: null, error: "Invalid token" })
                }

                const { ids = [], brands, advertisers, } = select;

                if (ids.length != 0) {
                    const users = mockUsers.filter(e => ids.includes(e.id))
                    resolve({ data: users, error: null })
                }

                if (brands) {
                    const users = mockUsers.filter(e => e.advertisers.find(a => brands.includes(a.brand)))
                    resolve({ data: users, error: null })
                }
                if (advertisers) {
                    const users = mockUsers.filter(e => e.advertisers.find(a => advertisers.includes(a.id)))
                    resolve({ data: users, error: null })
                }
                //list all users
                resolve({ data: mockUsers, error: null })
            });
        },
        updateUser: async function (token: Token, id: ID, profile: updateUser): Promise<result> {
            return new Promise<result>((resolve) => {
                if (token != 'strapi_mock_token') {
                    resolve({ data: null, error: "Invalid token" })
                }

                const { username, password, role, platform } = profile;

                if (password && typeof (password) != 'string') {
                    resolve({ data: null, error: "Type of password must be string." });
                }

                if (role && typeof (role) != 'string') {
                    resolve({ data: null, error: "Type of role must be string." });
                }

                if (role && !isValidKey(role, roleNames)) {
                    resolve({ data: null, error: "Please select role in one of root, superAdmin, admin, user" })
                }

                if (platform && !Array.isArray(platform)) {
                    resolve({ data: null, error: "Type of platform must be array." });
                }

                const user = mockUsers.find(e => e.id == id);
                const index = mockUsers.indexOf(user);
                const advertisers = profile.advertisers ? R.filter(e => profile.advertisers.includes(e.id), mockAdvertisers).map(R.pick(['id', 'name', 'brand'],)) : undefined
                const brand = advertisers ? R.filter(e => advertisers.map(e => e.brand).includes(e.id), mockBrands).map(R.pick(['id', 'name'])) : undefined
                mockUsers[index] = assignObject(mockUsers[index], { username: username || user.username, role: role || user.role, brand: brand || user.brand, advertisers: advertisers || user.advertisers })
                // update user to advertiser
                if (profile.advertisers) {
                    mockAdvertisers = mockAdvertisers.map(e => {
                        const existUserIndex = e.users.findIndex(e => e.id == id)
                        const isExist = existUserIndex != -1
                        if (profile.advertisers.includes(e.id) && isExist) return e
                        if (!profile.advertisers.includes(e.id) && !isExist) return e
                        // add user to advertiser
                        if (profile.advertisers.includes(e.id) && !isExist) {
                            e.users.push(R.pick(['username', 'id', 'email', 'role', 'platform', 'brand'], mockUsers[index]))
                            return e
                        }
                        // remove user from advertiser
                        if (!profile.advertisers.includes(e.id) && isExist) {
                            e.users.splice(existUserIndex, 1)
                            return e
                        }

                    })
                }

                //update owner to brand
                if (profile.role == 'superAdmin') {
                    //add to brand
                    mockBrands = mockBrands.map(e => {
                        const existOwnerIndex = e.owners.findIndex(e => e.id == id)
                        const isExist = existOwnerIndex !== -1
                        if (!isExist) e.owners.push(R.pick(["id", "username", "email", "role", "platform"], mockUsers[index]))
                        return e
                    })
                } else if (profile.role !== 'superAdmin') {
                    //remove owner from brand
                    mockBrands = mockBrands.map(e => {
                        const existOwnerIndex = e.owners.findIndex(e => e.id == id)
                        const isExist = existOwnerIndex !== -1
                        if (isExist) e.owners.splice(existOwnerIndex, 1)
                        return e
                    })
                }


                resolve({ data: mockUsers[index], error: null })
            });
        },
        deleteUser: async function (token: Token, id: ID): Promise<result> {
            return new Promise<result>((resolve) => {
                if (token != 'strapi_mock_token') {
                    resolve({ data: null, error: "Invalid token" })
                }
                try {
                    // remove user
                    const index = mockUsers.findIndex(e => e.id == id);
                    const user = mockUsers[index]
                    mockUsers.splice(index, 1)

                    // remove user from advertiser
                    mockAdvertisers = mockAdvertisers.map(e => {
                        const existUserIndex = e.users.findIndex(e => e.id == id)
                        if (existUserIndex == -1) return e // user not exist in advertiser
                        e.users.splice(existUserIndex, 1)
                        return e
                    })

                    // remove user from brand owner
                    if (user.role == 'superAdmin') mockBrands = mockBrands.map(e => {
                        console.log(e.owners)
                        const existOwnerIndex = e.owners.findIndex(e => e.id == id)
                        const isExist = existOwnerIndex !== -1
                        if (isExist) e.owners.splice(existOwnerIndex, 1)
                        return e
                    })
                }
                catch (err) {
                    resolve({ data: null, error: err })
                }
                resolve({ data: true, error: null })
            });
        },
        // role operations
        listRoles: async function (token: Token): Promise<Role[]> {
            return new Promise<Role[]>((resolve) => {
                if (token != 'strapi_mock_token') {
                    throw new Error("Invalid token.");
                }
                resolve(mockRoles)
            });
        },
        // brand operations
        createBrand: async function (token: Token, profile: updateBrand): Promise<result> {
            return new Promise<result>((resolve) => {
                if (token != 'strapi_mock_token') {
                    resolve({ data: null, error: "Invalid token" })
                }

                const { name, advertisers = [] } = profile
                if (!name) {
                    resolve({ data: null, error: "Please provie name in profile" })
                }

                if (typeof (name) != 'string') {
                    resolve({ data: null, error: "Invalid type of name" })
                }

                const id = lastElement(mockBrands).id + 1;
                const advertisersInfo: Advertiser[] = mockAdvertisers.filter(e => profile.advertisers.includes(e.id)).map(R.pick(['id', 'name', 'brand']))
                mockBrands.push({ id, name, advertisers: advertisersInfo, owners: [] });

                resolve({ data: lastElement(mockBrands), error: null })
            });
        },
        listBrands: async function (token: Token, select: Pick<listParams, "ids">): Promise<result> {

            return new Promise<result>((resolve) => {
                if (token != 'strapi_mock_token') {
                    resolve({ data: null, error: "Invalid token" })
                }

                const { ids } = select
                if (ids) {
                    const brands = mockBrands.filter(e => ids.includes(e.id))
                    resolve({ data: brands, error: null })
                }
                resolve({ data: mockBrands, error: null })
            });
        },
        updateBrand: async function (token: Token, id: ID, profile: updateBrand): Promise<result> {
            return new Promise<result>((resolve) => {
                if (token != 'strapi_mock_token') {
                    resolve({ data: null, error: "Invalid token" })
                }
                const brand = mockBrands.find(e => e.id == id);
                const index = mockBrands.indexOf(brand);
                const owners = profile.owners ? mockUsers.filter(e => e.id == profile.owners[0]) : brand.owners
                mockBrands[index] = assignObject(mockBrands[index], { name: profile.name, owners })

                resolve({ data: mockBrands[index], error: null })
            });
        },
        deleteBrand: async function (token: Token, id: ID): Promise<result> {
            return new Promise<result>((resolve) => {
                if (token != 'strapi_mock_token') {
                    resolve({ data: null, error: "Invalid token" })
                }
                try {
                    const brand = mockBrands.find(e => e.id == id);
                    const index = mockBrands.indexOf(brand);
                    mockBrands.splice(index, 1)

                    // remove brand from advertiser
                    mockAdvertisers = mockAdvertisers.map(e => {
                        if (brand.advertisers.map(e => e.id).includes(e.id)) e.brand = null
                        return e
                    })
                }
                catch (err) {
                    resolve({ data: null, error: err })
                }
                resolve({ data: true, error: null })
            });
        },
        // advertiser operations
        createAdvertiser: async function (token: Token, profile: updateAdvertiser): Promise<result> {
            return new Promise<result>((resolve) => {
                if (token != 'strapi_mock_token') {
                    resolve({ data: null, error: "Invalid token" })
                }

                let { name, brand } = profile;

                if (!name) {
                    resolve({ data: null, error: "Please provie name, and brand in profile" })
                }

                if (typeof (name) != 'string') {
                    resolve({ data: null, error: "Invalid type of name" })
                }

                if (brand && typeof (brand) != 'number') {
                    resolve({ data: null, error: "Invalid type of brand" })
                }

                const id = lastElement(mockAdvertisers).id + 1;
                const users: User[] = mockUsers.filter(e => profile.users.includes(e.id) ||
                    e.brand.map(e => e.id).includes(brand) &&
                    (e.role == 'root' || e.role == 'superAdmin'))
                const advertiser = { id, name, brand, users: users }
                mockAdvertisers.push(advertiser);
                mockUsers = mockUsers.map(e => {
                    if (users.map(e => e.id).includes(e.id)) return e
                    e.advertisers.push(R.pick(['name', 'brand', 'id'], advertiser))
                    return e
                })

                // add advertiser to brand
                mockBrands = mockBrands.map(e => {
                    if (e.id == profile.brand) e.advertisers.push(R.pick(['id', 'name', 'brand'], advertiser))
                    return e
                })
                resolve({ data: lastElement(mockAdvertisers), error: null })
            });
        },
        listAdvertisers: async function (token: Token, select: Pick<listParams, "brands" | "ids">): Promise<result> {
            return new Promise<result>((resolve) => {
                if (token != 'strapi_mock_token') {
                    //throw new Error("Invalid token.");
                    resolve({ data: null, error: "Invalid token" })
                }

                const { ids = [], brands = [] } = select
                if (ids.length != 0) {
                    const advertiser = mockAdvertisers.filter(e => ids.includes(e.id))
                    resolve({ data: advertiser, error: null })
                }
                if (brands.length != 0) {
                    const advertiser = mockAdvertisers.filter(e => brands.includes(e.brand))
                    resolve({ data: advertiser, error: null })
                }
                resolve({ data: mockAdvertisers, error: null })
            });
        },
        updateAdvertiser: async function (token: Token, id: ID, profile: updateAdvertiser): Promise<result> {
            return new Promise<result>((resolve) => {
                if (token != 'strapi_mock_token') {
                    resolve({ data: null, error: "Invalid token" })
                }
                const index = mockAdvertisers.findIndex(e => e.id == id);
                const advertiser = mockAdvertisers[index]
                const newUser = mockUsers.filter(e => profile.users.includes(e.id))
                mockAdvertisers[index] = assignObject(mockAdvertisers[index], { name: profile.name || advertiser.name, brand: profile.brand || advertiser.brand, users: newUser || advertiser.users });

                if (profile.users) {
                    mockUsers = mockUsers.map(e => {
                        const existAdvIndex = e.advertisers.findIndex(e => e.id == id)
                        const isExist = existAdvIndex !== -1
                        if (profile.users.includes(e.id) && isExist) return e
                        if (!profile.users.includes(e.id) && !isExist) return e
                        // add advertiser to user
                        if (profile.users.includes(e.id) && !isExist) {
                            e.advertisers.push(R.pick(['name', 'brand', 'id'], mockAdvertisers[index]))
                            return e
                        }
                        // remove advertiser from user
                        if (!profile.users.includes(e.id) && isExist) {
                            e.advertisers.splice(existAdvIndex, 1)
                            return e
                        }
                    })
                }
                if (profile.brand) {
                    mockBrands = mockBrands.map(e => {
                        const existAdvIndex = e.advertisers.findIndex(e => e.id == id)
                        const isExist = existAdvIndex !== -1
                        if (profile.brand == e.id && isExist) return e
                        if (profile.brand != e.id && !isExist) return e

                        //add advertiser from brand
                        if (profile.brand == e.id && !isExist) {
                            e.advertisers.push(R.pick(['name', 'brand', 'id'], mockAdvertisers[index]))
                            return e
                        }
                        // remove advertiser from brand
                        if (profile.brand != e.id && isExist) {
                            e.advertisers.splice(existAdvIndex, 1)
                            return e
                        }
                    })
                }
                resolve({ data: mockAdvertisers[index], error: null });
            });
        },
        deleteAdvertiser: async function (token: Token, id: ID): Promise<result> {
            return new Promise<result>((resolve) => {
                if (token != 'strapi_mock_token') {
                    resolve({ data: null, error: "Invalid token" })
                }
                try {
                    // delete advertiser
                    const advertiser = mockAdvertisers.find(e => e.id == id);
                    const index = mockAdvertisers.indexOf(advertiser);
                    mockAdvertisers.splice(index, 1);

                    // remove advertiser from users
                    const userIds = advertiser.users.map(e => e.id)
                    mockUsers = mockUsers.map(e => {
                        if (!userIds.includes(e.id)) return e
                        const advIdx = e.advertisers.findIndex(e => e.id == advertiser.id)
                        e.advertisers.splice(advIdx, 1)
                        return e
                    })
                    // remove advertiser from brand
                    mockBrands = mockBrands.map(e => {
                        if (advertiser.brand != e.id) return e
                        const advIdx = e.advertisers.findIndex(e => e.id == advertiser.id)
                        e.advertisers.splice(advIdx, 1)
                        return e
                    })
                }
                catch (err) {
                    resolve({ data: null, error: err })
                }
                resolve({ data: true, error: null })
            });
        },
    }
}
