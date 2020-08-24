import { ClientTool, UserPermissionLogin, UserRegisterInfo, User, ID, Role, Brand, Advertiser, Token, updateBrand, updateAdvertiser, listParams } from '../clientTool.interface'
import { mockMe, mockJwt, mockUsers, mockBrands, mockAdvertisers, mockRoles } from './mockObjects'
import { roleNames, isValidKey, isEmail, lastElement, assignObject } from '../utils'

export default function mockStrapiClientTool(): ClientTool {
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
                let { username, email, password, role, platform, advertisers } = profile

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

                if (typeof (role) != 'string') {
                    throw new Error("Type of role must be string.");
                }

                if (!isValidKey(role, roleNames)) {
                    throw new Error("Please select role in one of root, superAdmin, admin, user")
                }

                if (!Array.isArray(platform)) {
                    throw new Error("Type of platform must be array.");
                }

                const id = lastElement(mockUsers).id + 1;
                const advertiserInfo = mockAdvertisers.filter(e => advertisers.includes(e.id));
                const brand: Brand[] = [];
                advertiserInfo.forEach(e => {
                    const b = mockBrands.find(c => c.id == e.brand)
                    brand.push(b)
                })
                const newUser = { id, username, email, password, role, platform, brand, advertisers: advertiserInfo }
                mockUsers.push(newUser);

                resolve(lastElement(mockUsers))
            });
        },
        login: async function (name: string, password: string): Promise<UserPermissionLogin> {
            return new Promise<UserPermissionLogin>((resolve) => {
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

                resolve({ jwt: mockJwt, user: mockMe })
            });
        },
        getMe: async function (token: Token): Promise<User> {
            return new Promise<User>((resolve) => {
                if (token != 'strapi_mock_token') {
                    throw new Error("Invalid token.");
                }
                resolve(mockMe)
            });
        },
        listUsers: async function (token: Token, select: listParams): Promise<User[]> {
            return new Promise<User[]>((resolve) => {
                if (!token) {
                    throw new Error("Please provide your token.");
                }
                if (token != 'strapi_mock_token') {
                    throw new Error("Invalid token.");
                }

                const { ids, brands, advertisers } = select;

                if (ids) {
                    const users = mockUsers.filter(e => ids.includes(e.id))
                    resolve(users)
                }

                if (brands) {
                    const users = mockUsers.filter(e => e.advertisers.find(a => brands.includes(a.brand)))
                    resolve(users)
                }
                if (advertisers) {
                    const users = mockUsers.filter(e => e.advertisers.find(a => advertisers.includes(a.id)))
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

                if (role && !isValidKey(role, roleNames)) {
                    throw new Error("Please select role in one of root, superAdmin, admin, user")
                }

                if (platform && !Array.isArray(platform)) {
                    throw new Error("Type of platform must be array.");
                }

                const user = mockUsers.find(e => e.id == id);
                const index = mockUsers.indexOf(user);

                mockUsers[index] = assignObject(mockUsers[index], profile)

                resolve(mockUsers[index])
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
        listRoles: async function (token: Token): Promise<Role[]> {
            return new Promise<Role[]>((resolve) => {
                if (token != 'strapi_mock_token') {
                    throw new Error("Invalid token.");
                }
                resolve(mockRoles)
            });
        },
        // brand operations
        createBrand: async function (token: Token, profile: updateBrand): Promise<Brand> {
            return new Promise<Brand>((resolve) => {
                if (token != 'strapi_mock_token') {
                    throw new Error("Invalid token.");
                }

                const { name, advertisers = [] } = profile
                if (!name) {
                    throw new Error("Please provie name in profile");
                }

                if (typeof (name) != 'string') {
                    throw new Error("Invalid type of name");
                }

                const id = lastElement(mockBrands).id + 1;
                const advertisersInfo: Advertiser[] = mockAdvertisers.filter(e => profile.advertisers.includes(e.id))
                mockBrands.push({ id, name, advertisers: advertisersInfo });

                resolve(lastElement(mockBrands))
            });
        },
        listBrands: async function (token: Token, select: Pick<listParams, "ids">): Promise<Brand[]> {
            return new Promise<Brand[]>((resolve) => {
                if (token != 'strapi_mock_token') {
                    throw new Error("Invalid token.");
                }

                const { ids } = select
                if (ids) {
                    const brand = mockBrands.filter(e => ids.includes(e.id))
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
                const brand = mockBrands.find(e => e.id == id);
                const index = mockBrands.indexOf(brand);
                mockBrands[index] = assignObject(mockBrands[index], profile)

                resolve(mockBrands[index])
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
        createAdvertiser: async function (token: Token, profile: updateAdvertiser): Promise<Advertiser> {
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

                const id = lastElement(mockAdvertisers).id + 1;
                const users: User[] = mockUsers.filter(e => profile.users.includes(e.id))
                mockAdvertisers.push({ id, name, brand, users });
                resolve(lastElement(mockAdvertisers))
            });
        },
        listAdvertisers: async function (token: Token, select: Pick<listParams, "brands" | "ids">): Promise<Advertiser[]> {
            return new Promise<Advertiser[]>((resolve) => {
                if (token != 'strapi_mock_token') {
                    throw new Error("Invalid token.");
                }

                const { ids, brands } = select

                if (ids) {
                    const advertiser = mockAdvertisers.filter(e => ids.includes(e.id))
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
                const advertiser = mockAdvertisers.find(e => e.id == id);
                const index = mockAdvertisers.indexOf(advertiser);
                mockAdvertisers[index] = assignObject(mockAdvertisers[index], profile);

                resolve(mockAdvertisers[index]);
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
