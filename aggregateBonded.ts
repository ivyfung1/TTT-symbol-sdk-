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

// Alice account
const alicePrivateKey = '185EFD9F86BDB452153CE46E1EBDBEBEF44DB12F7079DF0634564F08C630C166';
const aliceAccount = Account.createFromPrivateKey(alicePrivateKey, networkType);// address = TDXNDD4FW7E5JZH3747VUIMUX2FPFB7LRVEKFCI
// Seller account
const privateKey = '1B47C3B875D63225E16DC3429DE5D62F8EA76724D8B2C3FE5A14A8A2C82EE17E';
const sellerAccount = Account.createFromPrivateKey(privateKey, networkType); // address = TA7MXUV4O5UBRR6PTHCJPX3M6HVOBOOQ2J4FTYY

// Mosaic to be transfer - ticket
const ticketMosaicId = new MosaicId('53F970DF639EE211');
const ticketDivisibility = 0;

// Native currency
const networkCurrencyMosaicId = new MosaicId('5E62990DCAC5BE8A');
const networkCurrencyDivisibility = 6;

const aliceToTicketDistributorTx = TransferTransaction.create(
    Deadline.create(),
    sellerAccount.address,
    [new Mosaic (networkCurrencyMosaicId,
        UInt64.fromUint(100 * Math.pow(10, networkCurrencyDivisibility)))],
    PlainMessage.create('send 100 symbol.xym to distributor'),
    networkType);

const ticketDistributorToAliceTx = TransferTransaction.create(
    Deadline.create(),
    aliceAccount.address,
    [new Mosaic(ticketMosaicId,
        UInt64.fromUint(1 * Math.pow(10, ticketDivisibility)))],
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
const networkGenerationHash = '1DFB2FAA9E7F054168B0C5FCB84F4DEB62CC2B4D317D861F3168D161F54EA78B';
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
const nodeUrl = 'http://xym66940.allnodes.me:3000';
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
