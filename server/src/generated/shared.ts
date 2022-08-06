export interface MessageModel {
    readonly id : string,
    readonly ver : number,
    readonly index : number,
    readonly state : MessageModel.ActiveStateModel | MessageModel.DeletedStateModel
}

export namespace MessageModel {
    
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
