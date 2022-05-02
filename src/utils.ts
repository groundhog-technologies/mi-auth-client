import * as _ from 'lodash';
import axios, { AxiosRequestConfig } from 'axios';
import { Token, listParams, Role } from './clientTool.interface';
import { StrapiRole, StrapiUser } from './strapi.interface';
const pjson = require('../package.json');

const version = pjson.version;


export const isEmail = function (email: string) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email.toLowerCase());
}

export const assignObject = <T extends object>(target: T, arg: Partial<T>) => Object.assign(target, arg);

export const lastElement = <T extends object>(array: T[]) => array[array.length - 1];

export const roleNames = {
    'root': 'root',
    'superAdmin': 'super_admin',
    'admin': 'admin',
    'user': 'user',
    'manager': 'agency'
}

export const roleNames2GUI = (role: string) => {
    const mappingTable = {
        'root': 'root',
        'super_admin': 'superAdmin',
        'admin': 'admin',
        'user': 'user',
        'agency': 'manager'
    }
    return mappingTable[role] || role
}

export const sortSetting = {
    '1': 'ASC',
    '-1': 'DESC'
}

export const isValidKey = <T extends object>(key: string, object: T) => {
    if (Object.keys(object).includes(key)) {
        return true
    }
}

export const camelCase = (s: string) => {
    return _.camelCase(s)
}

export let serviceUrl = '';
export const setUrl = (url: string) => {
    serviceUrl = url;
    return serviceUrl
}

export const roles = async (token: Token) => {
    return new Promise<StrapiRole[]>((resolve, reject) => {
        const config: AxiosRequestConfig = { headers: { Authorization: `Bearer ${token}`, cliVersion: version } };
        axios.get<{ roles: Role[] }>('/users-permissions/roles', config).then(res => {
            resolve(res.data.roles.map((e: StrapiRole) => {
                return { ...e, name: roleNames2GUI(e.name) }
            }))
        }).catch(err => {
            console.log(parseErrorMessage(err))
            reject(err)
        })
    })
}

export const users = async (token: Token, params: URLSearchParams) => {
    return new Promise<StrapiUser[]>((resolve, reject) => {
        const config: AxiosRequestConfig = { params, headers: { Authorization: `Bearer ${token}`, cliVersion: version } };
        axios.get<StrapiUser[]>('/users', config).then(res => {
            resolve(res.data);
        }).catch(e => {
            reject(e);
        })
    })
}

export const brands = (token: Token, params: URLSearchParams) => {
    const config = { params, headers: { Authorization: `Bearer ${token}`, cliVersion: version } };
    axios('/brands', config).then(res => {
        return res.data
    }).catch(e => console.log(e))

}

export const parseErrorMessage = (errorMessage: any) => {
    let message = _.get(errorMessage, ['response', 'data', 'message'])
    if (typeof (message) == 'string') return message

    message = _.get(message, [0, 'messages', 0, 'message'])
    return message

}