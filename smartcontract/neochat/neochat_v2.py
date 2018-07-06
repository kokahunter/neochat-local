"""
NeoChat - Smart Contract for secure messaging and microblogging

Author: https://github.com/kokahunter
"""

from boa.interop.Neo.TriggerType import Application, Verification
from boa.interop.Neo.Runtime import GetTrigger, CheckWitness, Notify, Log
from boa.interop.Neo.Storage import GetContext
from send.Message import sendMessage, tweet, retweet, comment, like, unLike
from account.AccountHelper import register, isRegistered, changeName, follow, unFollow

CONTRACT_OWNER = "FASFFASF"

def Main(operation, args):
    """Entry point for the smart contract.
    Args:
        operation (str):
            Processing function 
        args (any):
            First args always invoker script hash
            Specific per function
    Return:
        (bytearray): The result of the operation
    """

    # Get trigger
    trigger = GetTrigger()

    if trigger == Verification():
        # TODO
        is_owner = CheckWitness(CONTRACT_OWNER)
        if is_owner:
            return True
        else:
            return False
    elif trigger == Application():
        sender = args[0]
        authorized = CheckWitness(sender)
        # Validate invoker
        if not authorized:
            Notify("Not authorized")
            return False
        ctx = GetContext()
        """
            query operations    
        """

        if operation == "sendMessage" and len(args) == 5:
            """
            Args required for sendMessage:
                0 -> sender script hash
                1 -> receiver address
                2 -> message
                3 -> IPFS boolean (int)
                4 -> encrypted boolean (int)
            """
            Notify("In operation sendMessage")
            if len(args[2]) <= 247 and len(args[2] > 0):
                return sendMessage(ctx, args[0], args[1], args[2], args[3], args[4])
            Notify("Message must have a length between 1 and 247")
            #todo: check ipfs hash length
        elif operation == "register" and len(args) == 4:
            """
            Args required for register:
                0 -> script hash of invoker
                1 -> unique user id
                2 -> display name
                3 -> public key
            """
            Notify("In operation register")
            return register(ctx, args)
        uid = isRegistered(ctx, args[0])
        if not uid == False:
            # Only if registered
            Notify("User is registered")
            if operation == "changeName" and len(args) == 2:
                """
                Args required for changeName:
                    0 -> script hash of invoker
                        With script hash we get uid for this user earlier
                    1 -> new display name
                """
                Notify("In operation changeName")
                return changeName(ctx, uid, args[1])
            else:
                Notify("Operation not supported")
                return False
        else:
            Notify("User is not registered")
            return False
    return False
