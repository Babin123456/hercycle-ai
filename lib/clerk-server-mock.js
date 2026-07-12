import { NextResponse } from 'next/server';

export const auth = async () => {
  return {
    userId: 'mock_user_12345',
    protect: () => {},
  };
};

export const currentUser = async () => {
  return {
    id: 'mock_user_12345',
    firstName: 'Jane',
    lastName: 'Doe',
    emailAddresses: [{ emailAddress: 'jane.doe@example.com' }],
    publicMetadata: { role: 'primary' }
  };
};

export const clerkClient = {
  users: {
    getUser: async (id) => ({
      id,
      firstName: 'Jane',
      lastName: 'Doe',
      emailAddresses: [{ emailAddress: 'jane.doe@example.com' }],
      publicMetadata: { role: 'primary' }
    }),
    updateUserMetadata: async (id, metadata) => {
      console.log('Mock updateUserMetadata:', id, metadata);
      return { id };
    }
  }
};

export async function getAuthUserId() {
  return 'mock_user_12345';
}

export function clerkMiddleware() {
  return (req) => NextResponse.next();
}

export function createRouteMatcher() {
  return (req) => false;
}
