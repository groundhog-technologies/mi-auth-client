import * as _ from 'lodash';
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
