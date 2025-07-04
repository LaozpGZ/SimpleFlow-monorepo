import { getAuth, GoogleAuthProvider, signInWithPopup, TwitterAuthProvider, UserCredential } from 'firebase/auth'
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react'

import { firebaseApp } from './constants'

// Define the context type
interface AuthContextType {
  token: string | undefined
  getToken: () => Promise<string | undefined>
  isLoading: boolean
  loginWithGoogle: () => Promise<void>
  loginWithX: () => Promise<void>
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Provider component
interface AuthProviderProps {
  children: ReactNode
}

export function FirebaseAuthProvider({ children }: AuthProviderProps) {
  const [isLoading, setLoading] = useState(false)
  const [token, setToken] = useState<string | undefined>()

  const signInWithGoogle = async (): Promise<UserCredential> => {
    try {
      const auth = getAuth(firebaseApp)
      const googleProvider = new GoogleAuthProvider()
      const res = await signInWithPopup(auth, googleProvider)
      return res
    } catch (err) {
      alert(err)
      throw err
    }
  }

  const signInWithX = async (): Promise<UserCredential> => {
    try {
      const auth = getAuth(firebaseApp)
      const twitterProvider = new TwitterAuthProvider()
      const res = await signInWithPopup(auth, twitterProvider)
      return res
    } catch (err) {
      alert(err)
      throw err
    }
  }

  const loginWithGoogle = async () => {
    try {
      setLoading(true)
      const loginRes = await signInWithGoogle()
      const idToken = await loginRes.user.getIdToken(true)
      setToken(idToken)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const loginWithX = async () => {
    try {
      setLoading(true)
      const loginRes = await signInWithX()
      const idToken = await loginRes.user.getIdToken(true)
      setToken(idToken)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getToken = useCallback(async () => {
    if (token) {
      return token
    }
    const auth = getAuth(firebaseApp)
    if (!auth.currentUser) {
      return undefined
    }
    const idToken = await auth.currentUser.getIdToken(true)
    setToken(idToken)
    return idToken
  }, [token])

  useEffect(() => {
    const auth = getAuth(firebaseApp)
    auth.onAuthStateChanged((user) => {
      console.log('Auth state changed')
    })
    auth.onIdTokenChanged((user) => {
      console.log('Auth on change', user)
    })
  }, [])

  const value = {
    token,
    isLoading,
    getToken,
    loginWithGoogle,
    loginWithX,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Custom hook to use the auth context
export function useFirebaseAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
