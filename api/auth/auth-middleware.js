const { JWT_SECRET } = require("../secrets");
const jwt = require('jsonwebtoken');
const Users = require('./../users/users-model')

const restricted = (req, res, next) => {
 const token = req.headers.authorization
  if (!token) {
    return next({ status: 401, message: 'Token required'})
  }

  jwt.verify(token, JWT_SECRET, (err, decodedToken) => {
    if (err) {
      return next({ status: 401, message: 'Token invalid'})
    }
    req.decodedToken = decodedToken
    return next()
  })
}

const only = role_name => (req, res, next) => {
  if (req.decodedToken.role_name === role_name) {
    next()
  } else {
    next({ status: 403, message: 'This is not for you'})
  }
}


const checkUsernameExists = async (req, res, next) => {
  const { username } = req.body
  const checkUsername = await Users.findBy({ username })
  if (checkUsername) {
    next()
  } else {
    next({ status: 401, message: 'invalid credentials'})
  }
}


const validateRoleName = (req, res, next) => {
 
  const role = req.body.role_name

  if (role === undefined || role.trim() === '') {
    req.body.role_name = 'student'
    next()
  } else if (role.trim() === 'admin') {
    next({ status: 422, message: "Role name can not be admin"})
  } else if (role.trim().length > 32) {
    next( { status: 422, message: 'Role name can not be longer than 32 chars'}) 
  } else {
    req.body.role_name = role.trim()
    next()
  }
}

module.exports = {
  restricted,
  checkUsernameExists,
  validateRoleName,
  only,
}

