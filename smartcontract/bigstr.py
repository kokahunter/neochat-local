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
        if operation == "array":
            Notify("array")
            #31
            bigdata = 'In ac dui quis mi consectetuer '
            i = 0
            while i < 2200:
                bigdata = concat(bigdata, 'In ac dui quis mi consectetuer ')
                i= i + 1
            time = GetTime()
            data = [bigdata,time]
            result = Serialize(data)
            return result
        if operation == "dict":
            Notify("dict")
            j = 10
            d = {
                'a': 1,
                'b': 4,
                4: 'blah',
                'm': j,
                'z': [1, 3, 4, 5, 'abcd', j]
            }
            result = Serialize(d)
            return result
        if operation == "bool":
            Notify("array")
            #31
            bigdata = 'In ac dui quis mi consectetuer '
            time = GetTime()
            data = [False,True, False, True]
            result = Serialize(data)
            return result
        else:
            return False
    return False