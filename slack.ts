import * as qs from 'query-string'
import {
  SlackUser,
  MessageBlock,
  SlackMessage,
  QueryParams,
  ResponseType,
} from './types'

export const createUser = (params: QueryParams): SlackUser => {
  const { id, team } = params
  return { id, team }
}

export const createUserFromState = (state: string): SlackUser => {
  const { id, team } = JSON.parse(state)
  return createUser({ id, team })
}

export const extractUser = (payload: string): SlackUser => {
  const data: any = qs.parse(payload)
  return {
    id: data.user_id,
    team: data.team_id,
  }
}

type Scope = 'everyone' | 'me'

const convertToResponseType = (scope: Scope): ResponseType => {
  switch (scope) {
    case 'everyone':
      return 'in_channel'
    case 'me':
      return 'ephemeral'
  }
  throw new Error(`Unsupported scope: ${scope}`)
}

const createBlock = (markdown: string): MessageBlock => {
  return {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: markdown,
    },
  }
}

export const createMessage = (
  markdown: string | string[],
  scope: Scope = 'me'
): SlackMessage => {
  if (typeof markdown === 'string') {
    markdown = [markdown]
  }
  return {
    blocks: markdown.map(createBlock),
    response_type: convertToResponseType(scope),
  }
}
