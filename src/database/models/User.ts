const { Model } = require('objection');
import bcrypt from 'bcryptjs'

class User extends Model {
  static get tableName() {
    return 'users';
  }


  async $beforeInsert(context: any) {
    await super.$beforeInsert(context);
    this.password = await bcrypt.hash(this.password, bcrypt.genSaltSync(10))
  }

  async $beforeUpdate(context: any){
      await super.$beforeUpdate(context);
      this.password = await bcrypt.hash(this.password, bcrypt.genSaltSync(10))
  }


}

export default User