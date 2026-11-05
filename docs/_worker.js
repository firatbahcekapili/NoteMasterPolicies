// Cloudflare Pages advanced mode: everything is served from the static files
// in this folder, except the routes handled below.

// Google OAuth (Google Calendar connection) must redirect to a domain we own
// for app verification; forward the callback to the Supabase function with
// the query string (code, state, error) intact.
const GOOGLE_AUTH_FUNCTION = 'https://mwqlisyiczrqhuiacdfj.supabase.co/functions/v1/google-auth';
// The redirect URI registered with Google is on the app's domain only.
const GOOGLE_CALLBACK_HOST = 'notemaster.fcodetr.com';

// App Store link: Turkish visitors go to the Turkey storefront, everyone else
// to the US one. Cloudflare's country wins; Accept-Language is the fallback.
const APP_STORE_ID = 'id6823328342';

function appStoreRedirect(request) {
    const country = request.cf && request.cf.country;
    let storefront = 'us';
    if (country) {
        if (country === 'TR') storefront = 'tr';
    } else if (/^\s*tr(-|;|,|\s|$)/i.test(request.headers.get('Accept-Language') || '')) {
        storefront = 'tr';
    }
    // The target depends on the visitor, so it must not be cached for others.
    return new Response(null, {
        status: 302,
        headers: {
            Location: 'https://apps.apple.com/' + storefront + '/app/' + APP_STORE_ID,
            'Cache-Control': 'private, no-store',
            Vary: 'Accept-Language',
        },
    });
}

export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        if (url.hostname === GOOGLE_CALLBACK_HOST && (url.pathname === '/google/callback' || url.pathname === '/google/callback/')) {
            return Response.redirect(GOOGLE_AUTH_FUNCTION + url.search, 302);
        }

        if (url.pathname === '/app-store' || url.pathname === '/app-store/') {
            return appStoreRedirect(request);
        }

        return env.ASSETS.fetch(request);
    },
};
