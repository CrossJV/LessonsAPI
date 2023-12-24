import { db } from "../database/pgdb.js";
import { dateToYMD, isValidDate, dateDelta} from "../common/utils.js";

export class LessonsRepository {

	async create(data) {
		let retIds = [];

		for(let key in data)
		{
			let lesson = data[key];
			let days = [];

			if(!Array.isArray(lesson.teachersIds))
			{
				return {"success": false, "error": 'teachersIds MUST TO BE ARRAY TYPE'}
			}
			if(!Array.isArray(lesson.days))
			{
				return {"success": false, "error": 'days MUST TO BE ARRAY TYPE'}
			}
			if (!(typeof lesson.title === 'string'))
			{
				return {"success": false, "error": 'title MUST TO BE STRING TYPE'}
			}

			let startDate = lesson.firstDate
			let lessonsDays = lesson.days

			for (let d of lessonsDays)
			{
				if(!(typeof Number(d) === 'number'))
				{
					return {"success": false, "error": 'lessonsDays VALUES INVALID TYPE'}
				}
				if(Number(d) < 0 || Number(d) > 6)
				{
					return {"success": false, "error": 'lessonsDays VALUES OUT OF RANGE'}
				}
			}
			let lessonDate = '';

			if(lesson.lessonsCount && lesson.lastDate)
			{
				return {"success": false, "error": 'NEED TO SET ONLY ONE PARAM lessonsCount OR lastDate'}
			}

			if(lesson.lessonsCount)
			{
				if (!(typeof lesson.lessonsCount === 'number'))
				{
					return {"success": false, "error": 'lessonsCount MUST TO BE NUMBER TYPE'}
				}

				for(let i = 0; i < lesson.lessonsCount; i++)
				{
					lessonDate === '' ? lessonDate = dateDelta(startDate, lessonsDays[0]) : lessonDate = dateDelta(days[days.length - 1], lessonsDays[0])
					days.push(lessonDate)
					let done = lessonsDays.shift()
					lessonsDays.push(done)
				}
			} else if(lesson.lastDate)
			{
				let lastDate = new Date(lesson.lastDate)

				if(!(isValidDate(lastDate)))
				{
					return {"success": false, "error": 'lastDate INVALID DATE VALUE'}
				}

				while(true)
				{
					lessonDate === '' ? lessonDate = dateDelta(startDate, lessonsDays[0]) : lessonDate = dateDelta(days[days.length - 1], lessonsDays[0])

					if(lastDate.getTime() <= lessonDate.getTime())
					{
						break;
					}
					days.push(lessonDate)
					let done = lessonsDays.shift()
					lessonsDays.push(done)
				}
			} else 
			{
				return {"success": false, "error": 'NEED TO SEND lastDate OR lessonsCount PARAMETRS'}
			}
			
			for(const [key, day] of Object.entries(days))
			{
				let formatedDate = dateToYMD(day)

				let finish = new Date(startDate);

				let Difference_In_Time = day.getTime() - finish.getTime();
 
				let Difference_In_Days = Math.round(Difference_In_Time / (1000 * 3600 * 24));

				if(Difference_In_Days >= 365)
				{
					break;
				}

				if(key > 299)
				{
					break;
				}
				
				let res = await db.query(`INSERT INTO lessons (date, title, status)
									VALUES ('${formatedDate}', '${lesson.title}', 0) RETURNING id`)

				if(res)
				{
					lesson.teachersIds.forEach(async (teacher) => {
						await db.query(`INSERT INTO lesson_teachers (lesson_id, teacher_id)
								VALUES (${res[0].id}, ${teacher})`)
					})
					retIds.push(res[0].id)
				}
			}
		}

		return {"success": true, "data": retIds}
	}

	async find(params) {
		let where = '';
		let having = '';
		let limit = 5;
		let offset = (1 - 1) * limit;

		if(Object.keys(params).length > 0)
		{
			where = 'WHERE';

			for(let param in params)
			{
				let item = params[param]

				switch(param)
				{
					case 'date':
						let dates = item.split(',')

						if(dates.length == 1)
						{
							let date = new Date(dates[0])
							if(!(isValidDate(date)))
							{
								return {"success": false, "error": 'INVALID DATE VALUE'}
							}
							let formatedDate = dateToYMD(date)
							
							where += ` date='${formatedDate}' AND`
						}
						
						if(dates.length > 1)
						{
							let firstDate = new Date(dates[0])
							let secondDate = new Date(dates[1])

							if(!(isValidDate(firstDate)) || !(isValidDate(secondDate)))
							{
								return {"success": false, "error": 'INVALID DATE VALUE'}
							}

							if(secondDate.getTime() < firstDate.getTime())
							{
								firstDate = new Date(dates[1])
								secondDate = new Date(dates[0])
							}
							
							let formatedFirstDate = dateToYMD(firstDate)
							let formatedSecondDate = dateToYMD(secondDate)
							
							where += ` date BETWEEN '${formatedFirstDate}' AND '${formatedSecondDate}' AND`
						}
						
						break;
					case 'status':
						if(item == '1' || item == '0')
						{
							where += ` status=${item} AND`
						} else 
						{
							return {"success": false, "error": 'INVALID STATUS VALUE'}
						}
						break;
					case 'teachersIds':
						let teachers_ids = item.split(',')

						if(teachers_ids.length == 1)
						{
							if(isNaN(Number(teachers_ids[0])))
							{
								return {"success": false, "error": 'INVALID teachersIds PARAM VALUE'}
							}

						} else
						{
							for (const value of teachers_ids)
							{
								if(isNaN(Number(value)))
								{
									return {"success": false, "error": 'INVALID teachersIds PARAM VALUE'}
								}
							}
						}

						where += ` t.id IN(${item}) AND`
						break;
					case 'studentsCount':
						let studentsRange = item.split(',')

						if(studentsRange.length == 1)
						{
							if(isNaN(Number(studentsRange[0])))
							{
								return {"success": false, "error": 'INVALID STUDENT_COUNT PARAM VALUE'}
							}

							having = `HAVING COUNT(DISTINCT s.id) = ${studentsRange[0]}`
						} else 
						{
							let firstRange = studentsRange[0]
							let secondRange = studentsRange[1]
							if(isNaN(Number(firstRange)) || isNaN(Number(secondRange)))
							{
								return {"success": false, "error": 'INVALID STUDENT_COUNT PARAM VALUE'}
							}
							if(Number(firstRange) > Number(secondRange))
							{
								firstRange = studentsRange[1]
								secondRange = studentsRange[0]
							}

							having = `HAVING COUNT(DISTINCT s.id) BETWEEN ${firstRange} AND ${secondRange}`
						}
						break;
					case 'page':
						if(item > 0)
						{
							offset = (item - 1) * limit
						} else 
						{
							return {"success": false, "error": 'INVALID PAGE NUMBER'}
						}
						break;
					case 'lessonsPerPage':
						if(item > 0)
						{
							limit = item
						} else 
						{
							return {"success": false, "error": 'INVALID LESSONS COUNT PER PAGE VALUE'}
						}
						break;
					default :
						return {"success": false, "error": 'INVALID PARAM'}
						break;
				}
			}
		}

		let formatWhere = where == 'WHERE' ? '' : where.substring(0, where.length -3);

		let res = await db.query(`SELECT 
									l.id, 
									l.date, 
									l.title, 
									l.status, 
									count(DISTINCT ls.student_id) FILTER (WHERE ls.visit = 't') AS visitCount, 
									JSON_AGG(DISTINCT jsonb_build_object('id',s.id,'name', s.name,'visit', ls.visit)) AS students,
									JSON_AGG(DISTINCT jsonb_build_object('id',t.id,'name', t.name)) AS teachers
								FROM lessons l
								LEFT JOIN lesson_students ls ON ls.lesson_id = l.id
								LEFT JOIN students s ON s.id = ls.student_id
								LEFT JOIN lesson_teachers lt ON lt.lesson_id = l.id
								LEFT JOIN teachers t ON t.id = lt.teacher_id
								${formatWhere}
								GROUP BY l.date, l.title, l.status, l.id
								${having}
								ORDER BY l.id
								LIMIT ${limit}
								OFFSET ${offset}`)

		return {"success": true, "data": res}
	}
}