import { ContainerTestBase } from '../ContainerTestBase';

import { suite, test, only} from 'mocha-typescript';
import { SEQ_DAO } from '../../src/dao/SeqDao';


@suite export class SeqDaoTest extends ContainerTestBase {

    @test async success () {

        // prepare
        await SEQ_DAO.start ()

    }
}
