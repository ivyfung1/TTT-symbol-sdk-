import {
    Account,
    Address,
    AggregateTransaction,
    Deadline,
    KeyGenerator,
    MosaicAddressRestrictionTransaction,
    MosaicId,
    NetworkType,
    RepositoryFactoryHttp,
    UInt64,
} from 'symbol-sdk';

// Network type
const networkType = NetworkType.TEST_NET;

// Retricted mosaic (reward) info
const mosaicIdHex = '62B26D7C9A289AF9';
const mosaicId = new MosaicId(mosaicIdHex);

// Account goes through KYC process (user)
const userRawAddress = 'TBHHBY-LLQYJM-OMUXXD-VSMJJS-YMXP5B-SOREDR-XOY';
const userAddress = Address.createFromRawAddress(userRawAddress);

// Restriction key for reward
const key = 'key';
console.log('key', key.toLowerCase);

const userMosaicAddressRestrictionTransaction = MosaicAddressRestrictionTransaction
    .create(
        Deadline.create(),
        mosaicId, // mosaicId
        KeyGenerator.generateUInt64Key('key'), // restrictionKey
        userAddress, // address
        UInt64.fromUint(1), // newRestrictionValue
        networkType);

// Account runs the KYC process (abc)
const privateKey = '14523D4ACB53FB9C108C196593C0730C852EC9A3CE4D4E292485B61ED1A860CF';
const account = Account.createFromPrivateKey(privateKey, networkType);

const aggregateTransaction = AggregateTransaction.createComplete(
    Deadline.create(),
    [
        userMosaicAddressRestrictionTransaction.toAggregate(account.publicAccount)],
        networkType,
    [],
    UInt64.fromUint(2000000));

// Signing transaction
const networkGenerationHash = '6C1B92391CCB41C96478471C2634C111D9E989DECD66130C0430B5B8D20117CD';
const signedTransaction = account.sign(aggregateTransaction, networkGenerationHash);
console.log('Transaction hax:', signedTransaction.hash);

// Announcing transaction and error tracking
const nodeUrl = 'http://api-01.ap-northeast-1.0.10.0.x.symboldev.network:3000';
const repositoryFactory = new RepositoryFactoryHttp(nodeUrl);
const transactionHttp = repositoryFactory.createTransactionRepository();

transactionHttp
    .announce(signedTransaction)
    .subscribe((x) => console.log(x), (err) => console.error(err));
