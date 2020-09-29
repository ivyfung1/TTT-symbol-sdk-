import {
    Account,
    AggregateTransaction,
    Deadline,
    HashLockTransaction,
    Mosaic,
    MosaicId,
    MultisigAccountModificationTransaction,
    NetworkType,
    PublicAccount,
    RepositoryFactoryHttp,
    TransactionService,
    UInt64,
} from 'symbol-sdk';

// Network type
const networkType = NetworkType.TEST_NET;

// Candidate multisig account (user) private key
const privateKey = '14523D4ACB53FB9C108C196593C0730C852EC9A3CE4D4E292485B61ED1A860CF';
const account = Account.createFromPrivateKey(privateKey, networkType);

// Cosignatory 1 (news) public key
const cosignatory1PublicKey = '180FABD5EC7C35910DFB617388401382EDA114AA4B47C5436E83913961D9413E';
const cosignatory1 = PublicAccount.createFromPublicKey(cosignatory1PublicKey, networkType);

// Cosignatory 2 (abc2) public key
const cosignatory2PublicKey = '60FAE3A39D580BB5118686569D159E3F2B991504D3ED0A304C3B7DA5FCCD0353';
const cosignatory2 = PublicAccount.createFromPublicKey(cosignatory2PublicKey, networkType);

// Putting 
const multisigAccountModificationTransaction = MultisigAccountModificationTransaction.create(
    Deadline.create(),
    1, // min approval
    1, // min removal
    [cosignatory1.address, cosignatory2.address],
    [],
    networkType);

const aggregateTransaction = AggregateTransaction.createBonded(
    Deadline.create(),
    [multisigAccountModificationTransaction.toAggregate(account.publicAccount)],
    networkType,
    [],
    UInt64.fromUint(2000000));

// Signing transaction
const networkGenerationHash = '6C1B92391CCB41C96478471C2634C111D9E989DECD66130C0430B5B8D20117CD';
const signedTransaction = account.sign(aggregateTransaction, networkGenerationHash);
console.log('Transaction hash:', signedTransaction.hash);

// Native currency
const networkCurrencyMosaicId = new MosaicId('5B66E76BECAD0860');
const networkCurrencyDivisibility = 6;

// Create hashlock transaction
const hashLockTransaction = HashLockTransaction.create(
    Deadline.create(),
    new Mosaic(networkCurrencyMosaicId,
        UInt64.fromUint(10 * Math.pow(10, networkCurrencyDivisibility))),
    UInt64.fromUint(480),
    signedTransaction,
    networkType,
    UInt64.fromUint(2000000));

const signedHashLockTransaction = account.sign(hashLockTransaction, networkGenerationHash);
console.log('Hasklock tx hash:', signedHashLockTransaction);

// Announcing transaction and error tracking
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