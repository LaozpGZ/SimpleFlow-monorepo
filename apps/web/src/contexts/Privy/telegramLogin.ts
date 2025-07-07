// lib/telegramLogin.ts

// Define the onTelegramAuth function in the global scope
type TelegramUser = {
  id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
  auth_date: number
  hash: string
}

// Make sure we're properly declaring the global window interface
declare global {
  interface Window {
    onTelegramAuth: (user: TelegramUser) => Promise<void>
  }
}

export function loadTelegramLoginWidget(
  containerId: string = 'telegram-widget-root',
  onLogin: (token: string) => void,
) {
  // Define the function in the global scope
  window.onTelegramAuth = async function (user: TelegramUser) {
    try {
      console.log({ user }, 'telegram user')
      const res = await fetch('/api/auth/telegram-callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      })

      const data = await res.json()
      if (data.customToken) {
        onLogin(data.customToken)
      } else {
        alert('fail to login')
      }
    } catch (err) {
      console.error('Telegram login failed:', err)
    }
  }

  // clear container, avoid duplicate insertion
  const container = document.getElementById(containerId)
  if (container) container.innerHTML = ''

  const script = document.createElement('script')
  script.src = 'https://telegram.org/js/telegram-widget.js?22'
  script.async = true
  script.setAttribute('data-telegram-login', 'pancake_social_login_dev_bot')
  script.setAttribute('data-size', 'large')
  script.setAttribute('data-userpic', 'false')
  script.setAttribute('data-request-access', 'write')
  script.setAttribute('data-onauth', 'onTelegramAuth(user)')
  container?.appendChild(script)
}
