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

export interface updateUser {
    username: string,
    role: string,
    platform: string[],
    password?: string,
    brand?: number[],
    advertisers?: number[],
}
export interface User {
    id?: ID,
    username: string,
    email: string,
    role: string,
    platform: string[],
    password?: string,
    brand?: Brand[],
    advertisers?: Advertiser[],
}

export interface UserPermissionLogin {
    jwt: Token,
    user: User
}

export interface updateRole {
    id: ID,
    name: string,
    permissions: string[]
}
export interface Role {
    id: ID,
    name: string,
    permissions?: Object[],
    nb_users?: number
}

export interface Brand {
    id?: ID,
    name: string,
    advertisers?: Advertiser[]
    owners?: BrandOwner[]
    manager?: BrandOwner[]
}

export type BrandOwner = {
    id?: ID,
    username?: string,
    email?: string,
    role?: string,
    platform?: string[]
}
//Partial<Pick<User, "id" | "username" | "email" | "role" | "platform">> | []

export interface updateBrand {
    id?: ID,
    name: string,
    advertisers?: number[],
    owners?: number[]
    manager?: number[]
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

export interface result {
    data: any,
    error: any
}

export interface ClientTool {
    // user operations
    login(name: string, password: string): Promise<result>,
    getMe(token: Token): Promise<result>
    createUser(token: Token, profile: UserRegisterInfo): Promise<result>,
    listUsers(token: Token, params: listParams, options?: sortParams): Promise<result>,
    updateUser(token: Token, id: ID, profile: updateUser): Promise<result>,
    deleteUser(token: Token, id: ID): Promise<result>,
    deleteSuperAdmin?(token: Token, brand: ID, advertisers: ID[]): void
    deleteManager?(token: Token, brand: ID, advertisers: ID[]): void
    addBrandOwner?(token: Token, owner: ID[], advertisers: ID[]): void
    addBrandManager?(token: Token, owner: ID[], advertisers: ID[]): void
    // role operations
    listRoles(token: Token): Promise<Role[]>,
    createRole?(token: Token, params: updateRole): Promise<result>,
    updateRole?(token: Token, params: updateRole): Promise<result>,
    deleteRole?(token: Token, id: ID): Promise<result>
    listPlatforms?(token: Token): Promise<Platform[]>,
    // brand operations
    createBrand(token: Token, profile: updateBrand): Promise<result>,
    listBrands(token: Token, params: Pick<listParams, "ids">, options?: sortParams): Promise<result>,
    updateBrand(token: Token, id: ID, profile: updateBrand): Promise<result>,
    deleteBrand(token: Token, id: ID): Promise<result>,
    // advertiser operations
    createAdvertiser(token: Token, profile: updateAdvertiser): Promise<result>,
    listAdvertisers(token: Token, params: Pick<listParams, "ids" | "brands">, options?: sortParams): Promise<result>,
    updateAdvertiser(token: Token, id: ID, profile: updateAdvertiser): Promise<result>,
    deleteAdvertiser(token: Token, id: ID): Promise<result>,
}

export interface ClientToolParams {
    url?: string,
    mock?: boolean
}

export interface listParams {
    ids?: ID[],
    brands?: ID[],
    advertisers?: ID[],
    roles?: string[]
}

type sortKey = 'created_at' | 'updated_at' | 'id' | 'name' | 'username'
type Sort = Map<sortKey, 1 | -1>

export interface sortParams {
    sort?: Sort,
    limit?: number
}