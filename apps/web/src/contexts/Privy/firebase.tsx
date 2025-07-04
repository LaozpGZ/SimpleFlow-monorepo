import {
  getAuth,
  GoogleAuthProvider,
  signInWithCustomToken,
  signInWithPopup,
  TwitterAuthProvider,
  UserCredential,
} from 'firebase/auth'
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react'

import { firebaseApp } from './constants'

// Define the context type
interface AuthContextType {
  token: string | undefined
  getToken: () => Promise<string | undefined>
  isLoading: boolean
  loginWithGoogle: () => Promise<void>
  loginWithX: () => Promise<void>
  loginWithDiscord: () => Promise<void>
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
  const [discordPopup, setDiscordPopup] = useState<Window | null>(null)

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

  const loginWithDiscord = async () => {
    try {
      setLoading(true)
      // Open Discord OAuth page
      const redirectUri = `${window.location.origin}/api/auth/discord-callback`
      const clientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID
      const popup = window.open(
        `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
          redirectUri,
        )}&response_type=code&scope=identify`,
        '_blank',
        'width=500,height=600',
      )

      setDiscordPopup(popup)

      // Listen for messages from the popup window
      const handleMessage = async (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return
        if (event.data?.customToken) {
          window.removeEventListener('message', handleMessage)

          // Sign in to Firebase with custom token
          const auth = getAuth(firebaseApp)
          const userCredential = await signInWithCustomToken(auth, event.data.customToken)
          const idToken = await userCredential.user.getIdToken(true)
          setToken(idToken)
        }
      }

      window.addEventListener('message', handleMessage)
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

    // Clean up Discord popup window
    return () => {
      if (discordPopup && !discordPopup.closed) {
        discordPopup.close()
      }
    }
  }, [discordPopup])

  const value = {
    token,
    isLoading,
    getToken,
    loginWithGoogle,
    loginWithX,
    loginWithDiscord,
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
