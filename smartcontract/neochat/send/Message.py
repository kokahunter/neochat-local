from boa.interop.Neo.Runtime import Notify, Log, GetTime, Serialize, Deserialize
from boa.builtins import concat, list
from boa.interop.Neo.Storage import Get

from storage.StorageHelper import IncrementThree, PutThree, IncrementOne, PutTwo, GetThree, ValidateIPFS

def sendMessage(ctx, sender, receiver, message, ipfs, encrypted):
    """
    Send message
    
    Args:
        sender -> sender address
        receiver -> receiver address
        message -> Contains the message or the ipfs hash
        ipfs -> Boolean if ipfs is used
        encrypted -> Boolean if message is encrypted
    
    A = scripthash of sender
    storage A.send.{index}
        stores the sent message from A for respective index
    storage A.send.latest
        stores the index of the last message sent from A
    
    Receiver B = scripthash of receiver
    storage B.receive.{index}
        stores the received message for the recipient B for the respective index
    storage B.receive.latest
        stores the index of the last message received for B
    """
    time = GetTime()
    Log('time')
    Notify(concat('time',time))
    
    if not ValidateIPFS(ipfs):
        return False

    # Add message header  for sender
    addMessage(ctx,sender,'.send.',message,receiver,time, ipfs, encrypted)
    # Add message header for recipient
    addMessage(ctx,receiver,'.receive.',message,sender,time, ipfs, encrypted)
    return True

def addMessage(ctx,party,direction,message,partySecond,time, ipfs, encrypted):
    newLastIndex = IncrementThree(ctx,party,direction,"latest")
    messageData = [message,time,partySecond, ipfs, encrypted]
    messageTemp = Serialize(messageData)
    PutThree(ctx,party,direction,newLastIndex,messageTemp)
    return True