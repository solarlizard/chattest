export interface ChatMessageModel {
    readonly id : string,
    readonly ver : number,
    readonly index? : number,
    readonly state : ChatMessageModel.ActiveStateModel | ChatMessageModel.DeletedStateModel
}

export namespace ChatMessageModel {
    
    export interface ActiveStateModel {
        type : 'active',
        readonly content : string
        readonly author : string,
        readonly created : string,
        readonly updated? : string,
    }
    
    export interface DeletedStateModel {
        type : 'deleted',
        readonly deleted : string
    }
}
