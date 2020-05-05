## Slack integration for [Google Meet](https://meet.google.com/)

Provides a slash command `/meet` to get & share meeting URL of [Google Meet](https://meet.google.com/) quickly on Slack.

## Install

*This integration is not listed on [Slack App Directory](https://slack.com/apps) yet.*

Please wait for verification or setup it as your own custom app.

## Setup (for developers)

**Work in Progress**

### Requirements

- Domain name, which managed by you
- [Node.js](https://nodejs.org) 14.x
- [Serverless Framework CLI](https://www.serverless.com/framework/docs/getting-started/)
- [Amazon Web Service](https://aws.amazon.com/console) account (key and secret)
  - Uses Lambda, API Gateway, and Route 53
- [Google API project](https://console.developers.google.com/apis/dashboard)

### Overview

1. Choose domain name
2. Setup Google API project
3. Create Slack app
4. Deploy to AWS
5. Install app to organization

#### Domain name

Choose domain name which is used for accepting request from Slack and callback from Google OAuth. In this tutorial, use `https://gmeet.example.com` for example.

#### Google API project

Create a new project from [Google API Console](https://console.developers.google.com/apis/dashboard) and enable Calendar API.

To get OAuth credentials, `Credentials > Create Credentials > OAuth client ID`.
Application type is **Web Application**, Authorized redirect URL is `https://gmeet.example.com/callback`. Note down **Client ID** and **Client Secret** for later steps.

Don't forget to setup [OAuth consent screen](https://console.developers.google.com/apis/credentials/consent) and add `example.com` to [Authorized domains](https://support.google.com/cloud/answer/6158849?hl=en#authorized-domains).

#### Slack app

[Create a Slack app](https://api.slack.com/apps) with a slash command `/meet`. The request URL is `https://gmeet.example.com/create`.

#### Deploy to AWS

Before deploying to AWS, create `config.json` on the root directory (copy and rename `config.json.example`).
`clientId` and `clientSecret` are credentials of Google API project you created.
`redirectUrl` is url of OAuth callback, e.g. `https://gmeet.example.com/callback`.
`profile` is profile name of your local configuration for AWS CLI.

Let's deploy. `sls deploy`

You may need to associate your domain `https://gmeet.example.com` and an endpoint of API Gateway.

#### Install app

A slash command `/meet` will be enabled by installing app. Browse [your apps](https://api.slack.com/apps) and install it to your organization.

## License

MIT

## Author

Yuki Kodama / [@kuy](https://twitter.com/kuy)
