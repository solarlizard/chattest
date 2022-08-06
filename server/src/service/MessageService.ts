import { WithId } from "mongodb"
import { MESSAGE_DAO } from "../dao/message/MessageDao"
import { MessageEntity } from "../dao/message/model/MessageEntity"
import { QueryMessageListDaoModel } from "../dao/message/model/QueryMessageListDaoModel"
import { ListMessagesQueryServiceModel } from "./model/ListMessagesQueryServiceModel"
import { CreateMessageServiceModel } from "./model/CreateMessageServiceModel"
import { MessageServiceModel } from "./model/MessageServiceModel"

export class MessageService {

    public readonly getById = (id : string) => MESSAGE_DAO.find ({id})
        .then (entity => this.map (entity!))

    public readonly findById = (id : string) => MESSAGE_DAO.find ({id})
        .then (this.mapIfNotNull)

    public readonly create = (model : CreateMessageServiceModel) => MESSAGE_DAO.create ({
        author : model.author,
        content : model.content,
        created : new Date (),
        id : model.id,
        version : 0
    }).then (objectId => {
        if (objectId) {
            return MESSAGE_DAO.find ({objectId})
                .then (this.map)
        }
        else {
            return null;
        }
    })

    public readonly delete = (message : MessageServiceModel) => MESSAGE_DAO.updateIfNotDeleted (message.id, {
        deleted : new Date ()
    }).then (this.mapIfNotNull)
    

    public readonly listPage = (query : ListMessagesQueryServiceModel) => MESSAGE_DAO.list ({
        beforeIndex : query.beforeIndex,
        afterIndex : query.afterIndex,
        limit : 50
    })
        .then (list => list.map (this.map))
        .then (list => {
            if (query.beforeIndex !== undefined) {
                return list.reverse ()
            }
            if (query.beforeIndex === undefined && query.afterIndex === undefined) {
                return list.reverse ()
            }
            else {
                return list
            }
        })

    private readonly mapIfNotNull = (entity : WithId<MessageEntity> | null) => {
        if (entity) {
            return this.map (entity)
        }
        else {
            return null
        }
    }

    private readonly map = (entity : WithId<MessageEntity>) : MessageServiceModel => {

        const createState = () : MessageServiceModel.ActiveStateModel | MessageServiceModel.DeletedStateModel => {
            if (entity.deleted) {
                return {
                    type : 'deleted',
                    deleted : entity.deleted
                }
            }
            else {
                return {
                    type : 'active',
                    author : entity.author!,
                    content : entity.content!,
                    created : entity.created,
                    updated : entity.updated
                }
            }
        }

        return {
            id : entity.id,
            index : entity.index,
            version : entity.version,
            state : createState ()
        }
    }
}

export const MESSAGE_SERVICE = new MessageService ()