"""
    Main for SC
    :param operation: operation
    :type operation: str
    :param args: list of arguments
        args[0]: sender scripthash
        args[1]: receiver scripthash
        args[2]: messageA
        args[3]: messageB
    :param type: str
"""

from boa.interop.Neo.TriggerType import Application, Verification
from boa.interop.Neo.Runtime import GetTrigger, CheckWitness, Notify, Log, GetTime, Serialize, Deserialize
from boa.builtins import concat, list
from boa.interop.Neo.Storage import Get, Put, GetContext

CONTRACT_OWNER = "FASFFASF"

def Main(operation, args):

    trigger = GetTrigger()

    if trigger == Verification():
        is_owner = CheckWitness(CONTRACT_OWNER)
        if is_owner:
            return True
        else:
            return False
    elif trigger == Application():
        sender = args[0]
        authorized = CheckWitness(sender)
        """
            Make sure that invoker is valid
        """
        if not authorized:
            Notify("Not authorized")
            return False
        Log("test")
        Notify(len(args))
        """
            query operations    
        """
        if operation == "sendMessage" and len(args) == 4:
            Notify("In operation sendMessage")
            return sendMessage(args)
        else:
            return False
    return False

def sendMessage(args):
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
    addMessage(sender,'.send.',messageA,receiver,time)
    # Add message for recipient
    addMessage(receiver,'.receive.',messageB,sender,time)
    return True

def addMessage(party,direction,message,partySecond,time):
    context = GetContext()
    partyHelper = concat(direction,'latest')
    partyLast = concat(party,partyHelper)
    lastIndex = Get(context,partyLast)
    if lastIndex == '':
        # No last Index, set first (1)
        newLastIndex = 1
    else:
        # Increment last index
        newLastIndex = lastIndex +1
    Notify(concat('lastindex +1: ', newLastIndex))
    # Set new last index
    Put(context, partyLast,newLastIndex)
    Notify(concat('put partyLast: ',partyLast))
    # Set message for index
    partyHelper2 = concat(direction,newLastIndex)
    partyMessageId = concat(party, partyHelper2)
    # Create message with header and body
    # header contains partySecond (sender / receiver) and time
    # body contains message
    # messageData = [partySecond,time,message]
    messageData = [message,time,partySecond]
    messageTemp = Serialize(messageData)
    Put(context,partyMessageId,messageTemp)
    Notify(concat('pt msg: ',messageTemp))
    return True