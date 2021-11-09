const db = require('../../data/db-config.js');

function find() {
  return db('users as u')
    .leftJoin('roles as r', 'u.role_id', 'r.role_id')
    .select('u.user_id', 'u.username', 'r.role_name')
}

async function findBy(filter) {
  const result = await db('users as u')
    .leftJoin('roles as r', 'u.role_id', 'r.role_id')
    .where(filter)
    .select('u.user_id', 'u.username', 'u.password', 'r.role_name')
    .orderBy('u.user_id')
  return result
}

async function findById(user_id) {
  const result = await db('users as u')
    .leftJoin('roles as r', 'u.role_id', 'r.role_id')
    .select('u.user_id', 'u.username', 'r.role_name')
    .where({ user_id })
    .first()

  return result
}

async function add({ username, password, role_name }) {
  let created_user_id
  await db.transaction(async trx => {
    let role_id_to_use
    const [role] = await trx('roles').where('role_name', role_name)
    if (role) {
      role_id_to_use = role.role_id
    } else {
      const [role_id] = await trx('roles').insert({ role_name: role_name })
      role_id_to_use = role_id
    }
    const [user_id] = await trx('users').insert({ username, password, role_id: role_id_to_use })
    created_user_id = user_id
  })
  return findById(created_user_id)
}

module.exports = {
  add,
  find,
  findBy,
  findById,
};

