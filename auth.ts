import { read, write } from './storage'
import { SlackUser, PersistedAuthState } from './types'
import { google } from 'googleapis'

const CLIENT_ID = ''
const CLIENT_SECRET = ''
const REDIRECT_URL = 'https://homeet-slash-cmd.initial.inc/callback'
const SCOPES = ['https://www.googleapis.com/auth/calendar.events']

const createOAuthClient = () => {
  return new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL)
}

export const generateAuthUrl = (user: SlackUser): string => {
  const client = createOAuthClient()
  return client.generateAuthUrl({
    access_type: 'online',
    scope: SCOPES,
    state: JSON.stringify(user),
  })
}

const readAuthState = async (
  user: SlackUser
): Promise<PersistedAuthState | null> => {
  const key = `${user.team}/${user.id}/auth`
  const raw = await read(key)
  if (raw) {
    return JSON.parse(raw.toString())
  } else {
    return null
  }
}

const writeAuthState = async (
  user: SlackUser,
  state: PersistedAuthState
): Promise<boolean> => {
  const key = `${user.team}/${user.id}/auth`
  return await write(key, JSON.stringify(state))
}

export const readyToUse = async (user: SlackUser): Promise<boolean> => {
  const state = await readAuthState(user)
  return state && state.status === 'done'
}

export const prepareForCallback = async (user: SlackUser) => {
  const payload: PersistedAuthState = { ...user, status: 'callback' }
  await writeAuthState(user, payload)
}

export const verifyCallback = async (user: SlackUser): Promise<boolean> => {
  const state = await readAuthState(user)
  return (
    state &&
    state.status === 'callback' &&
    state.id === user.id &&
    state.team === user.team
  )
}

export const storeAccessToken = async (user: SlackUser, code: string) => {
  const client = createOAuthClient()
  const { tokens } = await client.getToken(code)
  const payload: PersistedAuthState = { ...user, status: 'done', tokens }
  await writeAuthState(user, payload)
}
