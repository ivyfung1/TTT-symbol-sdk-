import {
    Account,
    Address,
    Deadline,
    NetworkType,
    RepositoryFactoryHttp,
    TransferTransaction,
    UInt64,
    PublicAccount,
} from 'symbol-sdk';

// Network type
const networkType = NetworkType.TEST_NET;

// Sender information
const privateKey = 'CCB2C677FE921BBBFB60EA60E270A2B6592B72C848F55F8885C39B95E97E00A6';
const senderAccount = Account.createFromPrivateKey(privateKey, networkType); // Address: TBHHBY-LLQYJM-OMUXXD-VSMJJS-YMXP5B-SOREDR-XOY  Public Key: 58EA0EC771E4D32A6C47677B0A63FAD2D01430549D3B7790D9C8E3203DC47BC1

// Recipient info (news)
const recipientPublicKey = '180FABD5EC7C35910DFB617388401382EDA114AA4B47C5436E83913961D9413E'; //address: TC43VW-NY734J-TNQARX-K63VBB-C4FYSA-KG425W-CKI, private key: EF7DD84B0F54E972EFFE91E7255DE19CB57A20E1DABC818F9D67A3087E545CC6
const recipientPublicAccount = PublicAccount.createFromPublicKey(recipientPublicKey, networkType);
const recipientAddress = Address.createFromPublicKey(recipientPublicKey, networkType); 

// Set message
const message = '123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123'
const encryptedMessage = senderAccount.encryptMessage(message, recipientPublicAccount);

const transferTransaction = TransferTransaction.create(
    Deadline.create(),
    recipientAddress,
    [], 
    encryptedMessage, 
    networkType,
    UInt64.fromUint(2000000));

// Signing transaction
const networkGenerationHash = '6C1B92391CCB41C96478471C2634C111D9E989DECD66130C0430B5B8D20117CD';
const signedTransaction = senderAccount.sign(transferTransaction, networkGenerationHash);
console.log('Payload:', signedTransaction.payload);
console.log('Transaction Hash:', signedTransaction.hash);

// Announcing transaction and and error tracking
const nodeUrl = 'http://api-01.ap-northeast-1.0.10.0.x.symboldev.network:3000';
const repositoryFactory = new RepositoryFactoryHttp(nodeUrl);
const transactionHttp = repositoryFactory.createTransactionRepository();

transactionHttp
    .announce(signedTransaction)
    .subscribe((x) => console.log(x), (err) => console.error(err));