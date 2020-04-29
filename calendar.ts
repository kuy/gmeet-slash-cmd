import { google } from 'googleapis'
import { v4 as uuidv4 } from 'uuid'
import { createOAuthClient } from './auth'
import { AuthUser } from './types'

export const createEvent = async (user: AuthUser): Promise<string> => {
  console.log(user)
  const client = createOAuthClient(user.tokens)
  const calendar = google.calendar({ version: 'v3', auth: client })
  try {
    const res = await calendar.events.insert({
      calendarId: 'primary',
      conferenceDataVersion: 1,
      requestBody: {
        summary: 'MTG',
        description: 'Created from Slack',
        start: { dateTime: '2020-04-29T10:00:00+0900' },
        end: { dateTime: '2020-04-29T10:30:00+0900' },
        conferenceData: {
          createRequest: {
            requestId: uuidv4(),
          },
        },
      },
    })
    console.log(res.data)
    return res.data.hangoutLink
  } catch (e) {
    console.error(`Failed to insert an event to Google Calendar.`, e)
    return ''
  }
}
