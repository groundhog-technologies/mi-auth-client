# mi-auth-client
Use to MI product authorization and authentication  

Client Tool only supports [Strapi]("https://strapi.io/") by default for now
```
npm install

#compile typescript dir:dist/main.js
npm run build

#Document  dir:docs
npm run doc
```

### Example
Performing initialization client tool
- Typescript
```+=typescript
import createClientTool from 'mi-auth-client'
const miAuth = createClientTool({ mock: true });
```
- ES5
```+=javascript
const createClientTool = require('mi-auth-client').default
const miAuth = createClientTool({ mock: true });
```
Performing a login request
```+=javascript
let { data:{jwt}, error } = await miAuth.login('email@ghtinc.com', 'password')
```
Performing CRUD user request
```+=javascript
miAuth.getMe(jwt).then({data: user} => console.log(user));

miAuth.deleteUser(jwt, id = 43).then({data: user} => console.log(user));

miAuth.createUser(jwt, {
        username: 'test',
        email: 'test@ghtinc.com',
        password: 'test',
        role: "User",
        platform: ['DMP'],
        advertisers: [7],
    }).then({data: user} => console.log(user));

miAuth.updateUser(jwt, id = 44, { platform: ['DSP] }).then({data: user} => console.log(user))

miAuth.listUsers(jwt, {ids:[], brands:[], advertisers:[]}, {sort:{'name': -1}, limit: 10}).then({data: user} => console.log(user));
```

Performing CRUD advertiser request
```+=javascript
miAuth.createAdvertiser(jwt, { name: 'test', brand: 4, users:[1, 2] }).then({data: advertiser} => console.log(advertiser))

miAuth.updateAdvertiser(jwt, id = 8, { name: 'update' }).then({data: advertiser} => console.log(advertiser))

miAuth.deleteAdvertiser(jwt, id = 7).then({data: advertiser} => console.log(advertiser));

miAuth.listAdvertisers(jwt, {ids:[7], brands:[5]},{sort:{'updated_at':1, limit:10}}).then({data: advertisers} => console.log(advertisers));
```

Performing CRUD brand request
```+=javascript
miAuth.createBrand(jwt, { name: 'test', advertisers: [10] }).then({data:brand} => console.log(brand))

miAuth.updateBrand(jwt, id = 5, { name: 'update' }).then({data: brand} => console.log(brand))

miAuth.deleteBrand(jwt, id = 4).then({data: brand} => console.log(brand));

miAuth.listBrands(jwt,{ids:[5]}, {sort:{'created_at': -1}, limit:100}).then({data: brands} => console.log(brands));
```

Options config for listBrands, listAdvertiser, and listUser
```+=javascript
type sortKey = 'created_at' | 'updated_at' | 'id' | 'name' | 'username'
type Sort = Map<sortKey, 1 | -1>

export interface options {
    sort?: Sort,
    limit?: number
}
```

Filter config for listUsers
```+=js
{
    ids?: ID[],
    brands?: ID[],
    advertisers?: ID[],
    roles?: string[]
}
```

Filter config for listAdvertiser
```+=js
{
    ids?: ID[],
    brands?: ID[],
}
```
Filter config for listBrands
```+=js
{
    ids?: ID[],
}
```