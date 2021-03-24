import { Advertiser, Brand, Role, User, Platform } from "../clientTool.interface";

export const mockJwt = "strapi_mock_token";

export let mockMe: User = {
    "id": 42,
    "username": "root",
    "email": "root@ghtinc.com",
    "role": "root",
    "platform": ["DMP", "DSP"],
    "brand": [{ "id": 4, "name": "robi" }],
    "advertisers": [
        {
            "id": 7,
            "name": "MOS",
            "brand": 4,
        }
    ]
};

export let mockUsers: User[] = [
    {
        "id": 44,
        "username": "dspuser",
        "email": "dspuser@ghtinc.com",
        "role": "user",
        "platform": ["DMP", "DSP"],
        "brand": [{ "id": 4, "name": "ghtinc" }],
        "advertisers": [
            {
                "id": 7,
                "name": "MOS",
                "brand": 4,
            }
        ]
    },
    {
        "id": 43,
        "username": "root",
        "email": "root@ghtinc.com",
        "role": "root",
        "platform": ["DMP", "DSP"],
        "brand": [{ "id": 4, "name": "ghtinc" }],
        "advertisers": [
            {
                "id": 7,
                "name": "MOS",
                "brand": 4,
            }
        ]
    }
];

export const mockRoles: Role[] = [
    {
        "id": 7,
        "name": "admin",
        "nb_users": 0
    },
    {
        "id": 1,
        "name": "root",
        "nb_users": 4
    },
    {
        "id": 2,
        "name": "super_admin",
        "nb_users": 4
    },
    {
        "id": 3,
        "name": "user",
        "nb_users": 1
    }
];

export let mockBrands: Brand[] = [
    {
        "id": 4,
        "name": "ghtinc",
        "advertisers": [
            {
                "id": 7,
                "name": "MOS",
                "brand": 4,
            }
        ],
        "owners": []
    }
];

export let mockAdvertisers: Advertiser[] = [
    {
        "id": 7,
        "name": "MOS",
        "brand": 4,
        "users": [{
            "id": 44,
            "username": "dspuser",
            "email": "dspuser@ghtinc.com",
            "role": "user",
            "platform": ["DMP", "DSP"],
            "brand": [{ "id": 4, "name": "ghtinc" }]
        }, {
            "id": 43,
            "username": "root",
            "email": "root@ghtinc.com",
            "role": "root",
            "platform": ["DMP", "DSP"],
            "brand": [{ "id": 4, "name": "ghtinc" }],
        }]
    }
];

export const mockPlatfrom: Platform[] = [
    {
        id: 1,
        name: "DMP"
    },
    {
        id: 2,
        name: "DSP"
    }
];