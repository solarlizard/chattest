import { ContainerTestBase } from '../ContainerTestBase';

import {assert} from "chai";
import { AxiosResponse } from 'axios';
import { suite, test, only} from 'mocha-typescript';
import { DeleteMessageResponse } from '../../src/generated/DeleteMessageResponse';
import { MESSAGE_DAO } from '../../src/dao/message/MessageDao';
import { PostMessageRequest } from '../../src/generated/PostMessageRequest';
import { PostMessageResponse } from '../../src/generated/PostMessageResponse';
import { fail } from 'assert';


@suite export class PostMessageControllerTest extends ContainerTestBase {

    @test async messageExists () {

        // prepare
        await MESSAGE_DAO.messagesCollection.insertOne ({
            author : 'author1',
            content : 'content1',
            created : new Date (),
            id : 'id',
            index : 0,
            version : 0
        })

        
        // test
        const response = await this.axios.post<any, AxiosResponse<PostMessageResponse>, PostMessageRequest.Body> (`http://127.0.0.1:8080/api/messages/id`, {
            author : 'author2',
            content : 'content2'
        })

        // ass
        // assert
        if (response.data.type === 'success') {
            assert.equal (response.data.message.id, 'id')
            assert.equal (response.data.message.index, 0)
            assert.equal (response.data.message.ver, 0)

            if (response.data.message.state.type === 'active') {
                assert.equal (response.data.message.state.author, 'author1')
                assert.equal (response.data.message.state.content, 'content1')
                assert.exists (response.data.message.state.created)
                assert.notExists (response.data.message.state.updated)
                
                return
            }
        }

        assert.fail ()

    }

    @test async success () {
        
        // test
        const response1 = await this.axios.post<any, AxiosResponse<PostMessageResponse>, PostMessageRequest.Body> (`http://127.0.0.1:8080/api/messages/id1`, {
            author : 'author1',
            content : 'content1'
        })
        
        const response2 = await this.axios.post<any, AxiosResponse<PostMessageResponse>, PostMessageRequest.Body> (`http://127.0.0.1:8080/api/messages/id2`, {
            author : 'author2',
            content : 'content2'
        })

        // assert
        assert.equal (response1.data.type, 'success')

        // assert
        if (response2.data.type === 'success') {
            assert.equal (response2.data.message.id, 'id2')
            assert.equal (response2.data.message.index, 1)
            assert.equal (response2.data.message.ver, 0)

            if (response2.data.message.state.type === 'active') {
                assert.equal (response2.data.message.state.author, 'author2')
                assert.equal (response2.data.message.state.content, 'content2')
                assert.exists (response2.data.message.state.created)
                assert.notExists (response2.data.message.state.updated)
                
                return
            }
        }

        fail ()

    }
}
