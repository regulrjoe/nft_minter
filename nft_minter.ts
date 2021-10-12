import { MissedBlockDuringConfirmationError, TezosToolkit, OpKind } from "@taquito/taquito";
import { InMemorySigner } from '@taquito/signer'
import BigNumber from "bignumber.js";
import * as yargs from 'yargs'
import { Logger } from "tslog";

// -------------------- Init Global Logger
const log: Logger = new Logger({
    displayFilePath: 'hidden',
    displayFunctionName : false,
    displayDateTime: false
});

// -----------------------------------------
async function main() {

    // -------------------- Arguments
    let args = yargs
        .usage('node $0 -k private_key -n node')
        .option('private_key', {
            alias: 'k',
            description: "wallet private key to issue the contract call",
            demand: true,
        }).option('address', {
            alias: 'a',
            description: "NFT Crowdsale contract address",
            demand: true
        }).option('price', {
            alias: 'p',
            description: "Price per mint in Mutez",
            demand: true,
            type: 'number'
        }).option('mints', {
            alias: 'm',
            description: "Amount of total mints to attempt",
            demand: false,
            default: 1
        }).option('batch', {
            alias: 'b',
            description: "Amount of mints per batch",
            demand: false,
            default: 1
        }).option('fee', {
            alias: 'f',
            description: "Transaction Fee in Mutez",
            demand: false,
            default: 50000 
        }).option('confirmations', {
            alias: 'c',
            description: "Confirmations per batch operation",
            demand: false,
            default: 1 
        }).option('node', {
            alias: 'n',
            description: "node url",
            demand: false,
            default: "https://rpc.tzbeta.net/"
        }).argv;
    
    const PRIVATE_KEY = String(args['private_key']);
	const CONTRACT_ADDR = String(args['address']);
    const PRICE_PER_MINT = args['price'];
    const MAX_MINTS = args['mints'];
    const MINTS_PER_BATCH = args['batch'];
	const FEE = args['fee'];
	const CONFIRMATIONS = args['confirmations'];
    const NODE_URL = String(args['node']);

    if (PRICE_PER_MINT == 0) {
        log.error(`Set a price per mint (-p)`);
        process.exit();
    }

    log.info("--------------------------------");
    log.info(`Node URL: ${NODE_URL}`);
    log.info(`Smart Contract: ${CONTRACT_ADDR}`);
    // --------------------
    const tezos = new TezosToolkit(NODE_URL.toString());

    // -------------------- Sign into account
    log.info("--------------------------------");
    log.info("Signing into Account...");

    await InMemorySigner.fromSecretKey(PRIVATE_KEY.toString())
        .then((theSigner) => {
            tezos.setProvider({ signer: theSigner });
            return tezos.signer.publicKeyHash();
        })
        .then((publicKeyHash) => {
            log.info(`Account: ${publicKeyHash}.`);
        })
        .catch((error) => {
            log.fatal(`Error: ${error} ${JSON.stringify(error, null, 2)}`);
            process.exit(1);
        });

    const pkh = await tezos.wallet.pkh();

	// ----------------- Load contract

	var contract = await tezos.contract.at(CONTRACT_ADDR);
    
    log.info("Starting minting");
    var total_mints = 0;
    while (total_mints < MAX_MINTS) {

        var transactions = [];
        let mints = 0;
        log.info(`Batching ${MINTS_PER_BATCH} mints`);
        for (; mints < MINTS_PER_BATCH && total_mints+mints < MAX_MINTS; mints++) {
            transactions.push({
                kind: OpKind.TRANSACTION,
                ...contract.methods
                .mint(1)
                .toTransferParams({ amount: PRICE_PER_MINT, fee: FEE, mutez: true})
            });
        }
        
        try {
            let batch = tezos.contract.batch(transactions);
            const op = await batch.send();
            log.info(`Awaiting confirmation on ${op.hash}...`);
            await op.confirmation(CONFIRMATIONS);
            log.info(`Operation injected: https://tzkt.io/${op.hash}`);
    
            total_mints += mints;
            log.info(`${mints} new mints - ${total_mints} total`);
        } catch (err) {
            log.error(err.message);
        }
    }
    log.info("Done");
}

main();