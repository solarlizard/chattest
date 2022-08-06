import { MESSAGE_SERVICE } from "../service/MessageService"
import { CreateMessageLogicModel } from "./CreateMessageLogicModel"
import { MESSAGE_BUS } from "./MessageBus"

export class CreateMessageLogicOperation {
    
    public readonly create = async (model : CreateMessageLogicModel) => {
        
        const createdMessage = await MESSAGE_SERVICE.create ({
            author : model.author,
            content : model.content,
            id : model.id
        })

        if (createdMessage) {
            MESSAGE_BUS.notify (createdMessage)

            return createdMessage
        }
        else {
            return MESSAGE_SERVICE.getById (model.id)
        }        
    }
}
