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
const key = KeyGenerator.generateUInt64Key('CERT');
const value = '123456';

// Assingee account
const assingeePublicKey = '7EA792DBF275E691FCD4B628C61D5D193CCB75B0BCD40513962C10B3C5C255CE'; // Alice's account 
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
const networkGenerationHash = '1DFB2FAA9E7F054168B0C5FCB84F4DEB62CC2B4D317D861F3168D161F54EA78B';
const signedTransaction = assignorAccount.sign(aggregateTransaction, networkGenerationHash);
console.log(signedTransaction.hash);

// Native currency
const networkCurrencyMosaicId = new MosaicId('5E62990DCAC5BE8A');
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