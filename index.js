var express = require('express');
var router = express.Router();
var path = require('path');

// Connect string to MySQL
var mysql = require('mysql');

var connection = mysql.createConnection({
  host: 'fling.seas.upenn.edu',
  user: 'zhaoyij',
  password: 'Williamchen0426',
  database: 'zhaoyij'
});

connection.connect(function(err) {
  if (err) {
    console.log("Error Connection to DB" + err);
    return;
  }
  console.log("Connection established...");
});

/* GET home page. */
router.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '../', 'views', 'login.html'));
});

router.get('/dashboard', function(req, res) {
  res.sendFile(path.join(__dirname, '../', 'views', 'dashboard.html'));
});

router.get('/reference', function(req, res) {
  res.sendFile(path.join(__dirname, '../', 'views', 'reference.html'));
});

router.get('/recommendations', function(req, res) {
  res.sendFile(path.join(__dirname, '../', 'views', 'recommendations.html'));
});

router.get('/best', function(req, res) {
  res.sendFile(path.join(__dirname, '../', 'views', 'best.html'));
});

router.get('/posters', function(req, res) {
  res.sendFile(path.join(__dirname, '../', 'views', 'posters.html'));
});

//NEW///////////////////////////////////////////////////////////////////////////////////////////////////////////////
router.get('/people', function (req, res) {
  var query = 'SELECT * FROM User';
  connection.query(query, function (err, rows, fields) {
    if (err) console.log(err);
    else {
      console.log(rows);
      res.json(rows);
    }
  });
});

router.get('/genres', function (req, res) {
  var query = 'SELECT DISTINCT genre FROM Genres'; 
  connection.query(query, function (err, rows, fields) {
    if (err) console.log(err);
    else {
      console.log(rows);
      res.json(rows);
    }
  });
});

router.get('/movies/:movie_genre', function (req, res) {
  var query = 'SELECT m.title, m.rating, m.vote_count FROM Movies m,  Genres g WHERE m.id = g.movie_id AND g.genre = "' + req.params.movie_genre + '" ORDER BY m.rating DESC, m.vote_count DESC LIMIT 10'; 
  connection.query(query, function (err, rows, fields) {
    if (err) console.log(err);
    else {
      console.log(rows);
      res.json(rows);
    }
  });
});

router.get('/recommended/:movie1/:movie2/:movie3', function (req, res) {
  var query = 'SELECT mo.title, ge.genre FROM Movies mo, Genres ge WHERE mo.id = ge.movie_id AND ge.genre =(SELECT T.genre FROM (SELECT g.genre FROM Movies m JOIN Genres g ON m.id = g.movie_id WHERE m.id = ' + req.params.movie1 + ' UNION ALL SELECT g.genre FROM Movies m JOIN Genres g ON m.id = g.movie_id WHERE m.id = ' + req.params.movie2 + ' UNION ALL SELECT g.genre FROM Movies m JOIN Genres g ON m.id = g.movie_id WHERE m.id = ' + req.params.movie3 + ' ) T GROUP BY T.genre ORDER BY count(*) DESC LIMIT 1) ORDER BY mo.rating DESC, mo.vote_count DESC LIMIT 10'
  
  connection.query(query, function (err, rows, fields) {
    if (err) console.log(err);
    else {
      console.log(rows);
      res.json(rows);
    }
  });
});

router.get('/best/:decade', function (req, res) {
  var query = 'SELECT T2.genre, T2.title, T2.release_year, T2.vote_count FROM (SELECT g.genre, MAX(m.vote_count) AS max_vote FROM Movies m JOIN Genres g ON m.id = g.movie_id WHERE m.release_year >=' + req.params.decade + ' AND m.release_year < (' + req.params.decade + ' + 10) GROUP BY g.genre) T1 JOIN (SELECT * FROM Movies mo JOIN Genres ge ON mo.id = ge.movie_id WHERE mo.release_year >= ' + req.params.decade + ' AND mo.release_year < (' + req.params.decade + ' + 10)) T2 ON T1.genre = T2.genre AND T1.max_vote = T2.vote_count ORDER BY T2.genre'; 
  connection.query(query, function (err, rows, fields) {
    if (err) console.log(err);
    else {
      console.log(rows);
      res.json(rows);
    }
  });
});

router.get('/decades', function (req, res) {
  var query = 'SELECT DISTINCT FLOOR(release_year / 10) * 10 AS Decade  FROM Movies ORDER BY FLOOR(release_year / 10) * 10'; 
  connection.query(query, function (err, rows, fields) {
    if (err) console.log(err);
    else {
      console.log(rows);
      res.json(rows);
    }
  });
});


// !!!! NOTICE I SET THE LIMIT BE 30 HERE BECAUSE I NEED TO FILTER OUT THE ONES WITH WEBSITE URL = "N/A". I REALZIED THERE'S A LOT OF THEM. 
// THUS, I SET THE LIMIT IN THE QUERY BE LARGE AND IN APP.JS FUNCTION getURL CONTROL THE LENGTH OF THE ARRAY OF ALL THE POSTERS TO BE 
// DISPLAYED TO BE NO MORE THAN 15. 
router.get('/poster_movies', function (req, res) {
  var query = 'SELECT DISTINCT title, id, imdb_id FROM Movies ORDER BY RAND() LIMIT 30'; 
  connection.query(query, function (err, rows, fields) {
    if (err) console.log(err);
    else {
      console.log(rows);
      res.json(rows);
    }
  });
});


//NEW///////////////////////////////////////////////////////////////////////////////////////////////////////////////




// To add a new page, use the template below
/*
router.get('/routeName', function(req, res) {
  res.sendFile(path.join(__dirname, '../', 'views', 'fileName.html'));
});
*/

// Login uses POST request
router.post('/login', function(req, res) {
  // use console.log() as print() in case you want to debug, example below:
  console.log(req.body); // will show the print result in your terminal

  // req.body contains the json data sent from the loginController
  // e.g. to get username, use req.body.username

  /* Write your query here and uncomment line 21 in javascripts/app.js*/
  var query = "INSERT INTO User (username, password) VALUES (' " + req.body.username + " ',' " + req.params.password + " ') ON DUPLICATE KEY UPDATE password = '" + req.params.password + "'"; 
  
  connection.query(query, function(err, rows, fields) {
    console.log("rows", rows);
    console.log("fields", fields);
    if (err) console.log('insert error: ', err);
    else {
      res.json({
        result: 'success'
      });
    }
  });
});

// template for GET requests
/*
router.get('/routeName/:customParameter', function(req, res) {

  var myData = req.params.customParameter;    // if you have a custom parameter
  var query = '';

  // console.log(query);

  connection.query(query, function(err, rows, fields) {
    if (err) console.log(err);
    else {
      res.json(rows);
    }
  });
});
*/

module.exports = router;
