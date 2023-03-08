import { Block } from "../block";
import { mempool } from "../mempool";
import { Transaction } from "../transaction";
import { chainManager } from "../chain";
import { hash } from '../crypto/hash'
import { ObjectId, objectManager } from "../object";
import { logger } from "../logger";

const { Worker } = require('worker_threads')

// write the block template logic
const TARGET = '00000000abc00000000000000000000000000000000000000000000000000000'

class Miner {
    worker: Worker | null
    // objectId not Transaction
    constructor() {
        this.worker = null
    }

    template(x: ObjectId[]) {
        const template =
        {
            T: TARGET,
            created: 0,
            miner: 'Marabu',
            nonce: '',
            note: '',
            previd: objectManager.id(chainManager.longestChainTip),
            txids: x,
            type: 'block',
            studentids: ['bmc0407', 'jsteve1']
        }
        return template;
    }
    async initWorker(candidate: any): Promise<any>{
        return new Promise((resolve, reject) => {
            // import worker.ts script...
            // how to overwrite or terminate previous one?
            this.worker = new Worker('./src/mining/worker.ts', { candidate })
            //const temp = new Worker('./worker.ts', { candidate })
            // for now on later once
            (this.worker as any).on("message", (result: any) => {
                console.log(`PoW satisfied with ${result}`);
                // resolve(result)
            });
            (this.worker as any).on('error', reject);
            (this.worker as any).on('exit', (code: number) => {
                if (code !== 0)
                    reject(new Error(`stopped with  ${code} exit code`));
            })
        })
    }
    async run (candidate: any) {
        return await this.initWorker(candidate)
        // console.log(result);
    }
    async sendNewWork() {
        // potential bug
        this.worker?.terminate()
        const candidate = this.template(mempool.getTxIds())
        const res = this.run(candidate).catch(err => logger.info(err));
        logger.info("RES", res)
        console.log('Mining new block')

        await objectManager.put(candidate)
        console.log('Added our mined block to the chain')
        // add to our chain and gossip
        
    }
}

// questions
// 
// why does the worker new the new chain tip as part of the workerData.
// what do we do with the result we get back? Assuming that reuslt is the newly mined block, do we validate it oursleves and broadcast it?
// how and when do we terminate the worker

export const miner = new Miner()
