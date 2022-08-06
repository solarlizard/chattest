export namespace ListMessagesRequest {

    export interface Query {
        readonly type : 'before' | 'after',
        readonly index : string
    }
}
