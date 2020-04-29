import { google } from 'googleapis'
import { v4 as uuidv4 } from 'uuid'
import { read, write } from './storage'
import { SlackUser, PersistedAuthState } from './types'

const SCOPES = ['https://www.googleapis.com/auth/calendar.events']

const createOAuthClient = () => {
  return new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URL
  )
}

export const generateAuthUrl = (user: SlackUser, setup: string): string => {
  const client = createOAuthClient()
  return client.generateAuthUrl({
    access_type: 'online',
    scope: SCOPES,
    state: JSON.stringify({ ...user, setup }),
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

export const prepareForAuth = async (user: SlackUser) => {
  const setup = uuidv4()
  const payload: PersistedAuthState = { ...user, status: 'auth', setup }
  await writeAuthState(user, payload)
  return setup
}

export const verifyAuth = async (
  user: SlackUser,
  setup: string
): Promise<boolean> => {
  const state = await readAuthState(user)
  console.log(JSON.stringify(state))
  return (
    state &&
    state.status === 'auth' &&
    state.id === user.id &&
    state.team === user.team &&
    state.setup === setup
  )
}

export const prepareForCallback = async (user: SlackUser, setup: string) => {
  const payload: PersistedAuthState = { ...user, status: 'callback', setup }
  await writeAuthState(user, payload)
}

export const extractSetupFromState = (state: string): string => {
  const { setup } = JSON.parse(state)
  return setup
}

export const verifyCallback = async (
  user: SlackUser,
  setup: string
): Promise<boolean> => {
  const state = await readAuthState(user)
  console.log(JSON.stringify(state))
  return (
    state &&
    state.status === 'callback' &&
    state.id === user.id &&
    state.team === user.team &&
    state.setup === setup
  )
}

export const prepareForUse = async (user: SlackUser, code: string) => {
  const client = createOAuthClient()
  const { tokens } = await client.getToken(code)
  const payload: PersistedAuthState = { ...user, status: 'done', tokens }
  await writeAuthState(user, payload)
}
