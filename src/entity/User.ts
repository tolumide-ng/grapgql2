import {Entity, Column, BaseEntity, BeforeInsert, PrimaryColumn} from 'typeorm';
// import * as uuidv4 from 'uuid/v4'
const uuidv4 = require('uuid/v4')

@Entity('users')
export class User extends BaseEntity {

    @PrimaryColumn('uuid')
    id!: string;

    // @PrimaryGeneratedColumn("uuid")
    // id!: string;

    @Column('varchar', {length: 255})
    email!: string;

    @Column('text')
    password!: string;

    @BeforeInsert()
    addId(){
        this.id = uuidv4()
    }

}
