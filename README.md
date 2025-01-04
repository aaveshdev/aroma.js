# Aroma.js

Aroma.js is a lightweight, feature-rich, and developer-friendly web framework designed to build modern web applications with ease. It provides essential features like routing, middleware, session management, cookie handling, template rendering, static file serving, and more. With its simple API, it enables rapid development of web applications with flexibility.

### Website

For more information, visit the official website of Aroma.js: [https://aromajs.suasive.in](https://aromajs.suasive.in)


## Table of Contents

- [Features](#features)
- [Installation](#installation)
  - [NPM Installation](#npm-installation)
  - [GitHub Installation](#github-installation)
- [Basic Usage](#basic-usage)
- [API Documentation](#api-documentation)
  - [Routes](#routes)
  - [Middleware](#middleware)
  - [Sessions](#sessions)
  - [Cookies](#cookies)
  - [Static Files](#static-files)
  - [Template Engine](#template-engine)
  - [Error Handling](#error-handling)
- [Example](#example)
- [License](#license)

## Features

- **Routing:** Simple and flexible routing system.
- **Middleware:** Easily add custom logic between requests and responses.
- **Sessions:** Manage user sessions with customizable session IDs.
- **Cookies:** Parse and manage cookies with ease.
- **Static File Serving:** Serve static files such as HTML, CSS, JS, images, etc.
- **Template Engine:** Render dynamic content using custom templates.
- **Rate Limiting:** Add rate limiting to prevent abuse.
- **Logging:** Built-in logging support.
- **Error Handling:** Custom error handling for a better user experience.

## Installation

### NPM Installation

To install Aroma.js via npm, run the following command in your project directory:

```bash
npm install aroma.js
```

### GitHub Installation

Alternatively, you can clone the repository from GitHub:

```bash
git clone https://github.com/aaveshdev/aroma.js.git
```

Navigate to the aroma.js directory and install dependencies:

```bash
cd aroma.js
npm install
```

## Basic Usage

Here is a basic example to get started with Aroma.js:

``` javascript
import Aroma from 'aroma.js';

const app = new Aroma();

// Middleware example
app.use((req, res, next) => {
  console.log(`Request received: ${req.method} ${req.url}`);
  next();
});

// Simple route
app.get('/', (req, res) => {
  res.send({ message: 'Hello, world!' });
});

// Start server
app.listen(3000, () => {
  console.log('Aroma.js server running on http://localhost:3000');
});
```

## API Documentation

### Routes

Define HTTP methods for handling routes.

```javascript
app.get('/path', handler);   // GET request
app.post('/path', handler);  // POST request
app.put('/path', handler);   // PUT request
app.delete('/path', handler); // DELETE request
```

### Middleware

You can use custom middleware to process requests before they reach the route handlers.

```javascript
app.use((req, res, next) => {
  // Custom logic
  next();
});
```

### Sessions

Enable session management with cookies:

```javascript
app.useSessions();
```

Sessions are automatically handled, and session data is stored in memory.

### Cookies

Manage cookies:

```javascript
app.manageCookies(res, 'cookieName', 'cookieValue', { httpOnly: true, maxAge: 3600 });
```

### Template Engine

Enable the template engine to render dynamic views:

```javascript
app.enableTemplateEngine();
app.render(res, 'view', { data: 'value' });
```

### Error Handling

Handle errors with custom error handlers:

```javascript
app.handleErrors((err, req, res) => {
  res.writeHead(500, { 'Content-Type': 'text/plain' });
  res.end('Internal Server Error');
});
```

### Example

Here is an example of using Aroma.js to create a basic application with routes, middleware, and static file serving:

```javascript
import Aroma from 'aroma.js';

const app = new Aroma();

// Serve static files from 'public' directory
app.serveStatic('public');

// Middleware to log requests
app.use((req, res, next) => {
  console.log(`Received ${req.method} request to ${req.path}`);
  next();
});

// Simple route to handle GET requests to the root
app.get('/', (req, res) => {
  res.send({ message: 'Welcome to Aroma.js!' });
});

// Handle errors globally
app.handleErrors((err, req, res) => {
  console.error(err);
  res.writeHead(500, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Internal Server Error' }));
});

// Start the server
app.listen(3000, () => {
  console.log('Aroma.js server running at http://localhost:3000');
});
```

