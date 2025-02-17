import db from '../../../../lib/mongodb';

var mongodb = require('mongodb');

export default async function handler(req, res) {
	if (req.method !== 'POST') {
		return res.status(405).json({ statusCode: 405, message: `This request method is not valid on this route.` });
	}

	if (!mongodb.ObjectId.isValid(req.query.qid)) {
		return res.status(422).json({ statusCode: 422, message: `Please provide a valid quizz's object id.` });
	}

	const quizz = await db.collection('quizzs').findOne({ _id: new mongodb.ObjectId(req.query.qid) });
	if (quizz == null) {
		return res.status(422).json({ statusCode: 422, message: `Please provide a valid quizz's object id.` });
	}

	function isJsonString(str) {
		try {
			JSON.parse(str);
		} catch (e) {
			return req.body;
		}
		return JSON.parse(req.body);
	}

	const answers = isJsonString(req.body);
	var results = [];
	var score = 0;

	console.log(answers);

	quizz.questions.map((question, index) => {
		index += 1;
		if (answers[index.toString()] == undefined) {
			return results.push({
				questionTitle: question.questionTitle,
				answeredCorrectly: false,
				points: `-${question.minusPointsIfWrong}`,
				userAnswer: 'empty',
				correctAnswer: question.correctAnswer,
			});
		}
		switch (question.questionType) {
			case 'radios':
				if (answers[index.toString()] == null) {
					score = score - question.minusPointsIfWrong;
					return results.push({
						questionTitle: question.questionTitle,
						answeredCorrectly: false,
						points: `-${question.minusPointsIfWrong}`,
						userAnswer: answers[index.toString()],
						correctAnswer: question.correctAnswer,
					});
				}
				score = answers[index.toString()].toLowerCase() == question.correctAnswer.toLowerCase() ? score + question.pointsIfCorrect : score - question.minusPointsIfWrong;
				results.push({
					questionTitle: question.questionTitle,
					answeredCorrectly: answers[index.toString()].toLowerCase() == question.correctAnswer.toLowerCase() ? true : false,
					points: answers[index.toString()].toLowerCase() == question.correctAnswer.toLowerCase() ? `+${question.pointsIfCorrect}` : `-${question.minusPointsIfWrong}`,
					userAnswer: answers[index.toString()],
					correctAnswer: question.correctAnswer,
				});
				break;
			case 'checkboxes':
				if (answers[index.toString()] == false || answers[index.toString()].length == 0) {
					score = score - question.minusPointsIfWrong;
					return results.push({
						questionTitle: question.questionTitle,
						answeredCorrectly: false,
						points: `-${question.minusPointsIfWrong}`,
						userAnswer: answers[index.toString()],
						correctAnswer: question.correctAnswer,
					});
				}

				let sortedQuizzAnswers = question.correctAnswer.slice().sort();
				let sortedUserAnswers = answers[index.toString()].slice().sort();

				for (let i = 0; i < sortedQuizzAnswers.length; i++) {
					if (JSON.stringify(sortedQuizzAnswers[i].toLowerCase()) !== JSON.stringify(sortedUserAnswers[i].toLowerCase())) {
						score = score - question.minusPointsIfWrong;
						return results.push({
							questionTitle: question.questionTitle,
							answeredCorrectly: false,
							points: `-${question.minusPointsIfWrong}`,
							userAnswer: answers[index.toString()],
							correctAnswer: question.correctAnswer,
						});
					}
				}

				score = score + question.pointsIfCorrect;
				results.push({
					questionTitle: question.questionTitle,
					answeredCorrectly: true,
					points: `+${question.pointsIfCorrect}`,
					userAnswer: answers[index.toString()],
					correctAnswer: question.correctAnswer,
				});
				break;
			case 'textfield':
				score = question.correctAnswer.includes(answers[index.toString()].toLowerCase()) ? score + question.pointsIfCorrect : score - question.minusPointsIfWrong;
				results.push({
					questionTitle: question.questionTitle,
					answeredCorrectly: question.correctAnswer.includes(answers[index.toString()].toLowerCase()) ? true : false,
					points: question.correctAnswer.includes(answers[index.toString()].toLowerCase()) ? `+${question.pointsIfCorrect}` : `-${question.minusPointsIfWrong}`,
					userAnswer: answers[index.toString()],
					correctAnswer: question.correctAnswer,
				});
				break;
		}
	});

	let returnObject = {
		quizz: {
			id: quizz._id,
			title: quizz.quizzTitle,
			description: quizz.quizzDescription,
		},
		score,
		results,
	};

	db.collection('results').insertOne(returnObject);

	return res.status(200).json(returnObject);
}
