const express = require('express');
const authController = require('../controllers/auth');

const router = express.Router();

router.get('/', authController.isLoggedIn, (req, res) => {
  res.render('index', {
    user: req.user,
  });
});

router.get('/register',(req,res)=>{
    res.render('register')
});

router.get('/login', (req, res) => {
    res.render('login',{
      user: req.user,
    });
  });

router.get('/forum', authController.isLoggedIn, authController.loadComments, (req, res) => {
      // Check if forumData is empty
    if (!req.forumData || req.forumData.length === 0) {
      // If forumData is empty, render the 'forum' template with only user data
      res.render('forum',{ user: req.user });
  } else {
      // If forumData is available, render the 'forum' template with both forumData and user data
      res.render('forum',{ user: req.user, forumData: req.forumData, userData: req.userData });
  }
});

router.get('/profile', authController.isLoggedIn, (req, res) => {
    console.log(req.user);
    if( req.user ) {
      res.render('profile', {
        user: req.user
      });
    } else {
      res.redirect('/login');
    }
    
})

module.exports = router;