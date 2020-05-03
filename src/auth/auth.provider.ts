/* eslint-disable @typescript-eslint/camelcase */
import * as fs from 'fs';
import { OAuth2Client } from 'google-auth-library';
import * as readline from 'readline';

const credentials = JSON.parse(
  fs.readFileSync('./config/credentials.json', 'utf8'),
);

const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
const TOKEN_PATH = './config/token.json';

const getToken = async (oAuth2Client: OAuth2Client) => {
  if (fs.existsSync(TOKEN_PATH)) {
    return JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
  } else {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    });

    console.log('Authorize this app by visiting this url:', authUrl);

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const code = await new Promise<string>((resolve) =>
      rl.question('Enter the code from that page here: ', resolve),
    );
    rl.close();

    const result = await oAuth2Client.getToken(code);
    const token = result.tokens;
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
    return token;
  }
};

const createOAuth2Client = async (credentials) => {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new OAuth2Client(
    client_id,
    client_secret,
    redirect_uris && redirect_uris[0],
  );

  const token = await getToken(oAuth2Client);

  oAuth2Client.setCredentials(token);
  oAuth2Client.on('tokens', () => {
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(oAuth2Client.credentials));
  });
  return oAuth2Client;
};

export const authProvider = {
  provide: OAuth2Client,
  useFactory: async () => await createOAuth2Client(credentials),
};
