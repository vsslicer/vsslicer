// SPDX-License-Identifier: AGPL-3.0-or-later
// Pure HTML builder for the sample webview: CSP allows only scripts carrying the nonce and the webview's own origin.
export const webviewHtml = (cspSource: string, scriptUri: string, nonce: string): string => `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${cspSource}; script-src 'nonce-${nonce}';">
<title>VSSlicer sample webview</title>
</head>
<body>
<script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
