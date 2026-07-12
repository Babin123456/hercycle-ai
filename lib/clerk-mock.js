'use client'

import React from 'react'

export function ClerkProvider({ children }) {
  return <>{children}</>
}

export function SignIn() {
  return <div>Mock Sign In Component</div>
}

export function SignUp() {
  return <div>Mock Sign Up Component</div>
}

export function UserButton() {
  return <button>Mock User Profile</button>
}

export function useAuth() {
  return {
    isLoaded: true,
    isSignedIn: true,
    userId: 'mock_user_12345',
    sessionId: 'mock_session_12345',
    getToken: async () => 'mock_token',
    signOut: async () => console.log('Mock sign out')
  }
}

export function useUser() {
  return {
    isLoaded: true,
    isSignedIn: true,
    user: {
      id: 'mock_user_12345',
      firstName: 'Jane',
      lastName: 'Doe',
      imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      primaryEmailAddress: { emailAddress: 'jane.doe@example.com' },
      publicMetadata: { role: 'primary' }
    }
  }
}

export function useSession() {
  return {
    isLoaded: true,
    session: { id: 'mock_session_12345' }
  }
}

export function useClerk() {
  return {
    signOut: async () => console.log('Mock sign out')
  }
}
