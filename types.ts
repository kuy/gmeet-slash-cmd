export type SlackUser = {
  team: string
  id: string
}

export type AuthUser = SlackUser & {
  tokens: any
}

export type MessageBlock = {
  type: 'section'
  text: {
    type: 'mrkdwn'
    text: string
  }
}

export type ResponseType = 'in_channel' | 'ephemeral'

export type SlackMessage = {
  blocks: MessageBlock[]
  response_type: ResponseType
}

export type QueryParams = { [name: string]: any }

type CommonAuthState = {
  id: string
  team: string
}

export type BeforeAuth = CommonAuthState & {
  status: 'auth'
  setup: string
}

export type BeforeCallback = CommonAuthState & {
  status: 'callback'
  setup: string
}

export type HasToken = CommonAuthState & {
  status: 'done'
  tokens: any
}

export type PersistedAuthState = BeforeAuth | BeforeCallback | HasToken
