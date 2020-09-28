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

// Assign key and value
const key = KeyGenerator.generateUInt64Key('Membership');
const value = 'GOLD';

// Assingee account
const assingeePublicKey = '58EA0EC771E4D32A6C47677B0A63FAD2D01430549D3B7790D9C8E3203DC47BC1'; 
const assigneePublicAccount = PublicAccount.createFromPublicKey(assingeePublicKey, networkType);

const accountMetadataTransaction = AccountMetadataTransaction.create(
    Deadline.create(),
    assigneePublicAccount.address,
    key,
    value.length,
    value,
    networkType
);

// Assignor account
const assignorPrivateKey = '1B47C3B875D63225E16DC3429DE5D62F8EA76724D8B2C3FE5A14A8A2C82EE17E';
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
console.log(signedTransaction.hash);

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
const signedHashLockTransaction = bobAccount.sign(hashLockTransaction, networkGenerationHash);
/* end block 04 */

// Announcing transaction and and error tracking
const nodeUrl = 'http://api-01.us-east-1.096x.symboldev.network:3000';
const repositoryFactory = new RepositoryFactoryHttp(nodeUrl);
const listener = repositoryFactory.createListener(); // what it is listening to specifically
const receiptHttp = repositoryFactory.createReceiptRepository(); // get receipt for metadata ?
const transactionHttp = repositoryFactory.createTransactionRepository(); 
const transactionService = new TransactionService(transactionHttp, receiptHttp); // https://github.com/nemtech/symbol-sdk-typescript-javascript/blob/main/src/service/TransactionService.ts

listener.open().then(() => {
    transactionService
        .announceHashLockAggregateBonded(signedHashLockTransaction, signedTransaction, listener)
        .subscribe(
            (x) => console.log(x),
            (err) => console.log(err),
            () => listener.close());
});
