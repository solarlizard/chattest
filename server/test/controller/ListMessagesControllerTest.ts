import { ContainerTestBase } from '../ContainerTestBase';

import {assert} from "chai";
import { AxiosResponse } from 'axios';
import { suite, test, only, skip} from 'mocha-typescript';
import { DeleteMessageResponse } from '../../src/generated/DeleteMessageResponse';
import { MESSAGE_DAO } from '../../src/dao/message/MessageDao';
import { ListMessagesResponse } from '../../src/generated/ListMessagesResponse';
import { fail } from 'assert';


@suite export class ListMessagesControllerTest extends ContainerTestBase {

    async before () {
        await super.before ()


        const createMessage = (index : number) => MESSAGE_DAO.messagesCollection.insertOne ({
            index,
            author : 'author',
            content : 'content',
            created : new Date (),
            updated : new Date (),
            id : 'id' + index,
            version : 0
        })

        for (let q = 100; q < 300; q ++) {
            await createMessage (q)
        }

    }

    @test async successBeforeIndex () {
        // prepare

        // test
        const response = await this.axios.get<any, AxiosResponse<ListMessagesResponse>> (`http://127.0.0.1:8080/api/messages/?index=200&type=before`)

        // assert
        if (response.data.type === 'success') {
            assert.equal (response.data.messages.length, 50)
            assert.equal (response.data.messages[0].index, 150)
            assert.equal (response.data.messages[49].index, 199)

            return
        }

        fail ()

    }

    @test async successAfterIndex () {
        // prepare

        // test
        const response = await this.axios.get<any, AxiosResponse<ListMessagesResponse>> (`http://127.0.0.1:8080/api/messages/?index=200&type=after`)

        // assert
        if (response.data.type === 'success') {
            assert.equal (response.data.messages.length, 50)
            assert.equal (response.data.messages[0].index, 201)
            assert.equal (response.data.messages[49].index, 250)

            return
        }

        fail ()

    }
}
