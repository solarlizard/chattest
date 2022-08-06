import { PostMessageResponse } from "../generated/PostMessageResponse";
import { PostMessageExpressRequest, PostMessageServer } from "../generated/PostMessageServer";

import { MESSAGE_LOGIC } from "../logic/MessageLogic";
import { CreateMessageLogicModel } from "../logic/CreateMessageLogicModel";
import { MessageServiceModel } from "../service/model/MessageServiceModel";
import { createMessageModel } from "./createMessageModel";

export class PostMessageController implements PostMessageServer {
    
    readonly postMessage = async (request: PostMessageExpressRequest) : Promise<PostMessageResponse> => {

        const logicModel = this.createLogicModel (request);

        const createdMessage = await MESSAGE_LOGIC.create (logicModel)

        return this.createSuccessResponse (createdMessage)
    }

    private readonly createLogicModel = (request : PostMessageExpressRequest) : CreateMessageLogicModel => ({
        id : request.params.id,
        author : request.body.author,
        content : request.body.content,
    })

    private readonly createSuccessResponse = (message : MessageServiceModel) : PostMessageResponse => ({
        type : 'success',
        message : createMessageModel (message)
    })
}