import { ContainerTestBase } from '../ContainerTestBase';

import {assert} from "chai";
import { AxiosResponse } from 'axios';
import { suite, test, only} from 'mocha-typescript';
import { DeleteMessageResponse } from '../../src/generated/DeleteMessageResponse';
import { MESSAGE_DAO } from '../../src/dao/message/MessageDao';


@suite export class DeleteMessageControllerTest extends ContainerTestBase {

    @test async messageNotFound () {
        // test
        const response = await this.axios.delete<any, AxiosResponse<DeleteMessageResponse>> (`http://127.0.0.1:8080/api/messages/fake`)

        // assert
        assert.equal (response.data.type, 'messageNotFound')

    }

    @test async messageIsAlreadyDeleted () {
        // prepare
        const deletedDate = new Date ();

        await MESSAGE_DAO.messagesCollection.insertOne ({
            author : 'author',
            content : 'content',
            created : new Date (),
            id : 'id',
            index : 0,
            version : 0,
            deleted : deletedDate
        })

        // test
        const response = await this.axios.delete<any, AxiosResponse<DeleteMessageResponse>> (`http://127.0.0.1:8080/api/messages/id`)

        // assert
        if (response.data.type === 'success') {
            assert.equal (response.data.message.id, 'id')
            assert.equal (response.data.message.index, 0)
            assert.equal (response.data.message.ver, 0)

            if (response.data.message.state.type === 'deleted') {
                assert.equal (response.data.message.state.deleted, deletedDate.toUTCString ())

                return;
            }
        }

        assert.fail ()
    }

    @test async success () {
        // prepare
        await MESSAGE_DAO.messagesCollection.insertOne ({
            author : 'author',
            content : 'content',
            created : new Date (),
            id : 'id',
            index : 0,
            version : 0
        })

        // test
        const response = await this.axios.delete<any, AxiosResponse<DeleteMessageResponse>> (`http://127.0.0.1:8080/api/messages/id`)

        // assert
        if (response.data.type === 'success') {
            assert.equal (response.data.message.id, 'id')
            assert.equal (response.data.message.index, 0)
            assert.equal (response.data.message.ver, 1)

            if (response.data.message.state.type === 'deleted') {
                assert.exists (response.data.message.state.deleted)

                return;
            }
        }
        
        assert.fail ()
    }
}
