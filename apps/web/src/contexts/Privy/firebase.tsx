import {
  getAuth,
  GoogleAuthProvider,
  signInWithCustomToken,
  signInWithPopup,
  signOut,
  TwitterAuthProvider,
  UserCredential,
} from 'firebase/auth'
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react'
import { loadTelegramLoginWidget } from './telegramLogin'

import { firebaseApp } from './constants'

// Define the context type
interface AuthContextType {
  token: string | undefined
  getToken: () => Promise<string | undefined>
  isLoading: boolean
  loginWithGoogle: () => Promise<void>
  loginWithX: () => Promise<void>
  loginWithDiscord: () => Promise<void>
  loginWithTelegram: () => Promise<void>
  signOutAndClearUserStates: () => void
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
  const [telegramPopup, setTelegramPopup] = useState<Window | null>(null)

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

  // Helper function to sign in with custom token
  const loginWithCustomToken = async (customToken: string) => {
    try {
      const auth = getAuth(firebaseApp)
      const userCredential = await signInWithCustomToken(auth, customToken)
      const idToken = await userCredential.user.getIdToken(true)
      setToken(idToken)
      console.log('Discord/Telegram login success with token')
      return true
    } catch (error) {
      console.error('Error signing in with custom token:', error)
      return false
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
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const loginWithTelegram = async () => {
    try {
      setLoading(true)

      loadTelegramLoginWidget('telegram-widget-root', (token) => {
        loginWithCustomToken(token)
      })
      // @ts-ignore
      TWidgetLogin.auth()
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

  // Social login handler (Discord & Telegram)
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return
      if (event.data?.customToken) {
        await loginWithCustomToken(event.data.customToken)
      }
    }

    // If postMessage is received
    window.addEventListener('message', handleMessage)

    // fallback: If postMessage is not received, actively take from localStorage
    const checkLocalStorage = setInterval(() => {
      // Check for Discord token
      const discordToken = localStorage.getItem('discordAuthToken')
      if (discordToken) {
        clearInterval(checkLocalStorage)
        localStorage.removeItem('discordAuthToken')
        loginWithCustomToken(discordToken)
      }

      // Check for Telegram token
      const telegramToken = localStorage.getItem('telegramAuthToken')
      if (telegramToken) {
        clearInterval(checkLocalStorage)
        localStorage.removeItem('telegramAuthToken')
        loginWithCustomToken(telegramToken)
      }
    }, 1000)

    return () => {
      window.removeEventListener('message', handleMessage)
      clearInterval(checkLocalStorage)
    }
  }, [])

  // Clean up Discord popup window
  useEffect(() => {
    return () => {
      if (discordPopup && !discordPopup.closed) {
        discordPopup.close()
      }
    }
  }, [discordPopup])

  const signOutFirebase = useCallback(async () => {
    const auth = getAuth(firebaseApp)
    try {
      await signOut(auth)
    } catch (err) {
      console.error(err)
    }
  }, [])

  const signOutAndClearUserStates = useCallback(async () => {
    await signOutFirebase()
    setToken(undefined)
    setLoading(false)
  }, [])

  const value = {
    token,
    isLoading,
    getToken,
    loginWithGoogle,
    loginWithX,
    loginWithDiscord,
    loginWithTelegram,
    signOutAndClearUserStates,
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
