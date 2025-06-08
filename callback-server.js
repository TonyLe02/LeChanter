const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 8000;

app.use(cors());
app.use(express.static("public"));

app.get("/callback", (req, res) => {
  const { code, state, error } = req.query;

  console.log("Callback received:", {
    code: code ? "present" : "missing",
    state,
    error,
  });

  if (error) {
    console.error("OAuth error:", error);
    res.send(`
      <html>
        <body>
          <h1>Authentication Error</h1>
          <p>Error: ${error}</p>
          <script>
            setTimeout(() => window.close(), 3000);
          </script>
        </body>
      </html>
    `);
    return;
  }

  if (code && state) {
    console.log("Sending success response to popup...");
    // Send the code back to the main app
    res.send(`
      <html>
        <head>
          <title>Spotify Authentication</title>
        </head>
        <body>
          <h1>Authentication Successful!</h1>
          <p>Redirecting back to LeChant...</p>
          <script>
            console.log('Callback page loaded with code and state');
            try {
              // Post message to parent window (popup opener)
              if (window.opener && !window.opener.closed) {
                console.log('Found opener window, sending message...');
                window.opener.postMessage({
                  type: 'spotify_auth_success',
                  code: '${code}',
                  state: '${state}'
                }, '*');
                console.log('Message sent to parent window');
                setTimeout(() => window.close(), 1000);
              } else {
                console.log('No valid opener window found, redirecting...');
                // Fallback: redirect to main app with params
                window.location.href = 'http://localhost:5173/?code=${code}&state=${state}';
              }
            } catch (error) {
              console.error('Error communicating with parent:', error);
              window.location.href = 'http://localhost:5173/?code=${code}&state=${state}';
            }
          </script>
        </body>
      </html>
    `);
  } else {
    res.send(`
      <html>
        <body>
          <h1>Authentication Failed</h1>
          <p>Missing authorization code.</p>
          <script>
            setTimeout(() => window.close(), 3000);
          </script>
        </body>
      </html>
    `);
  }
});

app.listen(PORT, "127.0.0.1", () => {
  console.log(`Callback server running on http://127.0.0.1:${PORT}`);
});
