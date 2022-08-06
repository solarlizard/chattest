import { ObjectId } from "mongodb";

export interface QueryMessageDaoModel {
    readonly id? : string,
    readonly objectId? : ObjectId
}
