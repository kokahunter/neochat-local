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

def ValidateIPFS(ipfs):
    if ipfs == 0:
        return True
    elif ipfs == 1:
        return True
    else:
        return False