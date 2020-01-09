const {Model} = require('objection')
import User from './User'


class Profile extends Model {
    static tableName = 'profiles';

    static relationMappings = {
        owner: {
            relation: Model.BelongsToOneRelation,
            modelClass: User,
            join: {
                from: 'profiles.id',
                to: 'users.id'
            }
        }
    }

}


export default Profile;
