import {
    Account,
    Deadline,
    KeyGenerator,
    MosaicGlobalRestrictionTransaction,
    MosaicId,
    MosaicRestrictionType,
    NetworkType,
    RepositoryFactoryHttp,
    UInt64,
} from 'symbol-sdk';

// Mosaic (reward) to be restricted globally
const mosaicIdHex = '62B26D7C9A289AF9';
const mosaicId = new MosaicId(mosaicIdHex);
const key = KeyGenerator.generateUInt64Key('KYC'.toLowerCase());

// Network type
const networkType = NetworkType.TEST_NET;

const transaction = MosaicGlobalRestrictionTransaction
    .create(
        Deadline.create(),
        mosaicId, // mosaicId
        key, // restrictionKey
        UInt64.fromUint(0), // previousRestrictionValue
        MosaicRestrictionType.NONE, // previousRestrictionType
        UInt64.fromUint(1), // newRestrictionValue
        MosaicRestrictionType.EQ, // newRestrictionType
        networkType,
        undefined,
        UInt64.fromUint(2000000));

// Owner (abc) private key
const privateKey = '14523D4ACB53FB9C108C196593C0730C852EC9A3CE4D4E292485B61ED1A860CF';
const account = Account.createFromPrivateKey(privateKey, networkType);

// Signing transaction
const networkGenerationHash = '6C1B92391CCB41C96478471C2634C111D9E989DECD66130C0430B5B8D20117CD';
const signedTransaction = account.sign(transaction, networkGenerationHash);
console.log(signedTransaction.hash);

// Announcing transaction and error tracking
const nodeUrl = 'http://api-01.ap-northeast-1.0.10.0.x.symboldev.network:3000';
const repositoryFactory = new RepositoryFactoryHttp(nodeUrl);
const transactionHttp = repositoryFactory.createTransactionRepository();

transactionHttp
    .announce(signedTransaction)
    .subscribe((x) => console.log(x), (err) => console.error(err));