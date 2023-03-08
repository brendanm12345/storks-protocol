//export type ObjectId = string
const { randomBytes } = require('crypto');
const { canonicalize } = require("json-canonicalize")
const { Block } = require("../block")
const { hash } = require("../crypto/hash")
//import { hash } from "../crypto/hash"
const { logger } = require("../logger")
// const { ObjectId } = require("../object")

const { candidate, parentPort } = require('worker_threads')

const TARGET = '00000000abc00000000000000000000000000000000000000000000000000000'
const TARGET2X = '0000000157800000000000000000000000000000000000000000000000000000'

parentPort.postMessage(checkPow(candidate))

async function checkPow(candidate: any): Promise<any>{
    // pick a random nonce
    const nonceSize = 8;
    
    let nonce = randomBytes(nonceSize).readUIntLE(0, nonceSize)
    candidate.nonce = nonce
    const candidateId = hash(canonicalize(candidate))
    while (true) {
        // if it doesn't satisfy PoW, increment nonce
        if (BigInt(`0x${candidateId}`) > BigInt(`0x${TARGET2X}`)) {
            nonce++;
        }
        // if it satisfies
        else {
            // found one! return the candidate
            logger.info("GOT ONE")
            return candidate
        }
    }

}




