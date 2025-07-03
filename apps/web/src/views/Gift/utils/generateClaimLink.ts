export function generateClaimLink({ code }: { code: string }) {
  return `https://${window.location.host}/invite/${code}`
}
