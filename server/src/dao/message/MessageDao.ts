import { Filter, FindOptions, ObjectId, UpdateFilter, WithId } from "mongodb"
import { cursorTo } from "readline"
import { MONGO_CONNECTION } from "../MongoConnection"
import { SEQ_DAO } from "../SeqDao"
import { checkInsertResult, checkKeyExistsError } from "../utils"
import { CreateMessageDaoModel } from "./model/CreateMessageDaoModel"
import { MessageEntity } from "./model/MessageEntity"
import { QueryMessageDaoModel } from "./model/QueryMessageDaoModel"
import { QueryMessageListDaoModel } from "./model/QueryMessageListDaoModel"
import { UpdateMessageDaoModel } from "./model/UpdateMessageDaoModel"

export class MessageDao {

    public readonly messagesCollection = MONGO_CONNECTION.db.collection<MessageEntity> ('Messages')

    public readonly start = async () => {

        await this.messagesCollection.createIndexes ([
            {
                key : {
                    id : 1
                },
                unique : true
            },
            {
                key : {
                    index : -1
                },
                unique : true
            }
        ])
    }

    public readonly find = (model : QueryMessageDaoModel) => {
        const query : Filter<WithId<MessageEntity>> = {}

        if (model.id) {
            query.id = model.id
        }
        
        if (model.objectId) {
            query._id = model.objectId
        }

        return this.messagesCollection.findOne (query)
    }

    public readonly create = async (model : CreateMessageDaoModel) => this.messagesCollection.insertOne ({
        index : await SEQ_DAO.seq ('message'),
        author : model.author,
        content : model.content,
        created : model.created,
        id : model.id,
        version : model.version
    })
    .catch (error => {
        console.error (error)
        throw error
    })
    .catch (checkKeyExistsError)
    .then (checkInsertResult)

    
    public readonly list = async (query : QueryMessageListDaoModel) => {

        const options : FindOptions = {}
        const filter : Filter<MessageEntity> = {}

        /* istanbul ignore else */
        if (query.limit !== undefined) {
            options.limit = query.limit
        }

        if (query.beforeIndex !== undefined) {
            filter.index = { 
                $lt: query.beforeIndex
            }
            options.sort = {
                index : -1
            }
        }

        if (query.afterIndex !== undefined) {
            filter.index = { 
                $gt: query.afterIndex
            }
            options.sort = {
                index : 1
            }
        }

        if (query.afterIndex === undefined && query.beforeIndex === undefined) {
            options.sort = {
                index : -1
            }
        }

        const cursor = this.messagesCollection.find (filter, options)

        const result : MessageEntity [] = []


        await cursor.forEach (item => {
            result.push(item);
        })

        return result;
    }
    
    public readonly updateIfNotDeleted = (id : string, model : UpdateMessageDaoModel) => {

        const setModel : Partial<MessageEntity> = {
        }
        
        /* istanbul ignore else */
        if (model.deleted) {
            setModel.deleted = model.deleted
        }

        return this.messagesCollection
            .findOneAndUpdate ({
                id,
                deleted : {$exists: false}
            }, {
                $inc: { version : 1 },
                $set : setModel
            }, {
                returnDocument : 'after'
            })
            .then (result => result.value)
    }
}

export const MESSAGE_DAO = new MessageDao ()

