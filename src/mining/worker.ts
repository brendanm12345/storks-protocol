import { canonicalize } from "json-canonicalize"
import { Block } from "../block"
import { hash } from "../crypto/hash"

const { candidate, parentPort } = require('worker_threads')

const TARGET = '00000000abc00000000000000000000000000000000000000000000000000000'


// miner takes in work AKA block template with X bar


// for loop to increment nonce and see if it satisfies PoW for

parentPort.postMessage(checkPow(candidate))

function checkPow(candidate: any) {
    // pick a random nonce
    // put that nonce in the candidate nonce field
    // hash the updated candidate
    // make a loop to increment nonce
        // if it doesn't satisfy PoW, increment nonce
        const candidateId = hash(canonicalize(candidate.toNetworkObject()))
        if  (BigInt(`0x${candidateId}`) >= BigInt(`0x${TARGET}`)) {
            // increment nonce

        }
        // if it satisfies
        else {
            // found one! return the candidate
            return candidate
        }
}




