import * as AWS from 'aws-sdk'

const BUCKET_NAME = 'uzabase-slack-homeet'

const s3 = new AWS.S3({ region: 'ap-northeast-1' })

export const write = async (key: string, data: string): Promise<boolean> => {
  try {
    await s3.putObject({ Bucket: BUCKET_NAME, Key: key, Body: data }).promise()
    return true
  } catch (e) {
    return false
  }
}

export const read = async (key: string): Promise<AWS.S3.Body | null> => {
  try {
    const data = await s3.getObject({ Bucket: BUCKET_NAME, Key: key }).promise()
    return data.Body
  } catch (e) {
    return null
  }
}
