import {map} from 'rxjs/operators';
import {Account, NetworkType, PublicAccount, RepositoryFactoryHttp, TransactionGroup, TransferTransaction} from 'symbol-sdk';


// Network type
const networkType = NetworkType.TEST_NET;

// Recipient (news) private key
const recipientPrivateKey = 'EF7DD84B0F54E972EFFE91E7255DE19CB57A20E1DABC818F9D67A3087E545CC6';
const recipientAccount = Account.createFromPrivateKey(recipientPrivateKey, networkType);

// Sender (user) public key
const senderPublicKey = '58EA0EC771E4D32A6C47677B0A63FAD2D01430549D3B7790D9C8E3203DC47BC1';
const senderPublicAccount = PublicAccount.createFromPublicKey(senderPublicKey, networkType);

// Announcing transaction and and error tracking
const nodeUrl = 'http://api-01.ap-northeast-1.0.10.0.x.symboldev.network:3000';
const repositoryFactory = new RepositoryFactoryHttp(nodeUrl);
const transactionHttp = repositoryFactory.createTransactionRepository();
const transactionHash = 'DBA6E5A979686ACC769265D8659FF6793EB903AEFE065F8811FB3B4F6957F52C';

transactionHttp
    .getTransaction(transactionHash, TransactionGroup.Confirmed)
    .pipe(
        map( (x) => x as TransferTransaction ),
    )
    .subscribe((transaction) => {
        //console.log('Raw message: ', transaction.message.payload);
        console.log('Message: ', recipientAccount.decryptMessage(
            transaction.message,
            senderPublicAccount).payload);
    }, ((err) => console.log(err)));