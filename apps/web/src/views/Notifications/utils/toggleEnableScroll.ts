export const disableGlobalScroll = () => {
  if (!document?.body?.style) return
  document.body.style.overflowY = 'scroll'
  document.body.style.position = 'fixed'
  document.body.style.width = '100%'
}

export const enableGlobalScroll = () => {
  if (!document?.body?.style) return
  document.body.style.overflowY = 'auto'
  document.body.style.position = 'static'
  document.body.style.width = 'auto'
}
