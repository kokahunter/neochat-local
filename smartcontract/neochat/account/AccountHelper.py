from boa.interop.Neo.Runtime import GetTime, Serialize, Deserialize, Notify
from boa.interop.Neo.Storage import Get, Put
from boa.interop.Neo.Action import RegisterAction

from storage.StorageHelper import PutThree, GetThree, IncrementOne

#events
OnRegister = RegisterAction('register', 'addr', 'uid')

def register(ctx, args):
    """
    Register new account

    Args:
        0 -> script hash of invoker
        1 -> unique user id
        2 -> display name
        3 -> public key
    Account storage uid => array[]:
        0 -> script hash of invoker
        1 -> uid
        2 -> display name
        3 -> time of registration
        4 -> count tweets
        5 -> count followers
        6 -> count following
        7 -> count unfollowed
        8 -> count unfollowing
        9 -> public key
    """
    addr = args[0]
    uid = args[1]
    # check if uid is free
    if not Get(ctx, uid):
        # check if user already registered
        if not isRegistered(ctx,addr):
            # register the script hash with the uid
            Put(ctx, addr, uid)
            name = args[2]
            time = GetTime()
            save = [addr, uid, name, time, 0, 0, 0, 0, 0, args[3]]
            save_s = Serialize(save)
            # register the uid with user data
            Put(ctx, args[1], save_s)
            # Increment total account count + 1
            IncrementOne(ctx, "accounts")
            OnRegister(addr,uid)
            return True
        Notify("User is already registered")
        return False
    Notify("UserId already taken")
    return False
def isRegistered(ctx, key):
    """
    Check if user is registered.

    Args:
        key -> script hash
    Returns:
        False if not registered
        UserId if registered
    """
    uid = Get(ctx, key)
    if not uid:
        return False
    return uid

def changeName(ctx, uid, name):
    """
    Change display name of account

    Args:
        uid -> unique user id
        name -> new display name
    """
    save = Get(ctx, uid)
    save_d = Deserialize(save)
    save_d[2] = name
    save_s = Serialize(save_d)
    Put(ctx, uid, save_s)
    return True