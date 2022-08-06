import * as http from "http"

export const stopHttpServer = (server : http.Server) => new Promise ((resolve, reject) => server.close (error => {
    /* istanbul ignore if */
    if (error) {
        /* istanbul ignore next */
        reject (error)
    }
    else {
        resolve (null)
    }
}))
