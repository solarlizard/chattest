import { MongoServerError } from "mongodb"
import { CONFIG } from "../Config"
import { MONGO_CONNECTION } from "./MongoConnection"

export type SEQ_ID = 'message'

export class SeqDao {
    
    private countersCollection = MONGO_CONNECTION.db.collection<{
        seqId : SEQ_ID,
        value : number
    }> ('Sequence')

    public readonly start = async () => {

        await this.countersCollection.createIndexes ([
            {
                key : {
                    counterId : 1
                },
                unique : true
            }
        ])
    
        await this.createSeq ('message')
    }

    private readonly createSeq = (seqId : SEQ_ID) => this.countersCollection.insertOne ({
        seqId,
        value : 0
    })
    .catch (error => {
        /* istanbul ignore next */
        if (error instanceof MongoServerError && error.code === 11000) {
            return
        }
        else {
            /* istanbul ignore next */
            throw error
        }
    })

    public readonly seq = (seqId : SEQ_ID) => this.countersCollection.findOneAndUpdate ({
        seqId
    }, {
        $inc: { value : 1 },
    }, {
        upsert : true
    }).then (result => result.value!.value)    
}

export const SEQ_DAO = new SeqDao ()