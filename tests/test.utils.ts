import faker from 'faker'

export class Redis {

    token: string[] = []
    id: string = ''

    zrem(){
        return this
    }

    zrangebyscore(){
        return this.token
    }

    zadd(userToken: string){
        this.token.push(userToken)
    }

    set(id: string){
        this.id = id;
        return this;
    }

    get(){
        return this.id;
    }

    del(){
        this.id = ''
        return;
    }

}


export const genUser = () => ({
    email: faker.internet.email(),
    password: faker.internet.password()
})