#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const [,, cmd, appName] = process.argv;

if (cmd === 'create' && appName) {
    const appPath = path.join(process.cwd(), appName);
    if (fs.existsSync(appPath)) {
        console.error('❌ Folder already exists');
        process.exit(1);
    }

    fs.mkdirSync(appPath);

    fs.writeFileSync(path.join(appPath, 'package.json'), JSON.stringify({
        name: appName,
        version: "1.0.0",
        main: "index.js",
        scripts: { start: "node index.js" }
    }, null, 2));

    fs.writeFileSync(path.join(appPath, 'index.js'), `
// Aroma.js starter app
const Aroma = require('aroma.js');
const app = new Aroma();

app.get('/', (req, res) => {
    res.send('Hello from Aroma.js');
});

app.listen(3000, () => console.log('🚀 Server running on http://localhost:3000'));
    `.trim());


    console.log(`✅ Project "${appName}" created!`);
    console.log(`👉 Run:\n  cd ${appName}\n  npm install aroma.js\n  npm start`);
} else {
    console.log(`
Usage:
  aroma create <project-name>   Scaffold a new Aroma.js app
    `);
}
