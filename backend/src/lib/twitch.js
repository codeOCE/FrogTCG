const axios = require('axios')
const qs = require('querystring')

const TWITCH_AUTH_URL = "https://id.twitch.tv/oauth2/authorize"
const TWITCH_TOKEN_URL = "https://id.twitch.tv/oauth2/token"
const TWITCH_USER_URL = "https://api.twitch.tv/helix/users"

function twitchAuthUrl() {
  const params = qs.stringify({
    client_id: process.env.TWITCH_CLIENT_ID,
    redirect_uri: process.env.TWITCH_REDIRECT_URI,
    response_type: 'code',
    scope: 'user:read:email'
  })

  return `${TWITCH_AUTH_URL}?${params}`
}

async function exchangeCodeForToken(code) {
  const params = {
    client_id: process.env.TWITCH_CLIENT_ID,
    client_secret: process.env.TWITCH_CLIENT_SECRET,
    code,
    grant_type: 'authorization_code',
    redirect_uri: process.env.TWITCH_REDIRECT_URI,
  }

  const res = await axios.post(TWITCH_TOKEN_URL, null, { params })
  return res.data
}

async function getTwitchUser(accessToken) {
  const res = await axios.get(TWITCH_USER_URL, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Client-Id': process.env.TWITCH_CLIENT_ID
    }
  })

  return res.data.data[0]
}

module.exports = {
  twitchAuthUrl,
  exchangeCodeForToken,
  getTwitchUser
}
