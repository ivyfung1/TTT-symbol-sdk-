import {
    Account,
    AggregateTransaction,
    Deadline,
    MosaicDefinitionTransaction,
    MosaicFlags,
    MosaicId,
    MosaicNonce,
    MosaicSupplyChangeAction,
    MosaicSupplyChangeTransaction,
    NetworkType,
    RepositoryFactoryHttp,
    UInt64,
} from 'symbol-sdk';

// Network type
const networkType = NetworkType.TEST_NET;
// Creator account (abc) information
const privateKey = '14523D4ACB53FB9C108C196593C0730C852EC9A3CE4D4E292485B61ED1A860CF'; // address:address: TDSGG4-NJQPET-367KVE-6ZTYE7-TSCZ7P-TE7ORV-4WQ public key: 2E89DF99AB5AAE5E9F56B86F49C8C7DE80E97A5B494CFFD1BF7E46E2D5DED5CF
const account = Account.createFromPrivateKey(privateKey, networkType);

// Mosaic properties
const duration = UInt64.fromUint(0); //non-expiring mosaic -> duration = 0
const isSupplyMutable = true;
const isTransferable = true;
const isRestrictable = true;
const divisibility = 6;

// Defining mosaic properties
const nonce = MosaicNonce.createRandom();
const mosaicDefinitionTransaction = MosaicDefinitionTransaction.create(
    Deadline.create(),
    nonce,
    MosaicId.createFromNonce(nonce, account.address),
    MosaicFlags.create(isSupplyMutable, isTransferable, isRestrictable),
    divisibility,
    duration,
    networkType);

// Mosaic supply
const delta = 1000000000;

// Defining mosaic initial supply
const mosaicSupplyChangeTransaction = MosaicSupplyChangeTransaction.create(
    Deadline.create(),
    mosaicDefinitionTransaction.mosaicId,
    MosaicSupplyChangeAction.Increase,
    UInt64.fromUint(delta * Math.pow(10, divisibility)), // in absolute number
    networkType);

// ****************************************************************************
// Putting 2 transaction together 
const aggregateTransaction = AggregateTransaction.createComplete(
    Deadline.create(),
    [
        mosaicDefinitionTransaction.toAggregate(account.publicAccount),
        mosaicSupplyChangeTransaction.toAggregate(account.publicAccount)],
    networkType,
    [],
    UInt64.fromUint(2000000)); // Max fee sender willing to pay for the transaction to go through, in absolute number

// Signing transaction
const networkGenerationHash = '6C1B92391CCB41C96478471C2634C111D9E989DECD66130C0430B5B8D20117CD';
const signedTransaction = account.sign(aggregateTransaction, networkGenerationHash);
console.log('Payload:', signedTransaction.payload);
console.log('Transaction Hash:', signedTransaction.hash);

// Announcing transaction and and error tracking
const nodeUrl = 'http://api-01.ap-northeast-1.0.10.0.x.symboldev.network:3000';
const repositoryFactory = new RepositoryFactoryHttp(nodeUrl);
const transactionHttp = repositoryFactory.createTransactionRepository();

transactionHttp
    .announce(signedTransaction)
    .subscribe((x) => console.log(x), (err) => console.error(err));

    
