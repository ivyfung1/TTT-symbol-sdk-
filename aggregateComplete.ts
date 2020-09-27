import {
    Account,
    Address,
    AggregateTransaction,
    Deadline,
    Mosaic,
    MosaicId,
    NetworkType,
    PlainMessage,
    RepositoryFactoryHttp,
    TransferTransaction,
    UInt64,
} from 'symbol-sdk';

// Network type
const networkType = NetworkType.TEST_NET;

// Sender account
const privateKey = '1B47C3B875D63225E16DC3429DE5D62F8EA76724D8B2C3FE5A14A8A2C82EE17E';
const account = Account.createFromPrivateKey(privateKey, networkType);

// Recipient accounts
const aliceAddress =  'TDXNDD4FW7E5JZH3747VUIMUX2FPFB7LRVEKFCI';
const aliceAccount = Address.createFromRawAddress(aliceAddress);
const bobAddress = 'TANVHP-DTVDMN-7WG75Y-VZT3Z3-WMIXOG-HKKIBU-DTI'; // privatekey = FE2A6C8FED2BA0F60256FB66ED95F32A9DE54D663941E1EA19A999FA55EE9A1B, publickey = 6A35C090C9FDADC52FE868D9C2DE133AB87640577FCC9BDE277C515396728AB9
const bobAccount = Address.createFromRawAddress(bobAddress);

// Native currency
const networkCurrencyMosaicId = new MosaicId('5E62990DCAC5BE8A');
const networkCurrencyDivisibility = 6;

const aliceTransferTransaction = TransferTransaction.create(
    Deadline.create(),
    aliceAccount,
    [ new Mosaic(networkCurrencyMosaicId, UInt64.fromUint(50 * Math.pow(10, networkCurrencyDivisibility)))],
    PlainMessage.create('monthly payout'),
    networkType);
const bobTransferTransaction = TransferTransaction.create(
    Deadline.create(),
    bobAccount,
    [new Mosaic(networkCurrencyMosaicId, UInt64.fromUint(20 * Math.pow(10, networkCurrencyDivisibility)))],
    PlainMessage.create('monthly payout'),
    networkType);

// Putting all transactions together
const aggregateTransaction = AggregateTransaction.createComplete(
    Deadline.create(),
    [aliceTransferTransaction.toAggregate(account.publicAccount),
        bobTransferTransaction.toAggregate(account.publicAccount)],
    networkType,
    [], // cosignatories go here
    UInt64.fromUint(2000000));

// Signing transaction
const networkGenerationHash = '1DFB2FAA9E7F054168B0C5FCB84F4DEB62CC2B4D317D861F3168D161F54EA78B';
const signedTransaction = account.sign(aggregateTransaction, networkGenerationHash);
console.log('Payload:', signedTransaction.payload);
console.log('Transaction Hash:', signedTransaction.hash);

// Announcing transaction and and error tracking
const nodeUrl = 'http://xym66940.allnodes.me:3000';
const repositoryFactory = new RepositoryFactoryHttp(nodeUrl);
const transactionHttp = repositoryFactory.createTransactionRepository();

transactionHttp
    .announce(signedTransaction)
    .subscribe((x) => console.log(x), (err) => console.error(err));
