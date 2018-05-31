from boa.interop.Neo.Storage import Get, Put
from boa.builtins import concat, list
from boa.interop.Neo.Runtime import Serialize, Deserialize

def GetTwo(ctx, one, two):
    key = concat(one,two)
    return Get(ctx, key)

def GetThree(ctx, one, two, three):
    key = concat(one,two)
    key2 = concat(key,three)
    return Get(ctx, key2)

def IncrementThree(ctx, one, two, three):
    key = concat(one,two)
    key2 = concat(key,three)
    lastIndex = Get(ctx, key2)
    if lastIndex == '':
        # No last Index, set first (1)
        newLastIndex = 1
    else:
        # Increment last index
        newLastIndex = lastIndex +1
    Put(ctx, key2, newLastIndex)
    return newLastIndex
def IncrementOne(ctx, key):
    lastIndex = Get(ctx, key)
    if lastIndex == '':
        newLastIndex = 1
    else:
        newLastIndex = lastIndex + 1
    Put(ctx,key, newLastIndex)
    return newLastIndex

def PutTwo(ctx, one, two, value):
    key = concat(one,two)
    Put(ctx,key, value)

def PutThree(ctx, one, two, three, value):
    key = concat(one,two)
    key2 = concat(key,three)
    Put(ctx, key2, value)
def updateTweetCount(ctx, key, operation):
    """
    Update the count for the given index for the tweet at storage(key)
    """
    if operation == "comment":
        index = 5
    elif operation == "retweet":
        index = 6
    elif operation == "like":
        index = 7
    else:
        Notify("Unknown operation for updateTweetCount()")
        return False
    temp = Get(ctx, key)
    if not temp == False:
        a_save_d = Deserialize(temp)
        a_count = a_save_d[index]
        aa_count = a_count + 1
        a_save_d[index] = aa_count
        a_save_s = Serialize(a_save_d)
        Put(ctx, key, a_save_s)
        return aa_count
    Notify("Tweet does not exist")
    return False

def updateAccCount(ctx, uid, index, noCount):
    a_save = Get(ctx, uid)
    a_save_d = Deserialize(a_save)
    a_count = a_save_d[index]
    aa_count = a_count + 1
    a_save_d[index] = aa_count
    a_save_s = Serialize(a_save_d)
    Put(ctx, uid, a_save_s)
    if noCount:
        return a_save_d
    else:
        return aa_count