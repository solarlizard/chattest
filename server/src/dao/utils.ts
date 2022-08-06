import { InsertOneResult, MongoServerError } from "mongodb"

export const checkKeyExistsError = (error : any) => {
    /* istanbul ignore else */
    if (error instanceof MongoServerError && error.code === 11000){
        return
    }
    else {
        /* istanbul ignore next */ 
        throw error
    }
}


export const checkInsertResult = <T>(insertOneResult : InsertOneResult<T>) => {
    if (insertOneResult){
        return insertOneResult.insertedId
    }
    else {
        return null;
    }
}
