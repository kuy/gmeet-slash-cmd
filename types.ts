export type SlackUser = {
  team: string
  id: string
}

export type MessageBlock = {
  type: 'section'
  text: {
    type: 'mrkdwn'
    text: string
  }
}

export type SlackMessage = {
  blocks: MessageBlock[]
}

export type QueryParams = { [name: string]: any }

type CommonAuthState = {
  id: string
  team: string
}

export type WaitingCallback = CommonAuthState & {
  status: 'callback'
}

export type HasToken = CommonAuthState & {
  status: 'done'
  tokens: any
}

export type PersistedAuthState = WaitingCallback | HasToken
