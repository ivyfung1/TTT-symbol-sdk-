import {
    Account,
    Deadline,
    NamespaceRegistrationTransaction,
    NetworkType,
    RepositoryFactoryHttp,
    UInt64,
} from 'symbol-sdk';


// Namespace name
const namespaceName = 'abc';
// Duration (in blocks)
const duration = UInt64.fromUint(172800); //60 days
// Network type
const networkType = NetworkType.TEST_NET;

const namespaceRegistrationTransaction = NamespaceRegistrationTransaction.createRootNamespace(
    Deadline.create(),
    namespaceName,
    duration,
    networkType,
    UInt64.fromUint(2000000));

// Creator account (user) information
const privateKey = '14523D4ACB53FB9C108C196593C0730C852EC9A3CE4D4E292485B61ED1A860CF'; 
const account = Account.createFromPrivateKey(privateKey, networkType);

// Signing transaction
const networkGenerationHash = '6C1B92391CCB41C96478471C2634C111D9E989DECD66130C0430B5B8D20117CD';
const signedTransaction = account.sign(namespaceRegistrationTransaction, networkGenerationHash);
console.log('Transaction Hash:', signedTransaction.hash);

// Announcing transaction and error tracking
const nodeUrl = 'http://api-01.ap-northeast-1.0.10.0.x.symboldev.network:3000';
const repositoryFactory = new RepositoryFactoryHttp(nodeUrl);
const transactionHttp = repositoryFactory.createTransactionRepository();

transactionHttp
    .announce(signedTransaction)
    .subscribe((x) => console.log(x), (err) => console.error(err));
