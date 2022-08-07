import { ContainerTestBase } from '../ContainerTestBase';

import * as rx from "rxjs"

import { suite, test, only, skip} from 'mocha-typescript';

import { Manager, Socket } from "socket.io-client";
import { ListenMessagesResponse } from "../../src/generated/ListenMessagesResponse";
import { MESSAGE_BUS } from "../../src/logic/MessageBus";
import { assert } from 'chai';
import { fail } from 'assert';
import { MESSAGE_DAO } from '../../src/dao/message/MessageDao';

@suite export class ListenMessagesControllerTest extends ContainerTestBase {

    private socket : Socket

    async after () {

        this.socket?.close ()

        await super.after ()
    }

    @test async success () {

        // prepare1

        for (let q = 100; q < 300; q ++) {
            await MESSAGE_DAO.messagesCollection.insertOne ({
                index : q,
                author : 'author',
                content : 'content',
                created : new Date (),
                updated : new Date (),
                id : 'id' + q,
                version : 0
            })        
        }
    
        this.socket = new Manager("ws://127.0.0.1:8080", {
            path : "/api/messages/connect"
        }).socket ("/")

        // test1
        const response1 = await rx.firstValueFrom (
            rx.fromEventPattern<ListenMessagesResponse> (handler => this.socket.on ('data', handler))
        )
        
        // assert1
        if (response1.type === 'success' && response1.result.type === 'list') {
            assert.equal (response1.result.messages.length, 100)
            assert.equal (response1.result.messages[0].index, 200)
            assert.equal (response1.result.messages[99].index, 299)
        }
        else {
            fail ()
        }

        // prepare2
        setImmediate (() => MESSAGE_BUS.notify ({
            id : 'idCreated',
            index : 2000,
            version : 0,
            state : {
                type : 'active',
                author : 'a',
                content : 'c',
                created : new Date ()
            }
        }))

        // test2
        const response2 = await rx.firstValueFrom (
            rx.fromEventPattern<ListenMessagesResponse> (handler => this.socket.on ('data', handler))
        )
        
        // assert1
        if (response2.type === 'success' && response2.result.type === 'update') {
            assert.equal (response2.result.message.id, 'idCreated')
        }
        else {
            fail ()
        }
    }
}
