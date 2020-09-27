import {
    Account,
    AggregateTransaction,
    AliasAction,
    AliasTransaction,
    Deadline,
    NamespaceRegistrationTransaction,
    NetworkType,
    PublicAccount,
    RepositoryFactoryHttp,
    UInt64,
    MosaicId,
} from 'symbol-sdk';


// Subnamespace info
const namespaceName = 'reward';
const parentName = 'abc'
const duration = UInt64.fromUint(86400); //30 days, in blocks 

// Mosaic info
const mosaicId = '62B26D7C9A289AF9'

// Network type
const networkType = NetworkType.TEST_NET;

// Creator account (abc) information
const privateKey = '14523D4ACB53FB9C108C196593C0730C852EC9A3CE4D4E292485B61ED1A860CF'; 
const account = Account.createFromPrivateKey(privateKey, networkType);
const publickey = '2E89DF99AB5AAE5E9F56B86F49C8C7DE80E97A5B494CFFD1BF7E46E2D5DED5CF';
const publicAccount = PublicAccount.createFromPublicKey(publickey,networkType);

// Create Subnamespace
const namespaceRegistrationTransaction = NamespaceRegistrationTransaction.createSubNamespace(
    Deadline.create(),
    namespaceName,
    parentName,
    networkType);

// Alias subnamespace to mosaic
const aliasSubnamespaceToMosaic = AliasTransaction.createForMosaic
(
    Deadline.create(),
    AliasAction.Link,
    namespaceRegistrationTransaction.namespaceId,
    mosaicId,
    networkType);

// Putting 2 transactions together
const aggregateTransaction = AggregateTransaction.createComplete(
    Deadline.create(),
    [namespaceRegistrationTransaction.toAggregate(account.publicAccount),
        aliasSubnamespaceToMosaic.toAggregate(account.publicAccount)],
    networkType,
    [], // cosignatories go here
    UInt64.fromUint(2000000));

// Signing transaction
const networkGenerationHash = '1DFB2FAA9E7F054168B0C5FCB84F4DEB62CC2B4D317D861F3168D161F54EA78B';
const signedTransaction = account.sign(aggregateTransaction, networkGenerationHash);
console.log('Aggregate Transaction Hash:', signedTransaction.hash);

// Announcing transaction and error tracking
const nodeUrl = 'http://api-01.ap-northeast-1.0.10.0.x.symboldev.network:3000';
const repositoryFactory = new RepositoryFactoryHttp(nodeUrl);
const transactionHttp = repositoryFactory.createTransactionRepository();

transactionHttp
    .announce(signedTransaction)
    .subscribe((x) => console.log(x), (err) => console.error(err));
