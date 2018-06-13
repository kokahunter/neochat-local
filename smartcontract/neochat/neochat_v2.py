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
        #TESTINGauthorized = CheckWitness(sender)
        # Validate invoker
        #TESTINGif not authorized:
        #TESTING    Notify("Not authorized")
        #TESTING    return False
        Notify(len(args))
        ctx = GetContext()
        """
            query operations    
        """

        if operation == "sendMessage" and len(args) == 4:
            Notify("In operation sendMessage")
            return sendMessage(ctx, args)
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
            elif operation == "tweet" and len(args) == 2:
                """
                Args required for follow:
                    0 -> script hash of invoker
                    1 -> content
                """
                Notify("In operation tweet")
                if len(args[1]) <= 247 and len(args[1] > 0):
                    return tweet(ctx,args[0],uid,args[1],'')
                Notify("Tweet must have a length between 1 and 247")
                return False
            elif operation == "retweet" and len(args) == 3:
                """
                Args required for follow:
                    0 -> script hash of invoker
                    1 -> content
                    2 -> storage key of tweet to be retweeted
                """
                Notify("In operation retweet")
                if len(args[1]) <= 247:
                    return retweet(ctx, args[0], uid, args[1], args[2])
                Notify("Retweet comment must not be longer than 247")
            elif operation == "follow" and len(args) == 2:
                """
                Args required for follow:
                    0 -> script hash of invoker
                        With script hash we get uid for this user earlier
                    1 -> script hash of user to be followed
                """
                Notify("In operation follow")
                return follow(ctx, uid, args[1])
            elif operation == "unfollow" and len(args) == 4:
                """
                Args required for unfollowing:
                    0 -> script hash of invoker
                    1 -> script hash of user to be followed
                    2 -> index of following iterated storage from (0)
                    3 -> index of followed iterated storage from (1)
                """
                Notify("In operation unfollow")
                return unFollow(ctx, uid, args[1], args[2], args[3])  
            elif operation == "like" and len(args) == 99:
                Notify("In operation like")
                return like(ctx, args)  
            elif operation == "unlike" and len(args) == 99:
                Notify("In operation unlike")
                return unLike(ctx, args)  
            elif operation == "comment" and len(args) == 3:
                """
                Args required for commenting:
                    0 -> script hash of invoker
                    1 -> key of to-comment tweet
                    2 -> comment text
                """
                Notify("In operation comment")
                if len(args[2]) <= 247 and len(args[2] > 0):
                    return comment(ctx, uid, args[1], args[2])
                Notify("Comment length must be between 1 and 247")
                return False
            elif operation == "batch" and len(args) == 99:
                Notify("In operation batch")
                # Pass off-chain serialized data, deserialize it on-chain and do operation for every item
                return True
            else:
                Notify("Operation not supported")
                return False
        else:
            Notify("User is not registered")
            return False
    return False
