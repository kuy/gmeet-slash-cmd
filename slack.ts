import * as qs from 'query-string'
import { SlackUser, SlackMessage, QueryParams } from './types'

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

export const createMessage = (markdown: string): SlackMessage => {
  return {
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: markdown,
        },
      },
    ],
  }
}
