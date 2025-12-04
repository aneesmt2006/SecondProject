// import { OAuth2Client } from "google-auth-library";
import { config } from "../config/env.config.js";

// export const oAuth2Client = new OAuth2Client({
//     client_id:config.goole_client_id as string,
//     client_secret:config.google_secret_id as string,

// })

import { google } from "googleapis";

const GOOGLE_CLIENT_ID = config.goole_client_id
const GOOGLE_CLIENT_SECRET=config.google_secret_id

export const oauth2Client = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    'postmessage'
);
