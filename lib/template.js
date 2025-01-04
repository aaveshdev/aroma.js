const fs = require('fs');
const path = require('path');

function enableTemplateEngine(app) {
    app.templateEngine = (view, data) => {
        const templatePath = path.join(process.cwd(), 'views', `${view}.html`);
        let template = fs.readFileSync(templatePath, 'utf8');

        for (const key in data) {
            const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
            template = template.replace(regex, data[key]);
        }

        return template;
    };
}

function render(app, res, view, data) {
    if (!app.templateEngine) {
        throw new Error('Template engine not enabled. Use enableTemplateEngine().');
    }
    const rendered = app.templateEngine(view, data);
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(rendered);
}

module.exports = { enableTemplateEngine, render };
