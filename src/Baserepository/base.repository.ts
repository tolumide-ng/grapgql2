class Baserepository {

    static async create (model: any, params: {}) {
        return await model.query().insert({...params})
    }

    static async update (model: any, params: {}, where: any) {
        return await model.query().patch(params).where(where.key, where.value)
    }

    static async updateById (model: any, id: string, params: {} ) {
        return await model.query().findById(id).patch({...params})
    }

    static async findAll (model: any) {
        return await model.query()
    }

    static async findById (model: any, id: string) {
        return await model.query().findById(id)
    }

    static async findBy (model: any, select: string[], where: string[]) {
        return await model.query().select(...select).where(...where).debug()
    }

}

export default Baserepository