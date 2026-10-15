// Cloudflare Pages advanced mode: everything is served from the static files
// in this folder, except the routes handled below.

// Google OAuth (Google Calendar connection) must redirect to a domain we own
// for app verification; forward the callback to the Supabase function with
// the query string (code, state, error) intact.
const GOOGLE_AUTH_FUNCTION = 'https://mwqlisyiczrqhuiacdfj.supabase.co/functions/v1/google-auth';

export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        if (url.pathname === '/google/callback' || url.pathname === '/google/callback/') {
            return Response.redirect(GOOGLE_AUTH_FUNCTION + url.search, 302);
        }

        return env.ASSETS.fetch(request);
    },
};
