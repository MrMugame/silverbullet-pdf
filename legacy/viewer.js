const warning = `
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Error Message</title>
    <link id="stylesheet" rel="stylesheet" href="/.client/main.css"/>
    <style>
    body {
        margin: 0;
        height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: var(--root-background-color);
        font-family: monospace;
    }
    h1 {
        font-size: 1rem;
        font-weight: normal;
        font-family: sans-serif;
        max-width: 500px;
        text-align: center;
    }
    </style>
</head>
<body>
    <h1>silverbullet-pdf has been updated and relocated. Please include the plug from the following path <br> <code>ghr:MrMugame/silverbullet-pdf</code> <br> <a target="_parent" href="https://github.com/MrMugame/silverbullet-pdf">More info</a></h1>
</body>
</html>
`

export function viewer() {
    return {
        html: warning,
    }
}