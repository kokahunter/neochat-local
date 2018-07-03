from boa.interop.Neo.Runtime import Notify, Log, GetTime, Serialize, Deserialize
from boa.builtins import concat, list
from boa.interop.Neo.Storage import Get
from boa.interop.Neo.Action import RegisterAction

from storage.StorageHelper import IncrementThree, PutThree, IncrementOne, PutTwo, updateTweetCount, updateAccCount, GetThree, ValidateIPFS

# events
OnTweet = RegisterAction('tweet', 'globalid', 'uid', 'tweetkey')
OnRetweet = RegisterAction('retweet', 'uid', 'retweetkey')
OnComment = RegisterAction('comment', 'uid', 'tweetkey')
OnLike = RegisterAction('like', 'uid', 'tweetkey')

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

def tweet(ctx, addr, uid, content, retweet):
    """
    Post tweet
    
    Args:
        addr -> script hash of invoker
        uid -> unique user id
        content -> Tweet content
        retweet -> If '' then normal tweet. If key is given (from retweet operation) then this is a retweet
    
    Return: storage key for new tweet
    
    Tweet storage uid.tweet.{id (incremented per user)} => array[]:
        0 -> script hash of invoker
        1 -> uid
        2 -> display name
        3 -> tweet text
        4 -> time of tweet
        5 -> count comments
        6 -> count retweets        
        7 -> count likes
        8 -> count unlikes
        9 -> storage key retweeted tweet
    """

    #get user account data and count+1 for tweet
    accData = updateAccCount(ctx, uid, 4, True)
    newIndex = accData[4]
    name = accData[2]

    # save new tweet
    time = GetTime()
    save = [addr,uid,name, content, time, 0, 0, 0, 0, retweet]
    save_s = Serialize(save)
    PutThree(ctx,uid,".tweet.", newIndex, save_s)

    # increment total tweet count
    tweetIndex = IncrementOne(ctx,"tweets")

    # set the storage key for latest tweet
    tmp1 = concat(uid,".tweet.")
    tmp2 = concat(tmp1,newIndex)
    PutTwo(ctx,"tweet.",tweetIndex,tmp2)

    OnTweet(tweetIndex, uid, tmp2)
    return tmp2
def retweet(ctx, addr, uid, content, retweet):
    """
    Retweet is a tweet with a reference to anhother tweet
    
    Args:
        addr -> script hash of invoker
        uid -> unique user id
        retweet -> key of to-retweet
    
    Return: storage key for new tweet
    """
    # check if to-retweetretweet tweet exists and count+1
    count = updateTweetCount(ctx, retweet, "retweet")
    if count > 0:
        # save retweet for uid
        tmp = tweet(ctx,addr,uid,content,retweet)
        # save uid of retweeter
        PutThree(ctx,retweet,".retweet.",count,uid)
        OnRetweet(uid, retweet)
        return tmp
    Notify("To-retweet tweet does not exist.")
    return False
def comment(ctx, uid, tweet, comment):
    """
    Comment a tweet
    
    Args:
        uid -> unique user id
        tweet -> key of to-comment
        comment -> comment text    
    """
    count = updateTweetCount(ctx, tweet, "comment")
    if count > 0:
        # save comment for tweet
        time = GetTime()
        save = [uid,time,comment]
        save_s = Serialize(save)
        PutThree(ctx, tweet,".comment.",count,save_s)
        OnComment(uid,tweet)
        return True
    Notify("To-comment tweet does not exist")
    return False
def like(ctx, uid, tweet):
    """
    Like a tweet
    
    Args:
        uid -> unique user id
        tweet -> key of to-comment  
    """
    # check if user is liking already
    if not isLiking(ctx, uid, tweet):
        count = updateTweetCount(ctx, tweet, "like")
        if count > 0:
            # save comment for tweet
            PutThree(ctx, tweet,".like.",count,uid)
            #Set like indicator = true
            PutThree(ctx, uid, ".likecheck.", tweet, True)
            OnLike(uid,tweet)
            return True
        Notify("To-like tweet does not exist")
        return False
    Notify("User already liking tweet")
    return False
def unLike(ctx, args):
    return True
def isLiking(ctx, uid, tweetkey):
    """
    Check if user is likeing a tweet already.

    Args:
        uid -> uid of follower
        fUid -> uid of to-follow
    Returns:
        False if not following
        True if following
    """
    return GetThree(ctx, uid, ".likecheck.",tweetkey)