//export type ObjectId = string
import { randomBytes } from 'crypto';
import { canonicalize } from "json-canonicalize";
import { Block } from "../block";
import { hash } from "../crypto/hash";
//import { hash } from "../crypto/hash"
import { logger } from "../logger";
import { miner } from './miner';
// const { ObjectId } = require("../object")

import { workerData, parentPort } from 'worker_threads';

const TARGET = '00000000abc00000000000000000000000000000000000000000000000000000'
const TARGET2X = '0000000157800000000000000000000000000000000000000000000000000000'
const TARGET100X = '0000001770100000000000000000000000000000000000000000000000000000'
const TARGET500X = '0000008B8050000000000000000000000000000000000000000000000000000'
const TARGET1000X = '000001174A8000000000000000000000000000000000000000000000000000000'
const TARGET10000X = '000023E950000000000000000000000000000000000000000000000000000000'

async function run() {
    try {

        if (!parentPort) throw new Error('not a worker')

        // Call the checkPow() function and wait for it to resolve
        const result = await checkPow();
        parentPort.postMessage({ block: result })

        function incrementNonce(nonce: string): string {
            const nonceArray = new Uint8Array(32);
            for (let i = 0; i < nonce.length; i += 2) {
              nonceArray[i / 2] = parseInt(nonce.slice(i, i + 2), 16);
            }
            for (let i = nonceArray.length - 1; i >= 0; i--) {
              nonceArray[i]++;
              if (nonceArray[i] !== 0) {
                break;
              }
            }
            return Array.from(nonceArray, byte => ('0' + byte.toString(16)).slice(-2)).join('');
          }
          
        async function checkPow() {
            // pick a random nonce
            //workerData.nonce = "15551b5116783ace79cf19d95cca707a94f48e4cc69f3db32f41081dab3e6641"
            console.log("CNADIDAT", workerData.nonce)
            console.log("mining...")
            while (true) {
                const blockId = hash(canonicalize(workerData))
                if (BigInt(`0x${blockId}`) <= BigInt(`0x${TARGET}`)) {
                    // if it satisfies
                    logger.info("GOT ONE")
                    return workerData
                }
                // if it doesn't satisfy PoW, increment nonce
                else {
                    workerData.nonce = incrementNonce(workerData.nonce)
                    // alt alg: workerData.nonce = miner.generateNonce()
                    
                }
            }
        }
    } catch (e: any) {
        logger.info(e, "worker")
    }
}

run();
