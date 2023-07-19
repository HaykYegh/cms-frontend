"use strict";

export const CRYPTO_SECRET: string = "zqsw53nhi46em8j";

export const ACCESS_HEADERS: string = "zu";

export const PASSWORD_MIN_LENGTH: number = 6;

export const NICKNAME_MIN_LENGTH: number = 6;
export const NICKNAME_MAX_LENGTH: number = 20;

export const FOR_BUSSINESS: any = {
    sk: {
        phoneCode: "87",
        fourNumber: "1111"
    }
}

export const LIST: any = {
    ACTION: {
        PREVIOUS: 1,
        NEXT: 2,
        RESET: 3,
    }
};

export const SETTINGS: any = {
    TABS: {
        PERSONAL: 1,
        PASSWORD: 2,
        CUSTOMER: 3,
        EMAIL: 4,
        ACCESS_CONTROL: 5,
        PROFILE: 6,
        APP_RELEASES: 7,
    }
};

export const USERS: any = {
    TABS: {
        REGISTERED: 1,
        NOT_VERIFIED: 2,
        USER_GROUPS: 3,
    }
};

export const PROVIDERS: any = {
    TABS: {
        OPERATORS: 1,
        REGISTRATIONS: 2,
    }
};

export const BILLING: any = {
    TABS: {
        OVERVIEW: 1,
        HISTORY: 2,
        METHODS: 3,
    },
    ACTION: {
        MONTHLY: "MONTHLY",
        ANNUALLY: "ANNUALLY",
    },
    INVOICE: {
        TYPES: [
            {
                value: "MONTHLY",
                label: "Monthly"
            },
            {
                value: "ANNUALLY",
                label: "Annually"
            },
            {
                value: "NEW_MEMBERS",
                label: "New Members"
            }
        ],
        STATUSES: [
            {
                value: "PAID",
                label: "Paid"
            },
            {
                value: "NOT_PAID",
                label: "Not Paid"
            },
        ]
    }
};

export const NOTIFICATION: any = {
    TABS: {
        NEW_NOTIFICATION: {
            COUNTRIES_AND_PLATFORMS: 2,
            NUMBERS: 3,
            GROUPS: 4,
            DEFAULT: 1,
        },
        SENT: 2,
        DRAFTS: 3,
        TRASH: 4,
        IN_PROGRESS: 5,
        SENDERS: 6,
    }
};

export const MANAGE_PAYMENT: any = {
    TABS: {
        TIER_GROUPS: 1,
        TIER_GROUP_CUSTOMERS: 2,
        SUBSCRIPTION: 3,
    }
};

export const NETWORK: any = {
    TABS: {
        NETWORKS: 1,
        INVITE: 2,
        UPDATE: {
            USERS: 1,
            ADMINS: 2,
            INVITEES: 3,
            ACTIVE_USERS: 4,
        }
    },
    UNIQUE_SHORT_NAME_MIN_LENGTH: 6,
    UNIQUE_SHORT_NAME_MAX_LENGTH: 10,
    FULL_NAME_MAX_LENGTH: 250,
};

export const CHANNEL: any = {
    TABS: {
        CHANNELS: 1,
        INVITE: 2,
        UPDATE: {
            USERS: 1,
            ADMINS: 2,
            INVITEES: 3,
            ACTIVE_USERS: 4,
        }
    },
    UNIQUE_SHORT_NAME_MIN_LENGTH: 6,
    UNIQUE_SHORT_NAME_MAX_LENGTH: 10,
    FULL_NAME_MAX_LENGTH: 250,
};

export const STICKERS: any = {
    TABS: {
        DESCRIPTION: 1,
        UPLOAD: 2,
        ARRANGE: 3,
        CONFIGURATIONS: {
            BASE: 4,
            TABS: {
                LANGUAGES: 1,
                COUNTRIES: 2,
                SETTINGS: 3,
            }
        },
        PUBLISH: 5,
    },
    UPLOAD: {
        stickers: {
            title: "Stickers",
            info: "Upload all stickers in PNG format. The longest side of the image should not exceed 800px",
            imageUrl: "../assets/images/stickers_upload_example.png"
        },
        icons: {
            avatar: {
                title: "Avatar",
                info: "Upload the avatar in PNG format with 260x260px size",
            },
            icon: {
                title: "Tab Icon",
                info: "Upload the tab icon in PNG format with 120x120px size",
            },
            unavailable_icon: {
                title: "Tab Icon Unavailable",
                info: "Upload the tab icon in PNG format with 120x120px size",
            },
            banner: {
                title: "Banner",
                info: "Upload the tab icon in PNG format with 1440x448px size",
            },
        },
        preview: {
            title: "Sticker Pack Preview",
            info: "Upload the sticker pack preview in PNG format.The width should be 1280px." +
                "All stickers should be arranged in 4 column grid and organized in Boxes consisting of 4 rows.The number of Boxes can be 2,4,6, 8 and 10.",
            imageUrl: "../assets/images/stickers_preview_example.png"
        },
    }
};

export const BOX_BLOCK: any = {
    ONLINE_USERS: "Online users",
    TOTAL_USERS: "Total users",
    FOREGROUND_USERS: "Users in foreground",
    REGISTERED_USERS: "Registered",
    NOT_VERIFIED_USERS: "Not verified",
    LIVE_CALLS: "Live calls",
    LIVE_OUT_CALLS: "Live out calls",
    BACK_TERMINATION: "Live Out / In calls",
    ANDROID: "Android",
    APPLE: "Apple",
    PAYPAL: "PayPal",
    CHARGINGCARD: "Calling card",
    ADMIN: "Admin",
    STRIPE: "Stripe",
    GOOGLE: "Google"
};

export const VARIABLES: any = {
    ONLINE_USERS: "onlineUsers",
    FOREGROUND_USERS: "foregroundUsers",
    REGISTERED_USERS: "registeredUsers",
    SALES: "sales",
    SPENDING: "spending",
    NOT_VERIFIED_USERS: "notVerifiedUsers",
    USERS: "users",
    CALLS: "calls",
    FREE_CALLS_DURATION: "freeCallsDuration"
};

export const STATISTICS: any = {
    registeredUsers: "User registrations",
    activeUsers: "Active users",
    notVerifiedUsers: "Not verified",
    sales: "Sales",
    spending: "Spending",
    freeCalls: "Free calls",
    freeCallsDuration: "Free calls duration",
    messages: "Messages",
    outCalls: "Out calls",
    backTerminationCalls: "Back termination"
};

export const CHART_COLORS: string[] = [
    "#635CFF", "#FF4B69", "#D963EC", "#39E2F1", "#FB8336", "#16D645",
    "#0ECCA1", "#E946BF", "#058DC7", "#50B432", "#ED561B", "#DDDF00",
    "#24CBE5", "#64E572", "#FF9655"
];

export const PAGINATION_LIMIT: number = 10;

export const PROVIDERS_LIMIT: number = 50;

export const STICKER_BLOCK_COUNT: any = {
    DEFAULT: 2,
    LIMIT: 10
};

export const SORT: any = {
    ASC: "asc",
    DESC: "desc"
};

export const PAGE_NAME: any = {
    "/chat-bots": "Bots",
    "/chat-bots/create": "Create Chat Bot",
    "/chat-bots/update": "Update Chat Bot",
    "/statistics": "Stats",
    "/users": "Users",
    "/not-verified-users": "Not verified users",
    "/notify": "Notifications",
    "/gateways": "SIP Trunks",
    "/gateways/create": "Create SIP Gateway",
    "/gateways/update": "Update SIP Gateway",
    "/sales": "Sales",
    "/payments": "Payments",
    "/invoicing": "Invoicing",
    "/network": "Networks",
    "/network/create": "Create Network",
    "/network/update": "Update Network",
    "/channel": "Channels",
    "/channel/create": "Create Channel",
    "/channel/update": "Update Channel",
    "/stickers": "Stickers",
    "/stickers/create": "Create sticker package",
    "/stickers/update": "Update sticker package",
    "/engagement-tools": "Engagement tools",
    "/rates": "Rates",
    "/sms-voice-pin": "SMS and Voice PIN",
    "/calling-cards": "Calling cards",
    "/calls": "Calls",
    "/billing": "Billing",
    "/billing/create": "New Credit Card",
    "/manage-payment": "Manage billing",
    "/call-package": "Call packages",
    "/call-package/create": "Create call package",
    "/call-package/update": "Update call package",
    "/settings": "Settings",
    "/settings/personal-data": "Personal data",
    "/settings/profile": "User Profile",
    "/settings/change-password": "Change password",
    "/settings/access-control": "Access control",
    "/settings/email/update": "Update email",
    "/settings/email/create": "Create email",
    "/settings/app-releases": "App Releases",
    "/login": "Login",
    "/request-reset-password": "Request reset password",
    "/reset-password": "Reset password",
    "/providers": "SMS Gateways",
    "/customers": "Customers",
};

export const LEFT_PANEL_NAVIGATION: any = {
    statistics: "/statistics",
    users: "/users",
    usersWidthNickname: "/users",
    gateways: "/gateways",
    network: "/network",
    channel: "/channel",
    notify: "/notify",
    notifyWidthNickname: "/notify",
    sales: "/sales",
    salesWithNickname: "/sales",
    payments: "/payments",
    paymentsWithNickname: "/payments",
    calls: "/calls",
    stickers: "/stickers",
    chatBots: "/chat-bots",
    callingCards: "/calling-cards",
    callPackage: "/call-package",
    billing: "/billing",
    providers: "/providers",
    settings: "/settings",
    managePayment: "/manage-payment",
    rates: "/rates",
    smsVoicePin: "/sms-voice-pin",
    engagementTools: "/engagement-tools",
    invoicing: "/invoicing",
    customers: "/customers",
};

export const STACKED_CHART_HEIGHT: number = 200;

export const MAP_CHART_HEIGHT: number = 380;

export const LINE_CHART_HEIGHT: number = 150;

export const PIE_CHART_HEIGHT: number = 250;

export const IMAGE_MIME_TYPE: Array<string> = ["image/jpg", "image/jpeg", "image/png"];

export const ADDITIONAL_FILTERS: any = {
    activity: "Last activity",
    network: "Network",
    channel: "Channel",
    blocked: "Blocked",
    balance: "Balance",
    callCount: "Number of calls",
    duration: "Calls duration",
    messageCount: "Number of messages",
};

export const GRADIENTS: any = [
    "#99CEFE", "#949EFA", "#A3F1FF", "#79B6FF",
    "#FFA695", "#FC7599", "#EDAAC8", "#C18BF0",
    "#FF99C5", "#FBB8A5", "#3CF1B4", "#4BCDD7",
];

export const DEVICES: any = {
    APPLE: 1,
    ANDROID: 2
};

export const PLACEHOLDER_SHIMMER_LIMIT: number = 5;

export const DEFAULT_BILLING_METHOD: string = "All";

export const METRIC_TYPES: any = {
    MSG: {
        TYPE: "MSG",
        LABEL: "Message",
        CONTEXT: {
            TXT: {
                value: "TXT",
                label: "Text"
            },
            IMAGE: {
                value: "IMAGE",
                label: "Image"
            },
            VIDEO: {
                value: "VIDEO",
                label: "Video"
            },
            LOCATION: {
                value: "LOCATION",
                label: "Location"
            },
            VOICE: {
                value: "VOICE",
                label: "Voice"
            },
            STICKER: {
                value: "STICKER",
                label: "Sticker"
            },
            FILE: {
                value: "FILE",
                label: "File"
            },
            EDITE_MSG: {
                value: "EDITE_MSG",
                label: "Edited"
            },
            DELETE_MSG: {
                value: "DELETE_MSG",
                label: "Deleted"
            },
        }

    },
    INTERNAL_CALL: {
        TYPE: "INTERNAL_CALL",
        LABEL: "Internal call",
        CONTEXT: {
            START: {
                value: "START",
                label: "Start"
            },
            END: {
                value: "END",
                label: "End"
            },
            RINGING: {
                value: "RINGING",
                label: "Ringing"
            },
        }
    },
    OUT_CALL: {
        TYPE: "OUT_CALL",
        LABEL: "Out call",
        CONTEXT: {
            START: {
                value: "START",
                label: "Start"
            },
            END: {
                value: "END",
                label: "End"
            },
            RINGING: {
                value: "RINGING",
                label: "Ringing"
            },
        }
    },
    GROUP_MSG: {
        TYPE: "GROUP_MSG",
        LABEL: "Group message",
        CONTEXT: {
            TXT: {
                value: "TXT",
                label: "Text"
            },
            IMAGE: {
                value: "IMAGE",
                label: "Image"
            },
            VIDEO: {
                value: "VIDEO",
                label: "Video"
            },
            LOCATION: {
                value: "LOCATION",
                label: "Location"
            },
            VOICE: {
                value: "VOICE",
                label: "Voice"
            },
            STICKER: {
                value: "STICKER",
                label: "Sticker"
            },
            FILE: {
                value: "FILE",
                label: "File"
            },
            EDITE_MSG: {
                value: "EDITE_MSG",
                label: "Edited"
            },
            DELETE_MSG: {
                value: "DELETE_MSG",
                label: "Deleted"
            },
        }
    },
    BACK_CALL: {
        TYPE: "BACK_CALL",
        LABEL: "Back call",
        CONTEXT: {
            START: {
                value: "START",
                label: "Start"
            },
            END: {
                value: "END",
                label: "End"
            },
            RINGING: {
                value: "RINGING",
                label: "Ringing"
            },
        }
    },
    DURATION_INTERNAL_CALL: {
        TYPE: "DURATION_INTERNAL_CALL",
        LABEL: "Internal call duration",
        CONTEXT: {
            END: {
                value: "END",
                label: "End"
            },
        }
    },
    DURATION_OUT_CALL: {
        TYPE: "DURATION_OUT_CALL",
        LABEL: "Out call duration",
        CONTEXT: {
            END: {
                value: "END",
                label: "End"
            },
        }
    },
    DURATION_BACK_CALL: {
        TYPE: "DURATION_BACK_CALL",
        LABEL: "Call back duration",
        CONTEXT: {
            END: {
                value: "END",
                label: "End"
            },
        }
    },
};

export const CALL_TYPE: any = {
    ALL: "All",
    // different for zangi, MUST BE CLOSED FOR JALA
    INTERNAL: "Internal",
    // end
    OUTGOING: "Call out",
    BACKCALL: "Back call",
};

export const CHART_TYPES: any = {
    TOTAL: "TOTAL",
    SINGLE: "SINGLE",
    GROUP: "GROUP",
};

export const CREDIT_CARD_TYPES: any = {
    "American Express": "amex",
    "JCB": "jcb",
    "MasterCard": "mastercard",
    "Visa": "visa",
    "Discover": "discover",
    "UnionPay": "unionpay",
    "Diners Club": "diners-club",
};

export const COUNTRIES_SHOW_LIMIT: number = 1;

export const LIMIT: number = 999999;

export const DEFAULT_CURRENCY: string = "USD";

export const LOGGED_ROUTER_REDIRECT: string = "/statistics";

export const LEFT_PAGE: string = "LEFT";

export const RIGHT_PAGE: string = "RIGHT";

export const NEW_USER_CREATE: any = {
    TYPE: {
        VIA_EMAIL: "email",
        VIA_PHONE_NUMBER: "phone",
        VIA_USERNAME: "username"
    },
};

export const ERROR_TYPES: any = {
    DB_ERROR: "Database error",
    SERVER_ERROR: "Server error",
    VALIDATION_ERROR: "Validation error",
    SIGNALING_ERROR: "Signaling service error",
    UPLOAD_ERROR: "Upload error",
    BILLING_SERVICE_ERROR: "",
    NETWORK_BILLING_SERVICE_ERROR: "",
    USER_ALREADY_EXIST: "{record} is already registered.",
    NETWORK_ALREADY_EXIST: "{record} network already exists",
    CHANNEL_ALREADY_EXIST: "{record} channel already exists",
};

export const ATTEMPT_TYPE: any = {
    TOTAL: "TOTAL",
    DAILY: "DAILY"
};

export const USER_ATTRIBUTES: any = {
    firstName: 2,
    lastName: 3,
    address: 4,
    company: 8
};

export const REGISTRATION_TYPES: any = {
    ALL: "All registrations",
    EMAIL: "Email",
    PHONE: "Phone"
};
