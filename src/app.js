import express from 'express';
import bodyParser from 'body-parser';
import { LessonController } from '../src/lessons/LessonController.js';

export class App {
    app;
    port;
    lessons;
    DB

    constructor()
    {
        this.app = express();
        this.port = 8000;
        this.lessons = new LessonController();
    }

    useMiddleware() {
      this.app.use(bodyParser.json());
    }

    useRoutes() {
      this.app.use('/', this.lessons.router);
    }

      async init() {
      this.useMiddleware();
      this.useRoutes();
      this.server = this.app.listen(this.port);
      console.log('SERVER RUNING ON PORT ' + this.port);
    }
}
