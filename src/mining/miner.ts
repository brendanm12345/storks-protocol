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
            type: 'block'
        }
        return template;
    }
    initWorker(candidate: { T: string; created: number; miner: string; nonce: string; note: string; previd: string; txids: Transaction[]; type: string; }) {
        return new Promise((resolve, reject) => {
            // import worker.ts script..
            const worker = new Worker('./worker.ts', { candidate })
            worker.once("message", (result: any) => {
                console.log(`PoW satisfied with ${result}`);
            });
            worker.on('error', reject);
            worker.on('exit', (code: number) => {
                if (code !== 0)
                    reject(new Error(`stopped with  ${code} exit code`));
            })

        })
    }
    async sendNewWork() {
        // invoke a template making function and pass in 
        const candidate = this.template(mempool.txs)
        const res = await this.initWorker(candidate)
        logger.info(res)
        
    }
}

// questions
// how and when do we terminate the worker
// why does the worker new the new chain tip as part of the workerData
// what do we do with the result we get back? Assuming that reuslt is the newly mined block, do we validate it oursleves and broadcast it?
// 

export const miner = new Miner()
