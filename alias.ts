import {
    Account,
    Address,
    AliasAction,
    AliasTransaction,
    Deadline,
    NamespaceId,
    NetworkType,
    RepositoryFactoryHttp,
    UInt64,
} from 'symbol-sdk';

// NetworkType
const networkType = NetworkType.TEST_NET;
// Namespace to be linked
const namespaceId = new NamespaceId('cba');
// Account of namespace owner (acb) 
const privateKey = '';
const publickey = '58EA0EC771E4D32A6C47677B0A63FAD2D01430549D3B7790D9C8E3203DC47BC1'
const account = Account.createFromPrivateKey(privateKey, networkType);

// Account t
const address = Address.createFromPublicKey(publickey, networkType);

const addressAliasTransaction = AliasTransaction.createForAddress(
    Deadline.create(),
    AliasAction.Link,
    namespaceId,
    address,
    networkType,
    UInt64.fromUint(2000000));

// Signing transaction
const networkGenerationHash = '6C1B92391CCB41C96478471C2634C111D9E989DECD66130C0430B5B8D20117CD';
const signedTransaction = account.sign(addressAliasTransaction, networkGenerationHash);
console.log('Transaction Hash:', signedTransaction.hash);

// Announcing transaction and error tracking
const nodeUrl = 'http://api-01.ap-northeast-1.0.10.0.x.symboldev.network:3000';
const repositoryFactory = new RepositoryFactoryHttp(nodeUrl);
const transactionHttp = repositoryFactory.createTransactionRepository();

transactionHttp
    .announce(signedTransaction)
    .subscribe((x) => console.log(x), (err) => console.error(err));
/* end block 02 */