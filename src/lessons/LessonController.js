import { BaseController } from '../common/BaseController.js';
import { LessonService } from '../lessons/Lesson.service.js';


export class LessonController extends BaseController {
	service;
	lessonRoutes = [
		{
			path: '/',
			func: this.getRecords,
			method: 'get',
		},
		{
			path: '/lessons',
			func: this.addRecords,
			method: 'post',
		},
	];

	constructor() {
		super()
		super.bindRoutes(this.lessonRoutes);
		this.service = new LessonService();
	}

	async getRecords(req, res, next) {
		const result = await this.service.getLessons(req.query);

		if (!result) {
			return next('Error');
		}
		res.type('application/json');
		if(result.success == false)
		{
			return res.status(400).send(result.error)
		}
		return res.json(result);
	}

	async addRecords(req, res, next) {
		const result = await this.service.createLessons(req.body);

		if (!result) {
			return next('Error');
		}
		res.type('application/json');
		if(result.success == false)
		{
			return res.status(400).send(result.error)
		}
		return res.json(result);
	}
}