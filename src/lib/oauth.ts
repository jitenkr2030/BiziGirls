import { config } from '@/lib/config'

export interface OAuthProvider {
  name: string
  clientId: string
  clientSecret: string
  redirectUri: string
  authorizationUrl: string
  tokenUrl: string
  userInfoUrl: string
  scopes: string[]
}

export const oauthProviders: Record<string, OAuthProvider> = {
  google: {
    name: 'Google',
    clientId: config.oauth.google.clientId,
    clientSecret: config.oauth.google.clientSecret,
    redirectUri: `${config.appUrl}/api/auth/callback/google`,
    authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
    scopes: ['openid', 'email', 'profile']
  },
  linkedin: {
    name: 'LinkedIn',
    clientId: config.oauth.linkedin.clientId,
    clientSecret: config.oauth.linkedin.clientSecret,
    redirectUri: `${config.appUrl}/api/auth/callback/linkedin`,
    authorizationUrl: 'https://www.linkedin.com/oauth/v2/authorization',
    tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
    userInfoUrl: 'https://api.linkedin.com/v2/userinfo',
    scopes: ['openid', 'profile', 'email']
  }
}

export function generateOAuthState(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export function generateOAuthCodeVerifier(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

export async function generateOAuthCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(verifier)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return base64UrlEncode(String.fromCharCode(...new Uint8Array(digest)))
}

export interface OAuthUserInfo {
  id: string
  email: string
  name?: string
  firstName?: string
  lastName?: string
  picture?: string
  verified?: boolean
}

export async function getGoogleUserInfo(accessToken: string): Promise<OAuthUserInfo> {
  const response = await fetch(oauthProviders.google.userInfoUrl, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  })

  if (!response.ok) {
    throw new Error('Failed to fetch Google user info')
  }

  const data = await response.json()
  
  return {
    id: data.id,
    email: data.email,
    name: data.name,
    firstName: data.given_name,
    lastName: data.family_name,
    picture: data.picture,
    verified: data.verified_email
  }
}

export async function getLinkedInUserInfo(accessToken: string): Promise<OAuthUserInfo> {
  const response = await fetch(oauthProviders.linkedin.userInfoUrl, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  })

  if (!response.ok) {
    throw new Error('Failed to fetch LinkedIn user info')
  }

  const data = await response.json()
  
  return {
    id: data.sub,
    email: data.email,
    name: `${data.given_name} ${data.family_name}`,
    firstName: data.given_name,
    lastName: data.family_name,
    picture: data.picture,
    verified: data.email_verified
  }
}

export async function exchangeCodeForToken(provider: string, code: string, codeVerifier?: string): Promise<string> {
  const oauthProvider = oauthProviders[provider]
  
  if (!oauthProvider) {
    throw new Error(`Unsupported OAuth provider: ${provider}`)
  }

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: oauthProvider.redirectUri,
    client_id: oauthProvider.clientId,
    client_secret: oauthProvider.clientSecret
  })

  if (codeVerifier) {
    body.append('code_verifier', codeVerifier)
  }

  const response = await fetch(oauthProvider.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body.toString()
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(`Failed to exchange code for token: ${errorData.error_description || errorData.error}`)
  }

  const data = await response.json()
  return data.access_token
}

export function getOAuthAuthorizationUrl(provider: string, state: string, codeChallenge?: string): string {
  const oauthProvider = oauthProviders[provider]
  
  if (!oauthProvider) {
    throw new Error(`Unsupported OAuth provider: ${provider}`)
  }

  const params = new URLSearchParams({
    client_id: oauthProvider.clientId,
    redirect_uri: oauthProvider.redirectUri,
    response_type: 'code',
    scope: oauthProvider.scopes.join(' '),
    state
  })

  if (codeChallenge) {
    params.append('code_challenge', codeChallenge)
    params.append('code_challenge_method', 'S256')
  }

  return `${oauthProvider.authorizationUrl}?${params.toString()}`
}