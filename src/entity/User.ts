import bcrypt from 'bcryptjs'
import {Entity, Column, BaseEntity, PrimaryGeneratedColumn, BeforeInsert} from 'typeorm';
// import * as uuidv4 from 'uuid/v4'
// const uuidv4 = require('uuid/v4')

@Entity('users')
export class User extends BaseEntity {

    // @PrimaryColumn('uuid')
    // id!: string;

    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column('varchar', {length: 255})
    email!: string;

    @Column('text')
    password!: string;

    @Column('boolean', {default: false})
    confirmed!: boolean

    @BeforeInsert()
    async hashPassword(){
        if(this.password){
            this.password = await bcrypt.hash(this.password, bcrypt.genSaltSync(10))
        }
    }


    // @BeforeInsert()
    // addId(){
    //     this.id = uuidv4()
    // }

}
