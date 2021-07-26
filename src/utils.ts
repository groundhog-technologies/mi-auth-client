import * as _ from 'lodash';
import axios, { AxiosRequestConfig } from 'axios';
import { Token, listParams } from './clientTool.interface';
import { StrapiUser } from './strapi.interface';
import * as R from 'ramda';

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

export const users = async (token: Token, params: URLSearchParams) => {
    return new Promise<StrapiUser[]>((resolve, reject) => {
        const config: AxiosRequestConfig = { params, headers: { Authorization: `Bearer ${token}` } };
        axios.get<StrapiUser[]>('/users', config).then(res => {
            resolve(res.data);
        }).catch(e => {
            reject(e);
        })
    })
}

export const brands = (token: Token, params: URLSearchParams) => {
    const config = { params, headers: { Authorization: `Bearer ${token}` } };
    axios('/brands', config).then(res => {
        return res.data
    }).catch(e => console.log(e))

}

export const parseErrorMessage = (errorMessage: any) => {
    let message = _.get(errorMessage, ['response', 'data', 'message'])
    if (typeof (message) == 'string') return message

    message = _.get(message, ['message', 0, 'messages', 0])
    return message

}