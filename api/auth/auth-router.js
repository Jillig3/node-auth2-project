const router = require("express").Router();
const { checkUsernameExists, validateRoleName } = require('./auth-middleware');
const { JWT_SECRET, BCRYPT_ROUNDS } = require("../secrets");
const bcrypt = require('bcryptjs')
const buildToken = require('./token-builder')
const Users = require('../users/users-model')

router.post("/register", validateRoleName, (req, res, next) => {
  let user = req.body

  const rounds = process.env.BCRYPT_ROUNDS || 8
  const hash = bcrypt.hashSync(user.password, rounds)

  user.password = hash

  Users.add(user)
    .then(newUser => {
      res.status(201).json(newUser)
    })
    .catch(next)
});


router.post("/login", checkUsernameExists, (req, res, next) => {
  let { username, password } = req.body

  Users.findBy({ username })
    .then(([user]) => {
      if (user && bcrypt.compareSync(password, user.password)) {
        const token = buildToken(user)
        res.status(200).json({
          message: `${user.username} is back!`,
          token
        })
      } else {
        next({ status: 401, message: 'invalid credentials'})
      }
    })
    .catch(next)
});

module.exports = router;