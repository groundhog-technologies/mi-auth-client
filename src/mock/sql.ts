import { nSQL } from "@nano-sql/core";

const init = async function () {
    await nSQL().createDatabase({
        id: "mockData",
        mode: "TEMP",
        tables: [
            {
                name: "users",
                model: {
                    "id:uuid": { pk: true },
                    "username:string": {},
                    "email:string": {},
                    "role:string": {},
                    "platform:string[]": {},
                    "advertsiers:string": {},
                    "brand:obj[]": {
                        model: {
                            "id:uuid": {},
                            "name:string": {}
                        }
                    }
                }
            },
            {
                name: "brands",
                model: {
                    "id:uuid": { pk: true },
                    "name:string": {},
                    "advertisers:string": {},
                    "owners:obj[]": {
                        model: {
                            "id:string": {},
                            "username:string": {},
                            "email:string": {},
                            "role:string": {},
                            "platform:string[]": {}
                        }
                    }
                }
            },
            {
                name: "advertisers",
                model: {
                    "id:uuid": { pk: true },
                    "name:string": {},
                    "brand:string": {},
                    "users:string": {}
                }
            }
        ],
    })
}

async () => {
    await init()
}

export default {
    init,
    nSQL
}
