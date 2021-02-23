const { response, query } = require('express');
const { reverse } = require('mysql2/lib/constants/charset_encodings');

module.exports = (io) => {

  let conn = require('./../inc/db');
  let express = require('express');
  let formidable = require('formidable');
  let router = express.Router();

  let defaults = {
    title: 'Agenda ALT!',
    headerIndex: false
  };

  let defaultsReservation = {
    title: 'Reserva - Agenda ALT!',
    header: {
      background: 'https://media.giphy.com/media/fxsqOYnIMEefC/giphy.gif',
      title: 'Reserva concluída com sucesso!'
    },
    body: {}
  };


  router.get('/', (req, res, next) => {

    conn.query(
      "SELECT * FROM tb_sala ORDER BY title",
      (err, results, fields) => {

        res.render('index', Object.assign({}, defaults, {
          title: 'Agenda ALT!',
          espaco: results,
          errou: '',
          headerIndex: true
        }));

      }

    );

  });

  router.get('/espaco', (req, res, next) => {

    conn.query(
      "SELECT * FROM tb_sala ORDER BY title",
      (err, results, fields) => {

        res.render('espaco', Object.assign({}, defaults, {
          title: ' Agenda ALT!',
          header: {
            background: 'images/img_bg_1.jpg',
            title: 'algum texto aqui!'
          },
          espaco: results
        }));

      });

  });

  router.get('/reservation', (req, res, next) => {

    res.render('reservation', Object.assign({}, defaults, defaultsReservation));

  });

  router.post('/reservation', (req, res, next) => {

    let render = (error, success) => {

      res.render('reservation', Object.assign({}, defaults, defaultsReservation, {
        body: req.body,
        success,
        error
      }));

    };

    if (!req.body.name) {

      render('Preencha o campo Nome.');

    } else if (!req.body.email) {

      render('Preencha o campo E-mail.');

    } else if (!req.body.phone) {

      render('Preencha o campo Telefone.');

    } else if (!req.body.people) {

      render('Selecione a quantidade de pessoas.');

    } else if (!req.body.date.trim()) {

      render('Selecione o dia da reserva.');

    } else if (!req.body.room.trim()) {

      render('Selecione a sala para reserva.');

    } else {

      let date = req.body.date.split('/');
      date = `${date[2]}-${date[1]}-${date[0]}`;
      req.body.date = date;

      conn.query(`SELECT COUNT(*) FROM tb_reservations WHERE date = '${req.body.date}' AND espaco = '${req.body.room}'`, function (err, result, fields) {

        if (err) throw err;

        var count = Object.values(result[0]);

        if (count > 0) {

          console.log('Sala indisponivel nessa data!')

          conn.query(
            "SELECT * FROM tb_sala ORDER BY title",
            (err, results, fields) => {

              res.render('index', Object.assign({}, defaults, {
                title: 'Agenda ALT!',
                espaco: results,
                errou: 'Este local não está disponível na data escolhida. ',
                headerIndex: true
              }))});


            } else {

            console.log('Sala disponivel!');

            conn.query(
              "INSERT INTO tb_reservations (name, email, telefone, people, date, espaco) VALUES(?, ?, ?, ?, ?, ?)",
              [
                req.body.name,
                req.body.email,
                req.body.phone,
                req.body.people,
                req.body.date,
                req.body.room
              ],
              (err, results) => {

                if (err) {
                  render(err);
                } else {

                  io.emit('reservations update', req.body);

                  req.body = {};

                  render(null, 'Reserva realizada com sucesso!');
                }
              }
            )
          }
      })
    }

  });

  return router;

}