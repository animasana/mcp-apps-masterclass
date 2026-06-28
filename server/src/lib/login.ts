export function renderLoginPage(oauthQueryString: string, clientName: string) {
	const html = `<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Login — Ecommerce</title>
        <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
                font-family: system-ui, -apple-system, sans-serif;
                background: #0a0a0a;
                color: #f5f5f5;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
            }
            .card {
                background: #1a1a1a;
                border: 1px solid rgba(255,255,255,0.1);
                border-radius: 16px;
                padding: 40px;
                width: 100%;
                max-width: 400px;
            }
            h1 {
                font-size: 24px;
                margin-bottom: 8px;
            }
            p.subtitle {
                color: rgba(255,255,255,0.5);
                font-size: 14px;
                margin-bottom: 24px;
            }
            label {
                display: block;
                font-size: 14px;
                font-weight: 500;
                margin-bottom: 6px;
                color: rgba(255,255,255,0.7);
            }
                input {
                width: 100%;
                padding: 10px 14px;
                border-radius: 8px;
                border: 1px solid rgba(255,255,255,0.15);
                background: #111;
                color: #f5f5f5;
                font-size: 14px;
                margin-bottom: 16px;
                outline: none;
            }
            input:focus { border-color: #10b981; }
            button {
                width: 100%;
                padding: 12px;
                border: none;
                border-radius: 9999px;
                background: #f5f5f5;
                color: #0d0d0d;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                margin-top: 8px;
            }
            button:hover { background: #e5e5e5; }
        </style>
    </head>
    <body>
        <div class="card">
            <h1>Sign in</h1>
            <p class="subtitle">
                <strong>${clientName}</strong> wants access to your account. Enter any email and password to continue.
            </p>
            <form method="POST" action="/authorize?${oauthQueryString}">
                <label for="email">Email</label>
                <input id="email" name="email" type="email" placeholder="you@example.com" required />
                <label for="password">Password</label>
                <input id="password" name="password" type="password" placeholder="••••••••" required />
                <button type="submit">Continue</button>
            </form>
        </div>
    </body>
</html>`;
	return new Response(html, {
		headers: { 'Content-Type': 'text/html' },
	});
}
