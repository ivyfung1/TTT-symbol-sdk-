import {
    Account,
    AccountMetadataTransaction,
    AggregateTransaction,
    Deadline,
    HashLockTransaction,
    KeyGenerator,
    Mosaic,
    MosaicId,
    NetworkType,
    PublicAccount,
    RepositoryFactoryHttp,
    TransactionService,
    UInt64,
} from 'symbol-sdk';

// Network type
const networkType = NetworkType.TEST_NET;

// Assigned key and value
const key = KeyGenerator.generateUInt64Key('Membership');
const value = 'GOLD';

// Assingee (user) account
const assingeePublicKey = '58EA0EC771E4D32A6C47677B0A63FAD2D01430549D3B7790D9C8E3203DC47BC1'; 
const assigneePublicAccount = PublicAccount.createFromPublicKey(assingeePublicKey, networkType);

const accountMetadataTransaction = AccountMetadataTransaction.create(
    Deadline.create(),
    assigneePublicAccount.address,
    key,
    value.length,
    value,
    networkType);

// Assignor (abc) account
const assignorPrivateKey = '14523D4ACB53FB9C108C196593C0730C852EC9A3CE4D4E292485B61ED1A860CF';
const assignorAccount = Account.createFromPrivateKey(assignorPrivateKey, networkType);

const aggregateTransaction = AggregateTransaction.createBonded(
    Deadline.create(),
    [accountMetadataTransaction.toAggregate(assignorAccount.publicAccount)],
    networkType,
    [],
    UInt64.fromUint(2000000));

// Signing transaction
const networkGenerationHash = '6C1B92391CCB41C96478471C2634C111D9E989DECD66130C0430B5B8D20117CD';
const signedTransaction = assignorAccount.sign(aggregateTransaction, networkGenerationHash);
console.log('Transaction hash:', signedTransaction.hash);

// Native currency
const networkCurrencyMosaicId = new MosaicId('5B66E76BECAD0860');
const networkCurrencyDivisibility = 6;

const hashLockTransaction = HashLockTransaction.create(
    Deadline.create(),
    new Mosaic(networkCurrencyMosaicId,
        UInt64.fromUint(10 * Math.pow(10, networkCurrencyDivisibility))),
    UInt64.fromUint(480), 
    signedTransaction,
    networkType,
    UInt64.fromUint(2000000));

// Sign hacklock transaction
const signedHashLockTransaction = assignorAccount.sign(hashLockTransaction, networkGenerationHash);
console.log('HashLock Hash:', signedHashLockTransaction.hash);

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