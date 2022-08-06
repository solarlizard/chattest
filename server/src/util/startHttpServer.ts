import * as http from "http"

export const startHttpServer = (server : http.Server, port : number) => new Promise ((resolve, reject) => {

    server.on ('error', reject)
    server.on ('listening', resolve)

    server.listen (port)
})
