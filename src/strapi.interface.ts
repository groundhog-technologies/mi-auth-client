export type ID = number
export type Token = string

export interface StrapiUser {
    username: string,
    id: ID,
    password: string,
    email: string,
    role: StrapiRole,
    advertisers: StrapiUserAdvertiser[],
    platforms: StrapiPlatform[]
}

enum Role {
    root = 1,
    super_admin = 2,
    admin = 3,
    user = 4
}

export interface StrapiRole {
    id: ID
    name: string
}

export interface StrapiBrand {
    id: ID
    name: string
    advertisers: ID[]
}
export interface StrapiUserAdvertiser {
    id: ID
    name: string
    users: StrapiUser[]
    brand: ID
}
export interface StrapiAdvertiser {
    id: ID
    name: string
    users: StrapiUser[]
    brand: StrapiBrand
}

export interface StrapiPlatform {
    id: ID
    name: string
}