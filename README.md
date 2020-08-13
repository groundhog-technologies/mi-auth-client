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
const { jwt } = await miAuth.login('email@ghtinc.com', 'password')
```
Performing CRUD user request
```+=javascript
miAuth.getMe(jwt).then(user => console.log(user));

miAuth.deleteUser(jwt, id = 43).then(user => console.log(user));

miAuth.createUser(jwt, {
        username: 'test',
        email: 'test@ghtinc.com',
        password: 'test',
        role: 1,
        access: 'Both',
        advertisers: [7],
    }).then(user => console.log(user));

miAuth.updateUser(jwt, id = 44, { access: 'Both' }).then(user => console.log(user))

miAuth.listUsers(jwt).then(user => console.log(user));
```

Performing CRUD advertiser request
```+=javascript
miAuth.createAdvertiser(jwt, { name: 'test', brand: 4 }).then(advertiser => console.log(advertiser))

miAuth.updateAdvertiser(jwt, id = 8, { name: 'update' }).then(advertiser => console.log(advertiser))

miAuth.deleteAdvertiser(jwt, id = 7).then(advertiser => console.log(advertiser));

miAuth.listAdvertisers(jwt).then(advertisers => console.log(advertisers));
```

Performing CRUD brand request
```+=javascript
miAuth.createBrand(jwt, { name: 'test' }).then(brand => console.log(brand))

miAuth.updateBrand(jwt, id = 5, { name: 'update' }).then(brand => console.log(brand))

miAuth.deleteBrand(jwt, id = 4).then(brand => console.log(brand));

miAuth.listBrands(jwt).then(brands => console.log(brands));
```