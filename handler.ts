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
} from './auth'

export const create: APIGatewayProxyHandler = async (event) => {
  console.log(event.body)

  const user = slack.extractUser(event.body)
  console.log(JSON.stringify(user))

  if (await readyToUse(user)) {
    const url = 'https://meet.google.com'
    return {
      statusCode: 200,
      body: JSON.stringify(slack.createMessage(`<${url}|Start Hangouts Meet>`)),
    }
  } else {
    const setup = await prepareForAuth(user)
    const url = `https://homeet-slash-cmd.initial.inc/auth?id=${user.id}&team=${user.team}&setup=${setup}`
    return {
      statusCode: 200,
      body: JSON.stringify(
        slack.createMessage(`<${url}|Allow to use Google Calendar>`)
      ),
    }
  }
}

export const auth: APIGatewayProxyHandler = async (event) => {
  console.log(JSON.stringify(event.queryStringParameters))
  const user = slack.createUser(event.queryStringParameters)
  const { setup } = event.queryStringParameters

  if (await verifyAuth(user, setup)) {
    const url = generateAuthUrl(user, setup)
    console.log(url)
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
  console.log(JSON.stringify(event, null, 2))
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
