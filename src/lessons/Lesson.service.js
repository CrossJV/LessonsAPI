import { LessonsRepository } from './Lesson.repository.js'

export class LessonService {
    repository
    constructor()
    {
        this.repository = new LessonsRepository();
    }

	async createLessons(data) {
		const creaytedLessons = await this.repository.create(data);

		return creaytedLessons;
	}

	async getLessons(params) {
		const existedLessons = await this.repository.find(params);

		return existedLessons;
	}
}