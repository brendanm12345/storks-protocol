import { Block } from "../block";
import { mempool } from "../mempool";
import { Transaction } from "../transaction";
import { chainManager } from "../chain";
import { hash } from '../crypto/hash'
import { ObjectId, objectManager } from "../object";
import { logger } from "../logger";
import { workerData } from "worker_threads";
import { network } from "../network";
import { delay } from "../promise";
const { getRandomValues } = require('crypto');
import { promises as fs } from 'fs'

const { Worker } = require('worker_threads')

// write the block template logic
const TARGET = '00000000abc00000000000000000000000000000000000000000000000000000'

class Miner {
    worker: Worker | null
    candidate: any
    // objectId not Transaction

    constructor() {
        this.worker = null
    }

    template(x: ObjectId[], nonce: string) {
        const template =
        {
            T: TARGET,
            // just changed
            created: Math.floor(new Date().getTime() / 1000),
            miner: 'Marabu',
            nonce: nonce,
            note: '',
            previd: objectManager.id(chainManager.longestChainTip?.toNetworkObject()),
            txids: x,
            type: 'block',
            studentids: ['bmc0407', 'jsteve1']
        }
        return template;
    }
    async initWorker(candidate: any): Promise<any> {
        return new Promise((resolve, reject) => {
            this.worker = new Worker('./src/mining/worker.ts',
                { workerData: candidate, execArgv: /\.ts$/.test('./src/mining/worker.ts') ? ["--require", "ts-node/register"] : undefined, });
            //const temp = new Worker('./worker.ts', { candidate })
            // for now on later once
            // (this.worker as any).on("message", (result: any) => {
            //     console.log(`PoW satisfied with ${result}`);
            //     resolve(result)
            // });
            (this.worker as any).on("message", resolve);
            (this.worker as any).on('error', reject);
            (this.worker as any).on('exit', (code: number) => {
                if (code !== 0)
                    reject(new Error(`stopped with  ${code} exit code`));
            });
        })
    }
    // async run(candidate: { T: string; created: number; miner: string; nonce: string; note: string; previd: string; txids: string[]; type: string; studentids: string[]; }) {
    //     return await this.initWorker(candidate)
    //     // console.log(result);
    // }
    async generateNonce(): Promise<string> {
        const nonce = new Uint8Array(32);
        getRandomValues(nonce);
        return Array.from(nonce, byte => ('0' + byte.toString(16)).slice(-2)).join('');
    }
    async sendNewWork() {
        // potential bug
        this.worker?.terminate()
        let nonce = await this.generateNonce();
        this.candidate = this.template(mempool.getTxIds(), nonce)
        logger.info("CANDIDATE", this.candidate)
        const result = await this.initWorker(this.candidate).catch(err => logger.info(err));
        logger.info("RES", result.block)
        console.log('Mined new block')

        // Add a coinbase transaction to the block
        //  const coinbase: Transaction = (
        //     {
        //     "type": 'transaction',
        //     "height": chainManager.longestChainHeight + 1,
        //     "outputs": [
        //         {'pubkey':'AAAAC3NzaC1lZDI1NTE5AAAAIFBmPHF','value':50000000000000}
        //     ]
        // })
        // mempool.onTransactionArrival(coinbase)

        // await delay(5000)
        if (result.block !== undefined) {
            network.broadcast(result.block, true)
        }
        // console.log('Added our mined block to the chain')

        async function writeBlockToFile(obj: object, filename: string): Promise<void> {
            try {
                const data = JSON.stringify(obj, null, 2) + "\n"; // Convert object to a pretty printed JSON string
                await fs.appendFile(filename, data);
                console.log(`Data written to ${filename}`);
            } catch (error) {
                console.error(`Error writing to ${filename}: ${error}`);
            }
        }

        var filename = 'minedblocks.txt';
        writeBlockToFile(result.block, filename);

        // add to our chain and gossip
        // const final_tx = (
        //     {
        //     "type": "transaction",
        //     "inputs": [
        //         {
        //         "outpoint": {
        //             "txid": hash(canonicalize(coinbase)),
        //             "index": 0
        //         },
        //         "sig": "3869a9ea9e7ed926a7c8b30fb71f6ed151a132b03fd5dae764f015c98271000e7da322dbcfc97af7931c23c0fae060e102446ccff0f54ec00f9978f3a69a6f0f"
        //         }
        //     ],
        //     "outputs": [
        //         {
        //         "pubkey": "3f0bc71a375b574e4bda3ddf502fe1afd99aa020bf6049adfe525d9ad18ff33f",
        //         "value": 50000000000000
        //         }
        //     ]
        // })


    }
}

export const miner = new Miner()
