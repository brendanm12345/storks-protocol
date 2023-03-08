import { Block } from "../block";
import { mempool } from "../mempool";
import { Transaction } from "../transaction";
import { chainManager } from "../chain";
import { hash } from '../crypto/hash'
import { objectManager } from "../object";
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

    template(x: Transaction[]) {
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
    initWorker(candidate: { T: string; created: number; miner: string; nonce: string; note: string; previd: string; txids: Transaction[]; type: string; }) {
        return new Promise((resolve, reject) => {
            // import worker.ts script...
            // how to overwrite or terminate previous one?
            this.worker = new Worker('./worker.ts', { candidate })
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
    async sendNewWork() {
        // potential bug
        this.worker?.terminate()
        console.log('Mining new block')
        const candidate = this.template(mempool.txs)
        const res = await this.initWorker(candidate)
        logger.info(res)
        
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
