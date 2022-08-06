import { DeleteMessageResponse } from "../generated/DeleteMessageResponse"
import { DeleteMessageExpressRequest, DeleteMessageServer } from "../generated/DeleteMessageServer"
import { MESSAGE_LOGIC } from "../logic/MessageLogic"
import { MESSAGE_SERVICE } from "../service/MessageService"
import { MessageServiceModel } from "../service/model/MessageServiceModel"
import { createMessageModel } from "./createMessageModel"

export class DeleteMessageController implements DeleteMessageServer {
    
    readonly deleteMessage = async (request: DeleteMessageExpressRequest) : Promise<DeleteMessageResponse> => {


        const message = await MESSAGE_SERVICE.findById (request.params.id)

        if (!message) {
            return this.createMessageNotFoundResponse ()
        }

        const deletedMessage = await MESSAGE_LOGIC.delete (message)

        return this.createSuccessResponse (deletedMessage);
    }

    private readonly createSuccessResponse = (message : MessageServiceModel) : DeleteMessageResponse => ({
        type : 'success',
        message : createMessageModel (message)
    })

    private readonly createMessageNotFoundResponse = () : DeleteMessageResponse => ({
        type : 'messageNotFound'
    })
}