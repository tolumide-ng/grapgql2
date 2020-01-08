'use strict'

class nodemailer{
    static createTestAccount() {
        return {
            user: 'test@test.com',
            pass: 'THEPASS'
        }
    }

    static createTransport(){
        return {
            sendMail(){
                return this
            }
        }
    }

    static getTestMessageUrl(){
        return {
            messageId: 'messageId'
        }
    }
}

module.exports = nodemailer
