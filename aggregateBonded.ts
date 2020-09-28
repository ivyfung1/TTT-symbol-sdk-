import {
    Account,
    AggregateTransaction,
    Deadline,
    HashLockTransaction,
    Mosaic,
    MosaicId,
    NetworkType,
    PlainMessage,
    RepositoryFactoryHttp,
    TransactionService,
    TransferTransaction,
    UInt64,
} from 'symbol-sdk';

// Network type 
const networkType = NetworkType.TEST_NET;

// abc account
const alicePrivateKey = '14523D4ACB53FB9C108C196593C0730C852EC9A3CE4D4E292485B61ED1A860CF';
const aliceAccount = Account.createFromPrivateKey(alicePrivateKey, networkType);

// user account
const privateKey = 'CCB2C677FE921BBBFB60EA60E270A2B6592B72C848F55F8885C39B95E97E00A6';
const sellerAccount = Account.createFromPrivateKey(privateKey, networkType); 

// Mosaic to be transfer 
const ticketMosaicId = new MosaicId('62B26D7C9A289AF9');
const ticketDivisibility = 6;

// Native currency
const networkCurrencyMosaicId = new MosaicId('5B66E76BECAD0860');
const networkCurrencyDivisibility = 6;

const aliceToTicketDistributorTx = TransferTransaction.create(
    Deadline.create(),
    sellerAccount.address,
    [new Mosaic (networkCurrencyMosaicId,
        UInt64.fromUint(10 * Math.pow(10, networkCurrencyDivisibility)))],
    PlainMessage.create('send 100 symbol.xym to distributor'),
    networkType);

const ticketDistributorToAliceTx = TransferTransaction.create(
    Deadline.create(),
    aliceAccount.address,
    [new Mosaic(ticketMosaicId,
        UInt64.fromUint(10 * Math.pow(10, ticketDivisibility)))],
    PlainMessage.create('send 1 museum ticket to customer'),
    networkType);

// Putting all transactions together
const aggregateTransaction = AggregateTransaction.createBonded(
    Deadline.create(),
    [aliceToTicketDistributorTx.toAggregate(aliceAccount.publicAccount),
        ticketDistributorToAliceTx.toAggregate(sellerAccount.publicAccount)],
    networkType,
    [], //cosignatures 
    UInt64.fromUint(2000000));

// Signing transaction
const networkGenerationHash = '6C1B92391CCB41C96478471C2634C111D9E989DECD66130C0430B5B8D20117CD';
const signedTransaction = aliceAccount.sign(aggregateTransaction, networkGenerationHash);
console.log('Aggregate Transaction Hash:', signedTransaction.hash);

// Preparing hacklock transaction
const hashLockTransaction = HashLockTransaction.create(
    Deadline.create(),
    new Mosaic (networkCurrencyMosaicId,
        UInt64.fromUint(10 * Math.pow(10, networkCurrencyDivisibility))),
    UInt64.fromUint(480), // in block
    signedTransaction,
    networkType,
    UInt64.fromUint(2000000));

// Signed hashlock
const signedHashLockTransaction = aliceAccount.sign(hashLockTransaction, networkGenerationHash);
console.log(hashLockTransaction.hash)

// Announcing transaction and and error tracking
const nodeUrl = 'http://api-01.ap-northeast-1.0.10.0.x.symboldev.network:3000';
const repositoryFactory = new RepositoryFactoryHttp(nodeUrl);
const listener = repositoryFactory.createListener(); 
const receiptHttp = repositoryFactory.createReceiptRepository(); 
const transactionHttp = repositoryFactory.createTransactionRepository();
const transactionService = new TransactionService(transactionHttp, receiptHttp); 

listener.open().then(() => {
    transactionService
        .announceHashLockAggregateBonded(signedHashLockTransaction, signedTransaction, listener)
        .subscribe(
            (x) => console.log(x),
            (err) => console.log(err),
            () => listener.close());
  
});
