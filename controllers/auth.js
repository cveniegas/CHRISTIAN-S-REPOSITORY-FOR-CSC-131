const { request } = require("express");

const mysql = require("mysql");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { promisify } = require('util');
const express = require("express");
const { Console } = require("console");

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});
// Define a Handlebars helper function to capitalize the first letter of a string

exports.postComment = (req,res) => {
  console.log(req.body);
  
  const { title, content, user_id } = req.body;

  db.query('INSERT INTO forum SET ?', { title, content, user_id }, (error, results) => {
    try {
      if (error) {
        console.error(error);
        return res.status(500).send('Error posting comment'); // Send error response to the client
      } else {
        return res.render('forum', { message: 'Thread Posted' });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).send('Error posting comment'); // Send error response to the client
    }
  });

}

exports.login = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      if( !email || !password ) {
        return res.status(400).render('login', {
          message: 'Please provide an email and password'
        })
      }
  
      db.query('SELECT * FROM users WHERE email = ?', [email], async (error, results) => {
        console.log(results);
        if( !results || !(await bcrypt.compare(password, results[0].password)) ) {
          res.status(401).render('login', {
            message: 'Email or Password is incorrect'
          })
        } else {
          const id = results[0].id;
  
          const token = jwt.sign({ id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN
          });
  
          console.log("The token is: " + token);
  
          const cookiesOptions = {
            expires: new Date(
              Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
            ),
            httpOnly: true
          }
  
          res.cookie('jwt', token, cookiesOptions );
          res.status(200).redirect("/");
        }
  
      })
  
    } catch (error) {
      console.log(error);
    }
  }

exports.register = (req,res) =>{
    console.log(req.body);
    // const name = request.body.name;
    // const email = request.body.email;

    const { name, email, password, passwordConfirm} = req.body;

    db.query('SELECT email FROM users Where email = ?', [email],async(error, results) =>{
        if (error){
            console.log(error);
        }
        if (results.length > 0 ){
            return res.render('register', {
                message: 'That email is already in use'
            })
        } else if(password !== passwordConfirm){
            return res.render ('register', {
                message: 'Passwords do not match'
            });
        }
        // hashess the password
        let hashedPassword = await bcrypt.hash(password, 8);
        console.log(hashedPassword);
        
        // save to the database

        db.query('INSERT INTO users SET ?',{name: name, email: email, password: hashedPassword}, (error,results)=>{
            if(error){
                console.log(error);
            } else{
                return res.render ('register', {
                    message: 'User Registerd'
                });
            };
        });
    });

}

exports.isLoggedIn = async (req, res, next) => {
    // console.log(req.cookies);
    if( req.cookies.jwt) {
      try {
        //1) verify the token
        const decoded = await promisify(jwt.verify)(req.cookies.jwt,
        process.env.JWT_SECRET
        );
  
        console.log(decoded);
  
        //2) Check if the user still exists
        db.query('SELECT * FROM users WHERE id = ?', [decoded.id], (error, result) => {
          console.log(result);
  
          if(!result) {
            return next();
          }
  
          req.user = result[0];
          console.log("user is")
          console.log(req.user);
          return next();
  
        });
      } catch (error) {
        console.log(error);
        return next();
      }
    } else {
      next();
    }
  }
  
exports.logout = async (req, res) => {
  res.cookie('jwt', 'logout', {
    expires: new Date(Date.now() + 2*1000),
    httpOnly: true
  });

  res.status(200).redirect('/');
}


