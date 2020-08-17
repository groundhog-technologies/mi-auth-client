export type ID = number
export type Token = string

export interface UserRegisterInfo {
    username: string,
    email: string,
    password: string,
    role: string,
    platform: string[],
    advertisers?: ID[],
}

export interface User {
    id?: ID,
    username: string,
    email: string,
    role: string,
    platform: string[],
    password?: string,
    brand: Brand[],
    advertisers?: Advertiser[],
}

export interface UserPermissionLogin {
    jwt: Token,
    user: User
}

export interface Role {
    id: ID,
    name: string,
    nb_users?: number
}

export interface Brand {
    id?: ID,
    name: string,
    advertisers?: Advertiser[]
}

export interface updateBrand {
    id?: ID,
    name: string,
    advertisers?: number[]
}

export interface Advertiser {
    id?: ID,
    name: string,
    brand: ID
    users?: User[]
}

export interface Platform {
    id?: ID,
    name: string
}

export interface updateAdvertiser {
    id?: ID,
    name: string,
    brand: ID,
    users?: number[]
}

export interface ClientTool {
    // user operations
    login(name: string, password: string): Promise<UserPermissionLogin>,
    getMe(token: Token): Promise<User>
    createUser(token: Token, profile: UserRegisterInfo): Promise<User>,
    listUsers(token: Token, params: listParams): Promise<User[]>,
    updateUser(token: Token, id: ID, profile: User): Promise<User>,
    deleteUser(token: Token, id: ID): Promise<boolean>,
    // role operations
    listRoles(token: Token): Promise<Role[]>,
    listPlatforms?(token: Token): Promise<Platform[]>,
    // brand operations
    createBrand(token: Token, profile: updateBrand): Promise<Brand>,
    listBrands(token: Token, params: Pick<listParams, "ids">): Promise<Brand[]>,
    updateBrand(token: Token, id: ID, profile: Brand): Promise<Brand>,
    deleteBrand(token: Token, id: ID): Promise<boolean>,
    // advertiser operations
    createAdvertiser(token: Token, profile: updateAdvertiser): Promise<Advertiser>,
    listAdvertisers(token: Token, params: Pick<listParams, "ids" | "brands">): Promise<Advertiser[]>,
    updateAdvertiser(token: Token, id: ID, profile: Advertiser): Promise<Advertiser>,
    deleteAdvertiser(token: Token, id: ID): Promise<boolean>,

}

export interface ClientToolParams {
    url?: string,
    mock?: boolean
}

export interface listParams {
    ids?: ID[],
    brands?: ID[],
    advertisers?: ID[],
}