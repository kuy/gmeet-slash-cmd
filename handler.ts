import { APIGatewayProxyHandler } from 'aws-lambda'
import 'source-map-support/register'
import * as slack from './slack'
import {
  readyToUse,
  prepareForCallback,
  generateAuthUrl,
  verifyCallback,
  prepareForUse,
  prepareForAuth,
  verifyAuth,
  extractSetupFromState,
  getAuthUser,
} from './auth'
import { createEvent } from './calendar'

export const create: APIGatewayProxyHandler = async (event) => {
  console.log(event.body)
  const user = slack.extractUser(event.body)
  if (await readyToUse(user)) {
    const url = await createEvent(await getAuthUser(user))
    const message = slack.createMessage(
      [`<${url}|Open Hangouts Meet>`, `Meeting URL: ${url}`],
      'everyone'
    )
    return {
      statusCode: 200,
      body: JSON.stringify(message),
    }
  } else {
    const setup = await prepareForAuth(user)
    const url = `https://homeet-slash-cmd.initial.inc/auth?id=${user.id}&team=${user.team}&setup=${setup}`
    const message = slack.createMessage([
      `Thank you for using *Google Hangouts Meet slash command* :tada:`,
      '*Usage:* Just run command `/meet` to get meeting URL.',
      'Before you start using this command, please give permission. Click the link below.',
      `<${url}|Allow to access Google Calendar>`,
    ])
    return {
      statusCode: 200,
      body: JSON.stringify(message),
    }
  }
}

export const auth: APIGatewayProxyHandler = async (event) => {
  console.log(JSON.stringify(event.queryStringParameters))
  const user = slack.createUser(event.queryStringParameters)
  const { setup } = event.queryStringParameters
  if (await verifyAuth(user, setup)) {
    const url = generateAuthUrl(user, setup)
    await prepareForCallback(user, setup)
    return {
      statusCode: 301,
      headers: {
        Location: url,
      },
      body: '',
    }
  } else {
    return {
      statusCode: 200,
      body: 'Failed to verify auth',
    }
  }
}

export const callback: APIGatewayProxyHandler = async (event) => {
  const { code, state } = event.queryStringParameters
  const user = slack.createUserFromState(state)
  const setup = extractSetupFromState(state)
  console.log(user, setup)
  if (await verifyCallback(user, setup)) {
    await prepareForUse(user, code)
    return {
      statusCode: 200,
      body: 'Done',
    }
  } else {
    return {
      statusCode: 200,
      body: 'Failed to verify callback',
    }
  }
}
