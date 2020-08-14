import { Advertiser, Brand, Role, User } from "../clientTool.interface";

export const mockJwt = "strapi_mock_token";

export const mockMe: User = {
    "id": 42,
    "username": "post",
    "email": "post@ghtinc.com",
    "role": "User",
    "access": "Both",
    "brand": [{ "id": 4, "name": "robi" }],
    "advertisers": [
        {
            "id": 7,
            "name": "MOS2",
            "brand": 4,
        }
    ]
};

export const mockUsers: User[] = [
    {
        "id": 44,
        "username": "dspuser",
        "email": "dspuser@ghtinc.com",
        "role": "User",
        "access": "DSP",
        "brand": [{ "id": 4, "name": "robi" }],
        "advertisers": [
            {
                "id": 7,
                "name": "MOS5",
                "brand": 4,
            }
        ]
    },
    {
        "id": 43,
        "username": "post",
        "email": "post@ghtinc.com",
        "role": "User",
        "access": "Both",
        "brand": [{ "id": 4, "name": "robi" }],
        "advertisers": [
            {
                "id": 7,
                "name": "MOS5",
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

export const mockBrands: Brand[] = [
    {
        "id": 4,
        "name": "robi",
        "advertisers": [
            {
                "id": 7,
                "name": "MOS5",
                "brand": 4,
            }
        ]
    }
];

export const mockAdvertisers: Advertiser[] = [
    {
        "id": 7,
        "name": "MOS5",
        "brand": 4,
    }
];