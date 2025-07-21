export default class Aroma {
    routes: any[];
    middlewares: any[];
    errorHandlers: any[];
    settings: {};
    set(setting: any, value: any): void;
    get(setting: any): any;
    get(path: any, handler: any): void;
    use(...args: any): void;
    route(method: any, path: any, handler: any): void;
    post(path: any, handler: any): void;
    put(path: any, handler: any): void;
    delete(path: any, handler: any): void;
    all(path: any, handler: any): void;
    serveStatic(staticPath: any): void;
    enableTemplateEngine(engine: any): void;
    useSessions(): void;
    useCookies(): void;
    manageCookies(res: any, name: any, value: any, options?: {}): void;
    parseBody(): void;
    rateLimiter(options: any): void;
    logger(): void;
    render(res: any, view: any, data: any): void;
    handleErrors(handler: any): void;
    listen(port: any, callback: any): void;
}

export class Router {
    routes: any[];
    middlewares: any[];
    use(path: any, middleware: any): void;
    route(method: any, path: any, handler: any): void;
    get(path: any, handler: any): void;
    post(path: any, handler: any): void;
    put(path: any, handler: any): void;
    delete(path: any, handler: any): void;
    all(path: any, handler: any): void;
}


exports.Router = { Router};

