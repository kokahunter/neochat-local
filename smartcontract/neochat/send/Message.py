from boa.interop.Neo.Runtime import Notify, Log, GetTime, Serialize, Deserialize
from boa.builtins import concat, list

from storage.StorageHelper import IncrementThree, PutThree

def sendMessage(ctx, args):
    # Args
    sender = args[0]
    receiver = args[1]
    # messageA: for "encrypt-to-self". encrypted with public key from A (sender).
    messageA = args[2]
    # messageB: encrypted with public key from B (receiver).
    messageB = args[3]
    time = GetTime()
    Log('time')
    Notify(concat('time',time))
    """
        Sender A = scripthash of sender
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
    
    # Add message "envrypt-to-self"
    addMessage(ctx,sender,'.send.',messageA,receiver,time)
    # Add message for recipient
    addMessage(ctx,receiver,'.receive.',messageB,sender,time)
    return True

def addMessage(ctx,party,direction,message,partySecond,time):
    newLastIndex = IncrementThree(ctx,party,direction,"latest")
    messageData = [message,time,partySecond]
    messageTemp = Serialize(messageData)
    PutThree(ctx,party,direction,newLastIndex,messageTemp)
    return True

def tweet(ctx, args):
    return True
def retweet(ctx, args):
    return True
def comment(ctx, args):
    return True
def like(ctx, args):
    return True
def unLike(ctx, args):
    return True