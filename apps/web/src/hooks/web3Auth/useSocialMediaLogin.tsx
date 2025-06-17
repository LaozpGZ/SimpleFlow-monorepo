// import { AUTH_CONNECTION, WALLET_CONNECTORS } from '@web3auth/modal'
// import { useWeb3AuthConnect } from '@web3auth/modal/react'
// import { firebaseApp, verifier } from 'contexts/Web3Auth/config'
// import { getAuth, GoogleAuthProvider, signInWithPopup, TwitterAuthProvider, UserCredential } from 'firebase/auth'
// import { useCallback } from 'react'

// const signInWithGoogle = async (): Promise<UserCredential> => {
//   try {
//     const auth = getAuth(firebaseApp)
//     const googleProvider = new GoogleAuthProvider()
//     const res = await signInWithPopup(auth, googleProvider)
//     return res
//   } catch (err) {
//     alert(err)
//     throw err
//   }
// }

// const signInWithX = async (): Promise<UserCredential> => {
//   try {
//     const auth = getAuth(firebaseApp)
//     const twitterProvider = new TwitterAuthProvider()
//     const res = await signInWithPopup(auth, twitterProvider)
//     return res
//   } catch (err) {
//     alert(err)
//     throw err
//   }
// }

// export function useSocialMediaLogin() {
//   const { connectTo } = useWeb3AuthConnect()

//   const loginWithGoogle = useCallback(async () => {
//     try {
//       const loginRes = await signInWithGoogle()
//       const idToken = await loginRes.user.getIdToken(true)
//       connectTo(WALLET_CONNECTORS.AUTH, {
//         authConnectionId: verifier,
//         authConnection: AUTH_CONNECTION.CUSTOM,
//         idToken,
//         extraLoginOptions: {
//           isUserIdCaseSensitive: false,
//         },
//       })
//     } catch (err) {
//       console.error(err)
//     }
//   }, [connectTo])

//   const loginWithX = useCallback(async () => {
//     try {
//       const loginRes = await signInWithX()
//       const idToken = await loginRes.user.getIdToken(true)
//       connectTo(WALLET_CONNECTORS.AUTH, {
//         authConnectionId: verifier,
//         authConnection: AUTH_CONNECTION.CUSTOM,
//         idToken,
//         extraLoginOptions: {
//           isUserIdCaseSensitive: false,
//         },
//       })
//     } catch (err) {
//       console.error(err)
//     }
//   }, [connectTo])

//   return {
//     loginWithGoogle,
//     loginWithX,
//   }
// }
