import { APIGatewayProxyHandler } from 'aws-lambda'
import 'source-map-support/register'
import * as slack from './slack'
import {
  readyToUse,
  prepareForCallback,
  generateAuthUrl,
  verifyCallback,
  storeAccessToken,
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
    // TODO: Should remember this process for security?
    const url = `https://homeet-slash-cmd.initial.inc/auth?id=${user.id}&team=${user.team}`
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

  const url = generateAuthUrl(user)
  console.log(url)

  await prepareForCallback(user)

  return {
    statusCode: 301,
    headers: {
      Location: url,
    },
    body: '',
  }
}

export const callback: APIGatewayProxyHandler = async (event) => {
  console.log(JSON.stringify(event, null, 2))
  const { code, state } = event.queryStringParameters
  const user = slack.createUserFromQueryString(state)
  if (await verifyCallback(user)) {
    await storeAccessToken(user, code)
    return {
      statusCode: 200,
      body: 'Done',
    }
  } else {
    return {
      statusCode: 200,
      body: 'Failed to verify callback.',
    }
  }
}
