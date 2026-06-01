// src/constants/roles.js
export const ROLES = {
  ADMIN: 'admin',
  HOSTEL_OWNER: 'hostel_owner',
  USER: 'user'
};

export const PERMISSIONS = {
  // Admin permissions
  MANAGE_ALL: 'manage_all',
  MANAGE_USERS: 'manage_users',
  MANAGE_HOSTELS: 'manage_hostels',
  
  // Hostel Owner permissions
  MANAGE_OWN_HOSTELS: 'manage_own_hostels',
  VIEW_BOOKINGS: 'view_bookings',
  
  // User permissions
  BOOK_HOSTELS: 'book_hostels',
  VIEW_PROFILE: 'view_profile'
};

export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    PERMISSIONS.MANAGE_ALL,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.MANAGE_HOSTELS
  ],
  [ROLES.HOSTEL_OWNER]: [
    PERMISSIONS.MANAGE_OWN_HOSTELS,
    PERMISSIONS.VIEW_BOOKINGS
  ],
  [ROLES.USER]: [
    PERMISSIONS.BOOK_HOSTELS,
    PERMISSIONS.VIEW_PROFILE
  ]
};

export const hasPermission = (role, permission) => {
  return ROLE_PERMISSIONS[role]?.includes(permission) || false;
};