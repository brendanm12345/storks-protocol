import { logger } from './logger'
import { network } from './network'
import { chainManager } from './chain'
import { mempool } from './mempool'
import { AnnotatedError } from './message'
import { miner } from './mining/miner'
import { objectManager } from './object'

const BIND_PORT = 18018
const BIND_IP = '0.0.0.0'

logger.info(`Storks - A Marabu node`)
logger.info(`Brendan McLaughlin & James Stevens`)

async function main() {
  await chainManager.init()
  await mempool.init()
  network.init(BIND_PORT, BIND_IP)
  miner.sendNewWork()

  //
  const finaltx = { type: "object", object: { type: "transaction", inputs: [{ outpoint: { txid: "c5518c86878c14fdf3ae7147283fd8136d9aed4924b0028d9a586ff9709aed91", index: 0 }, sig: "b89fa02649976a3878b0a0caa6f8886f013338078056d0a19426ec8cb11bfe726aae0e58c5991d6cd181aaedc37bedcd851710808c1765f6af7a35e58c535300" }], outputs: [{ pubkey: "3f0bc71a375b574e4bda3ddf502fe1afd99aa020bf6049adfe525d9ad18ff33f", value: 50000000000000 }] } }
  await objectManager.put(finaltx)

}

main()
