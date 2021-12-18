const express = require("express")
const bp = require("body-parser")
const { check, validationResult } = require('express-validator')
const daosql = require("./dao-sql")

const app = express()
const port = 3000

app.use(bp.urlencoded({ extended: false }))
app.set('view engine', 'ejs')

app.listen(port, () => {
	console.log("Listening on port " + port)
})

app.get('/', (req, res) => {
	res.render("index")
})

app.get('/listModules', (req, res) => {
	daosql.getModules()
		.then((result) => {
			res.render("modules", { modules: result })
		})
		.catch((error) => {
			res.send(error)
		})
})

app.get('/listStudents', (req, res) => {
	daosql.getStudents()
		.then((result) => {
			res.render("students", { students: result })
		})
		.catch((error) => {
			res.send(error)
		})
})

app.get('/students/delete/:sid', (req, res) => {
	daosql.deleteStudent(req.params.sid)
		.then((result) => {
			res.redirect('/listStudents')
		})
		.catch((error) => {
			if (error.errno == 1451) {
				res.render("error", { student: req.params.sid, message: "has associated modules and cannot be deleted." })
			} else {
				res.send(`Unknown error occurred while attempting to delete student ${req.params.sid}.`)
			}
		})
})

app.get('/module/students/:mid', (req, res) => {
	daosql.getStudentsFromModule(req.params.mid)
		.then((result) => {
			res.render("studentsModule", { students: result, mid: req.params.mid })
		})
		.catch((error) => {
			res.send(error)
		})
})

app.get('/modules/:mid', (req, res) => {
	daosql.getModule(req.params.mid)
		.then((result) => {
			if (result.length > 0) {
				res.render("editmodule", { mid: result[0].mid, name: result[0].name, credits: result[0].credits, errors: undefined })
				console.log(result);
			} else {
				res.send(`<h3>No student with ID of ${req.params.mid}</h3>`)
			}
		})
		.catch((error) => {
			res.send(error)
		})
})

app.post('/modules/:mid',
	[
		check('name').isLength({ min: 5 }).withMessage("Module name should be a minimum of 5 characters."),
		check('credits').isIn([5, 10, 15]).withMessage("Credits must be 5, 10 or 15.")
	],
	(req, res) => {
		var error = validationResult(req);
		if (error.isEmpty()) {
			daosql.setModule(req.params.mid, req.body.name, req.body.credits)
				.then((result) => {
					console.log(result)
					res.render("editmodule", { mid: req.params.mid, name: req.body.name, credits: req.body.credits, errors: undefined, success: `OK. $` })
				})
				.catch((error) => {
					res.send(error)
				})
		} else {
			res.render("editmodule", { mid: req.params.mid, name: req.body.name, credits: req.body.credits, errors: error.errors })
		}}
)