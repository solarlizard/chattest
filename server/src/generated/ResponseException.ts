export class ResponseException<T> {
    constructor (public readonly response : T) {
    }
}