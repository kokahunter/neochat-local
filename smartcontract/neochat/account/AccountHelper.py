from boa.interop.Neo.Runtime import GetTime, Serialize, Deserialize, Notify
from boa.interop.Neo.Storage import Get, Put
from boa.interop.Neo.Action import RegisterAction

from storage.StorageHelper import PutThree, GetThree, IncrementOne, updateAccCount

#events
OnFollow = RegisterAction('follow', 'uid', 'fuid')
OnUnfollow = RegisterAction('unfollow', 'uid', 'fuid')
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
def isFollowing(ctx, uid, fUid):
    """
    Check if user is following already.

    Args:
        uid -> uid of follower
        fUid -> uid of to-follow
    Returns:
        False if not following
        True if following
    """
    return GetThree(ctx, uid, ".followcheck.",fUid)
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

def follow(ctx, uid, fAddr):
    """
    Follow another user

    Args:
        uid -> unique user id
        fAddr -> to-follow script hash
    """
    #how to prevent multiple following?
    fUid = isRegistered(ctx, fAddr)
    if not fUid == False:
        if fUid == uid:
            Notify("User cannot follow himself")
            return False
        if not isFollowing(ctx, uid, fUid):
            # Count following += 1 for uid
            ##a_save = Get(ctx, uid)
            ##a_save_d = Deserialize(a_save)
            ##a_count = a_save_d[6]
            ##aa_count = a_count + 1
            ##a_save_d[6] = aa_count
            ##a_save_s = Serialize(a_save_d)
            ##Put(ctx, uid, a_save_s)
            aa_count = updateAccCount(ctx, uid, 6, False)

            # Count follower += 1 for fUid
            ##b_save = Get(ctx, fUid)
            ##b_save_d = Deserialize(b_save)
            ##b_count = b_save_d[5]
            ##bb_count = b_count + 1
            ##b_save_d[5] = bb_count
            ##b_save_s = Serialize(b_save_d)
            ##Put(ctx, fUid, b_save_s)
            bb_count = updateAccCount(ctx, fUid, 5, False)

            # Add follow to iterated storage for uid      
            t1 = [fUid, bb_count]
            t1_s = Serialize(t1)
            PutThree(ctx,uid,".following.",aa_count, t1_s)

            # Add follow to iterated storage for fUid
            t2 = [uid, aa_count]
            t2_s = Serialize(t2)
            PutThree(ctx,fUid,".followers.",bb_count, t2_s)

            #Set follow indicator = true
            PutThree(ctx, uid, ".followcheck.", fUid, True)

            OnFollow(uid,fUid)
            return True
        Notify("User already following")
        return False
    Notify("User to follow not registered")
    return False
def unFollow(ctx, uid, uFAddr, index_a, index_b):
    """
    Unfollow another user

    Args:
        uid -> unique user id
        uFAddr -> to-follow script hash
        index_a -> Index of iterated storage of uid, for the following of fUid
        index_b -> Index of iterated storage of FUid, for the follow of uid
    """
    uFUid = isRegistered(ctx, uFAddr)
    if not uFUid == False:
        if uFUid == uid:
            Notify("User cannot unfollow himself")
            return False
        if isFollowing(ctx, uid, uFUid):
            #User has to be follower, respecitve follower has to be followed by user
            a_temp = GetThree(ctx, uid, ".following.", index_a)
            a_temp_d = Deserialize(a_temp)
            b_temp = GetThree(ctx, uFUid, ".followers.", index_b)
            b_temp_d = Deserialize(b_temp)
            if a_temp_d[0] == uFUid and b_temp_d[0] == uid:
                # Count unfollowing += 1 for uid
                ##a_save = Get(ctx, uid)
                ##a_save_d = Deserialize(a_save)
                ##a_count = a_save_d[8]
                ##aa_count = a_count + 1
                ##a_save_d[8] = aa_count
                ##a_save_s = Serialize(a_save_d)
                ##Put(ctx, uid, a_save_s)
                updateAccCount(ctx, uid, 8, False)

                # Count unfollowed += 1 for uFUid
                ##b_save = Get(ctx, uFUid)
                ##b_save_d = Deserialize(b_save)
                ##b_count = b_save_d[7]
                ##bb_count = b_count + 1
                ##b_save_d[7] = bb_count
                ##b_save_s = Serialize(b_save_d)
                ##Put(ctx, uFUid, b_save_s)
                updateAccCount(ctx, uFUid, 7, False)

                # Mark index as unfollowed for uid 
                PutThree(ctx,uid,".following.",index_a, "unfollowing")
                # Mark index as unfollowed for uFUid 
                PutThree(ctx,uFUid,".followers.",index_b, "unfollowed")

                #Set follow indicator = false
                PutThree(ctx, uid, ".followcheck.", uFUid, False)

                OnUnfollow(uid,uFUid)
                return True
            Notify("Following and Follower indexes do not match")
            return False
        Notify("User is not following.")
        return False
    Notify("User to unfollow not registered")
    return False        