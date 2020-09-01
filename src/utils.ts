import * as _ from 'lodash';
import axios, { AxiosRequestConfig } from 'axios';
import { Token, listParams } from './clientTool.interface';
import { User } from './clientTool.interface';
import { resolve } from 'path';
import { StrapiUser } from './strapi.interface';
import { reject } from 'lodash';

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
    'user': 'user'
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
