import * as qs from 'query-string'
import * as https from 'https'
import * as url from 'url'
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

export const extractResponseUrl = (payload: string): string => {
  const { response_url }: any = qs.parse(payload)
  return response_url
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

export const replaceMessage = (resUrl: string, text: string) => {
  const data = JSON.stringify({
    response_type: 'in_channel',
    replace_original: true,
    text,
  })

  const parsedUrl = url.parse(resUrl)
  const options = {
    hostname: parsedUrl.hostname,
    port: 443,
    path: parsedUrl.path,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length,
    },
  }

  const req = https.request(options, (res) => {
    console.log(`statusCode: ${res.statusCode}`)
    let buf = ''
    res.on('data', (d) => {
      buf += d.toString()
    })
    res.on('end', () => {
      console.log(buf)
    })
  })

  req.on('error', (error) => {
    console.error(error)
  })

  req.write(data)
  req.end()
}
