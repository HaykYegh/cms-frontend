"use strict";

export default {
    panel: {
        baseUrl: process.env.API_URL,
        name: process.env.APP_NAME,
        env: {
            recaptcha: process.env.GOOGLE_RE_CAPTCHA
        },
        billingVersion: process.env.BILLING_VERSION,
        api: {
            v1: {
                authentication: {
                    signUp: "/v1/authentication/signup",
                    signIn: "/v1/authentication/sign-in",
                    requestResetPassword: "/v1/authentication/request-reset-password",
                    resetPassword: "/v1/authentication/reset-password"
                },
                stickers: {
                    base: "/v1/stickers",
                    categories: "/v1/stickers/categories",
                    statuses: "/v1/stickers/statuses",
                },
                notifications: {
                    base: "/v1/notifications",
                    users: {
                        base: "/v1/notifications/users",
                        count: "/v1/notifications/users/count",
                        numbers: "/v1/notifications/users/numbers",
                    },
                    attributes: "/v1/notifications/attributes"
                },
                users: "/v1/users",
                channelUsersSearch: "/channels/v1/users/search",
                administrators: "/v1/administrators",
                attempts: "/v1/attempts",
                devices: "/v1/devices",
                customers: "/v1/tierGroupCustomers/",
                templates: "/v1/templates/",
                profile: {
                    base: "/v1/profile",
                    editPassword: "/v1/profile/password",
                },
                activities: "/v1/activities/",
                notVerifiedUsers: "/v1/users/info/unregistered_users",
                unregisteredUsersList: "/v1/users/info/unregistered_users_list",
                registeredUsers: "/v1/users/info/registered_users",
                gateways: {
                    base: "/v1/gateways/",
                    health: "/v1/gateways/health",
                },
                misc: {
                    countries: "/v1/misc/countries",
                    languages: "/v1/misc/languages",
                    platforms: "/v1/misc/platforms",
                    methods: "/v1/misc/billing-methods",
                    billingCountries: "/v1/misc/billing-countries",
                    packages: "/v1/misc/customer-packages",
                    callState: "/v1/misc/test",
                    smsMethods: "/v1/sms"
                },
                statistics: {
                    base: "/v1/statistics",
                    users: "/v1/statistics/users",
                    billing: "/v1/statistics/billing",
                    transactions: "/v1/statistics/billing/transactions",
                    call: "/v1/statistics/call/transactions",
                    platforms: "/v1/statistics/users/platform",
                    countries: "/v1/statistics/users/countries",
                    total: "/v1/statistics/users/total/registrations",
                    live: "/v1/statistics/live",
                    usersInDate: "/v1/statistics/users/count",
                },
                stats: {
                    messagesCountByType: "/networks/v1/stats/messages/types/count"
                },
                networks: {
                    base: "/v1/networks",
                },
                channels: {
                    base: "/v1/channels",
                }
            },
            v2: {
                attempts: {
                    base: "/v2/users"
                },
                billing: {
                    callHistory: "/v2/billing/call-history",
                    transactions: "/v2/billing/transactions",
                    transactionsTotal: "/v2/billing/transactions/total",
                    channelTransactions: "/v2/billing/channelTransactions",
                    channelTransactionsTotal: "/v2/billing/channelTransactions/total",
                    methods: "/v2/billing/methods",
                    count: "/v2/billing/transactions/count",
                    balance: "/v2/billing/balance"
                },
                callPackages: "/v2/call-packages",
                chargingCards: "/v2/charging-cards",
                chatBots: {
                    base: "/v2/chat-bots",
                },
                metrics: {
                    base: "/v2/metrics",
                    types: "/v2/metrics/types",
                    activity: "/v2/metrics/values",
                    countries: "/v2/metrics/countries",
                },
                networks: {
                    base: "/v2/networks"
                },
                channels: {
                    base: "/v2/channels",
                    search: "/v2/search-channel"
                },
                payments: {
                    base: "/v2/payments",
                    cards: "/v2/payments/cards",
                    tierGroups: "/v2/payments/tier-groups"
                },
                profile: {
                    base: "/v2/settings",
                    password: "/v2/settings/password",
                    attributes: "/v2/settings/profile",
                },
                providers: {
                    base: "/v2/providers",
                    types: "/v2/providers/provider-types",
                    typeCount: "/v2/providers/provider-types/count",
                    count: "/v2/providers/count",
                },
                stats: {
                    base: "/v2/stats",
                    messagesByCounties: "/v2/stats/messages",
                    messagesByTypes: "/v2/stats/messages/types",
                    messagesCountByTypes: "/v2/stats/messages/types/count",
                    timeline: "/v2/stats/messages/timeline",
                    callsByCounties: "/v2/stats/calls",
                    callsMetricTypes: "/v2/stats/calls/metric-types",
                    callsByTypes: "/v2/stats/calls/timeline",
                    usersByCountries: "/v2/stats/users/countries",
                    usersOverview: "/v2/stats/users/overview",
                    usersTimeline: "/v2/stats/users/timeline",
                    users: "/v2/stats/users",
                    presence: "/v2/stats/users/presences",
                    presenceCount: "/v2/stats/users/presences/count",
                },
                systemMessages: {
                    base: "/v2/system-messages"
                },
                users: {
                    base: "/v2/users",
                    count: "/v2/users/count",
                    search: "/v2/users/search",
                    searchByEmailOrNickname: "/v2/users/searchByEmailOrNickname",
                    notVerified: "/v2/users/not-verified",
                    notVerifiedCount: "/v2/users/not-verified/count",
                },
                notifications: {
                    senders: "/v2/notifications/senders",
                    count: "/v2/notifications/senders/count",
                    userGroups: "/v2/notifications/user-groups"
                },
                customers: {
                    base: "/v2/customers",
                    count: "/v2/customers/count"
                },
                administrators: "/v2/admins",
            },
            v3: {
                userGroups: {
                    base: "/v3/user-groups",
                    count: "/v3/user-groups/count",
                },
                gateways: {
                    base: "/v3/gateways",
                    health: "/v3/gateways/health",
                },
                calls: {
                    base: "/v3/calls",
                    count: "/v3/calls/count"
                },
                providers: {
                    base: "/v3/providers",
                    countries: "/v3/providers/countries",
                },
                appReleases: {
                    base: "/v3/app-releases",
                    count: "/v3/app-releases/count"
                }
            }
        }
    }
};
