import {OAuth2Client} from 'google-auth-library';
import dotenv from 'dotenv';

dotenv.config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
export const verifyGoogleToken = async(idToken) => {
    try{
        const ticket = await client.verifyIdToken({
            idToken: idToken,
            audience: process.env.GOOGLE_CLIENT_ID
        })

        const payload = ticket.getPayload();

        return {
            email: payload.email,
            firstName: payload.given_name,
            lastName: payload.family_name,
            picture: payload.picture,
            emailVerified: payload.email_verified
        };
    }catch(error){
        console.error('Error verifying Google ID token:', error);
        throw new Error('Invalid Google ID token');
    }
}