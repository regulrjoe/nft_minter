"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var taquito_1 = require("@taquito/taquito");
var signer_1 = require("@taquito/signer");
var yargs = require("yargs");
var tslog_1 = require("tslog");
// -------------------- Init Global Logger
var log = new tslog_1.Logger({
    displayFilePath: 'hidden',
    displayFunctionName: false,
    displayDateTime: false
});
// -----------------------------------------
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var args, PRIVATE_KEY, CONTRACT_ADDR, PRICE_PER_MINT, MAX_MINTS, MINTS_PER_BATCH, FEE, CONFIRMATIONS, NODE_URL, tezos, pkh, contract, total_mints, transactions, mints, batch, op, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    args = yargs
                        .usage('node $0 -k private_key -n node')
                        .option('private_key', {
                        alias: 'k',
                        description: "wallet private key to issue the contract call",
                        demand: true
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
                        "default": 1
                    }).option('batch', {
                        alias: 'b',
                        description: "Amount of mints per batch",
                        demand: false,
                        "default": 1
                    }).option('fee', {
                        alias: 'f',
                        description: "Transaction Fee in Mutez",
                        demand: false,
                        "default": 50000
                    }).option('confirmations', {
                        alias: 'c',
                        description: "Confirmations per batch operation",
                        demand: false,
                        "default": 1
                    }).option('node', {
                        alias: 'n',
                        description: "node url",
                        demand: false,
                        "default": "https://rpc.tzbeta.net/"
                    }).argv;
                    PRIVATE_KEY = String(args['private_key']);
                    CONTRACT_ADDR = String(args['address']);
                    PRICE_PER_MINT = args['price'];
                    MAX_MINTS = args['mints'];
                    MINTS_PER_BATCH = args['batch'];
                    FEE = args['fee'];
                    CONFIRMATIONS = args['confirmations'];
                    NODE_URL = String(args['node']);
                    if (PRICE_PER_MINT == 0) {
                        log.error("Set a price per mint (-p)");
                        process.exit();
                    }
                    log.info("--------------------------------");
                    log.info("Node URL: " + NODE_URL);
                    log.info("Smart Contract: " + CONTRACT_ADDR);
                    tezos = new taquito_1.TezosToolkit(NODE_URL.toString());
                    // -------------------- Sign into account
                    log.info("--------------------------------");
                    log.info("Signing into Account...");
                    return [4 /*yield*/, signer_1.InMemorySigner.fromSecretKey(PRIVATE_KEY.toString())
                            .then(function (theSigner) {
                            tezos.setProvider({ signer: theSigner });
                            return tezos.signer.publicKeyHash();
                        })
                            .then(function (publicKeyHash) {
                            log.info("Account: " + publicKeyHash + ".");
                        })["catch"](function (error) {
                            log.fatal("Error: " + error + " " + JSON.stringify(error, null, 2));
                            process.exit(1);
                        })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, tezos.wallet.pkh()];
                case 2:
                    pkh = _a.sent();
                    return [4 /*yield*/, tezos.contract.at(CONTRACT_ADDR)];
                case 3:
                    contract = _a.sent();
                    log.info("Starting minting");
                    total_mints = 0;
                    _a.label = 4;
                case 4:
                    if (!(total_mints < MAX_MINTS)) return [3 /*break*/, 10];
                    transactions = [];
                    mints = 0;
                    log.info("Batching " + MINTS_PER_BATCH + " mints");
                    for (; mints < MINTS_PER_BATCH && total_mints + mints < MAX_MINTS; mints++) {
                        transactions.push(__assign({ kind: taquito_1.OpKind.TRANSACTION }, contract.methods
                            .mint(1)
                            .toTransferParams({ amount: PRICE_PER_MINT, fee: FEE, mutez: true })));
                    }
                    _a.label = 5;
                case 5:
                    _a.trys.push([5, 8, , 9]);
                    batch = tezos.contract.batch(transactions);
                    return [4 /*yield*/, batch.send()];
                case 6:
                    op = _a.sent();
                    log.info("Awaiting confirmation on " + op.hash + "...");
                    return [4 /*yield*/, op.confirmation(CONFIRMATIONS)];
                case 7:
                    _a.sent();
                    log.info("Operation injected: https://tzkt.io/" + op.hash);
                    total_mints += mints;
                    log.info(mints + " new mints - " + total_mints + " total");
                    return [3 /*break*/, 9];
                case 8:
                    err_1 = _a.sent();
                    log.error(err_1.message);
                    return [3 /*break*/, 9];
                case 9: return [3 /*break*/, 4];
                case 10:
                    log.info("Done");
                    return [2 /*return*/];
            }
        });
    });
}
main();
