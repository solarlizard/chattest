export namespace PostMessageRequest {

    export interface Body {
        readonly author: string;
        readonly content: string;      
    }
    
    export interface Params {
        readonly id : string
    }
}
