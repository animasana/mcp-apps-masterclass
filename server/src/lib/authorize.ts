import { renderLoginPage } from './login';

export async function handleAuthorizeGet(request: Request, env: Env) {
	const url = new URL(request.url);
	const clientId = url.searchParams.get('client_id');
	if (!clientId) {
		return new Response(null, { status: 400 });
	}
	const client = await env.OAUTH_PROVIDER.lookupClient(clientId);

	return renderLoginPage(url.searchParams.toString(), client?.clientName ?? 'AI');
}

export async function handleAuthorizePost(request: Request, env: Env) {
	const url = new URL(request.url);

	const formData = await request.formData();

	const email = formData.get('email') as string;

	if (!email) {
		return new Response('Email is required', { status: 400 });
	}

	const oauthRequest = await env.OAUTH_PROVIDER.parseAuthRequest(new Request(url.toString()));

	const { redirectTo } = await env.OAUTH_PROVIDER.completeAuthorization({
		request: oauthRequest,
		userId: email,
		metadata: { potato: email },
		scope: oauthRequest.scope,
		props: { email },
	});

	return Response.redirect(redirectTo, 302);
}
