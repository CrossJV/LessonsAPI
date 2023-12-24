import { Router } from 'express';

export class BaseController {
	_router;

	constructor() {
		this._router = Router();
	}

	get router() {
		return this._router;
	}

	bindRoutes(routes) {
		for (const route of routes) {
			const middleware = route.middlewares?.map((m) => m.execute.bind(m));
			const handler = route.func.bind(this);
			const pipeline = middleware ? [...middleware, handler] : handler;
			this.router[route.method](route.path, pipeline);
		}
	}
}