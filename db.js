const knex = require('knex');
const { BUILDS_DIR } = require('./config');

const db = knex({
  client: 'sqlite3',
  connection: {
    filename: `${BUILDS_DIR}/builds.sqlite`
  },
  useNullAsDefault: true
})

module.exports = async() => {
    const builds = await db.schema.hasTable('builds');

    if(!builds) {
      return db.schema.createTable('builds', table => {
        table.increments('id').primary();
        table.text('commitHash');
        table.text('buildStart');
        table.text('buildEnd');
        table.text('buildStatus');    
        table.text('buildMessage')
    })    
  }  
} 

module.exports.Builds = {
  all() {
    return db('builds').orderBy('id', 'desc');
  },
  find(id) {
    return db('builds').where({ id: id });
  },
  create(data) {
    return db('builds').insert(data);
  },
  update(buildId, data) {
    return db('builds').where({ id: buildId}).update(data)
  },
  lastId() {
    return db('builds').select('id').orderBy('id','desc').limit(1);
  }  
}