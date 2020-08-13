export type ID = number
export type Token = string

export interface UserRegisterInfo {
    username: string,
    email: string,
    password: string,
    role: string,
    access: string,
    advertisers?: [ID],
}

export interface User {
    id?: ID,
    username: string,
    email: string,
    role: string,
    access: string,
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

export interface Advertiser {
    id?: ID,
    name: string,
    brand: ID
    users?: User[]
}

export interface ClientTool {
    // user operations
    login(name: string, password: string): Promise<UserPermissionLogin>,
    getMe(token: Token): Promise<User>
    createUser(token: Token, profile: UserRegisterInfo): Promise<User>,
    listUsers(token: Token, id?: ID, brand?: ID, advertiser?: ID): Promise<User[]>,
    updateUser(token: Token, id: ID, profile: User): Promise<User>,
    deleteUser(token: Token, id: ID): Promise<boolean>,
    // brand operations
    createBrand(token: Token, profile: Brand): Promise<Brand>,
    listBrands(token: Token, id?: ID[]): Promise<Brand[]>,
    updateBrand(token: Token, id: ID, profile: Brand): Promise<Brand>,
    deleteBrand(token: Token, id: ID): Promise<boolean>,
    // advertiser operations
    createAdvertiser(token: Token, profile: Advertiser): Promise<Advertiser>,
    listAdvertisers(token: Token, id?: ID[]): Promise<Advertiser[]>,
    updateAdvertiser(token: Token, id: ID, profile: Advertiser): Promise<Advertiser>,
    deleteAdvertiser(token: Token, id: ID): Promise<boolean>,

}

export interface ClientToolParams {
    url?: string,
    mock?: boolean
}