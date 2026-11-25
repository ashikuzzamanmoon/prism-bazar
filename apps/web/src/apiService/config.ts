const BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}`;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${BASE_URL}/auth/user-login`,
    REGISTER: `${BASE_URL}/auth/register`,
    OtpVerify: `${BASE_URL}/auth/verify-otp`,
    ResendOtp: `${BASE_URL}/auth/resend-otp`,
  },

  ORDER: {
    CREATE: `${BASE_URL}/orders`,
    CASH_ON_DELIVERY: `${BASE_URL}/orders/cash-on-delivery`,
    MANUAL_PAYMENT: `${BASE_URL}/orders/manual-payment`,
    GET_INVOICE: `${BASE_URL}/orders`,
    GET_MY_ORDERS: `${BASE_URL}/orders/my-orders`,
  },

  DELIVERY_ZONE: {
    GET_ACTIVE: `${BASE_URL}/delivery-zones`,
  },

  Collection: {
    getAll: `${BASE_URL}/collections/all`,
    getAllQuery: `${BASE_URL}/collections/query`,
  },
  BRAND: {
    GetAll: `${BASE_URL}/brand/query`,
    GetAllBrands: `${BASE_URL}/brand/all`,
  },
  PRODUCT: {
    GetAll: `${BASE_URL}/products`,
    GetSingle: `${BASE_URL}/products`,
    GetRelevant: `${BASE_URL}/products/relevant/by-collection-category`,
    GetNewArrivals: `${BASE_URL}/products/new-arrival-product`,
    GetPreOwned: `${BASE_URL}/products/pre-owned-product`,
    GetAccessories: `${BASE_URL}/products/accessories-product`,
    CollectionProducts: `${BASE_URL}/collections/products`,
  },
  PROMOCODE: {
    GET_ALL: `${BASE_URL}/promocode`,
    APPLY: `${BASE_URL}/promocode/apply`,
  },
  BANNER: {
    GetAll: `${BASE_URL}/banners`,
  },
  CATEGORY: {
    GetAll: `${BASE_URL}/categories/query`,
  },
  SUB_CATEGORY: {
    GetAll: `${BASE_URL}/sub-category/query`,
  },
  USER: {
    MY_PROFILE: `${BASE_URL}/users/my-profile`,
    UPDATE_PROFILE: `${BASE_URL}/users/profile`,
  },
  FILE: {
    UPLOAD: `${BASE_URL}/file-uploader`,
  },
  CONTENT: {
    GetAll: `${BASE_URL}/contents`,
  },
} as const;
