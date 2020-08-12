# mi-auth-client
Use to MI product authorization and authentication


```
npm install

#compile typescript dir:dist/main.js
npm run build

#Document  dir:docs
npm run doc
```

### Example
Performing initialization strapi client tool
```+=javascript
const createClientTool = require('./dist/main').default
const strapi = createClientTool({ mock: true });
```
Performing a login request
```+=javascript
let { jwt } = await strapi.login('email@ghtinc.com', 'password')
```
Performing CRUD user request
```+=javascript
strapi.getMe(jwt).then(user => console.log(user));

strapi.deleteUser(jwt, id = 43).then(user => console.log(user));

strapi.createUser(jwt, {
        username: 'test',
        email: 'test@ghtinc.com',
        password: 'test',
        role: 1,
        access: 'Both',
        advertisers: [7],
    }).then(user => console.log(user));

strapi.updateUser(jwt, id = 44, { access: 'Both' }).then(user => console.log(user))

strapi.listUsers(jwt).then(user => console.log(user));
```

Performing CRUD advertiser request
```+=javascript
strapi.createAdvertiser(jwt, { name: 'test', brand: 4 }).then(advertiser => console.log(advertiser))

strapi.updateAdvertiser(jwt, id = 8, { name: 'update' }).then(advertiser => console.log(advertiser))

strapi.deleteAdvertiser(jwt, id = 7).then(advertiser => console.log(advertiser));

strapi.listAdvertisers(jwt).then(advertisers => console.log(advertisers));
```

Performing CRUD brand request
```+=javascript
strapi.createBrand(jwt, { name: 'test' }).then(brand => console.log(brand))

strapi.updateBrand(jwt, id = 5, { name: 'update' }).then(brand => console.log(brand))

strapi.deleteBrand(jwt, id = 4).then(brand => console.log(brand));

strapi.listBrands(jwt).then(brands => console.log(brands));
```