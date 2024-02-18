const express = require("express");
const app = express();
const platformClient = require('purecloud-platform-client-v2');
const client = platformClient.ApiClient.instance;
client.setEnvironment(platformClient.PureCloudRegionHosts.eu_central_1);//set environment
const SIPCodes = require('./Data/SIPCodes.json')
const cors = require("cors");
app.use(cors());
app.use(express.json())
require('dotenv').config()

const SIPDescription = SIPCodes

async function gettoken() {
    return client.loginClientCredentialsGrant(process.env.CLIENT_ID,process.env.CLIENT_SECRET)
        .then((authData) => {
            console.log(authData)
            console.log(`Token obtained`);
            process.env.TOKEN = authData.accessToken
            process.env.TOKEN_EXPIRY = authData.tokenExpiryTime
            client.setAccessToken(authData.accessToken);
            return true
        })
        .catch((err) => {
            console.log('There was a failure calling loginClientCredentialsGrant');
            console.error(err);
        });

}

async function ExceptionHandling(err,conversationId){
    if (err.status = 429) {
        console.log(err.message)
        var sleeptime = (err.message).match(/\d+/)[0]?(err.message).match(/\d+/)[0]:"1"
        console.log(sleeptime)
        //var waitTill = new Date(new Date().getTime() + 60 * 1000);
        // while(waitTill > new Date()){}
        console.log("waiting for ",(parseInt(sleeptime[0])* 1000)+1)
        await new Promise(resolve => setTimeout(resolve, (parseInt(sleeptime[0])* 1000)+1));
        let data=await getsipcodes(conversationId)
        console.log(`Resuming post Request`,new Date(),data.count?data.count:"Null");
        return data
    }
    else{
        console.log(err)
        return null
    }
}

async function setExternalTag(conversationid,externaltag){
    let apiInstance = new platformClient.ConversationsApi();

let conversationId = conversationid; // String | conversation ID
let body = {"externalTag":externaltag}; // Object | Conversation Tags

// Update the tags on a conversation.
return apiInstance.putConversationTags(conversationId, body)
  .then((data) => {
    //console.log(`putConversationTags success! data: ${JSON.stringify(data, null, 2)}`);
    console.log("External Tag Updated with",externaltag)
    return externaltag
  })
  .catch((err) => {
    console.log("There was a failure calling putConversationTags");
    console.error(err);
  });
}

// async function getsipcodesexp(conversationid) {
//     try{
//         //let accesstoken = await gettoken()
//         let apiInstance = new platformClient.TelephonyApi();
//         let dateStart = new Date(new Date().getDate()+"-"+(parseInt(new Date().getMonth())+1)+"-"+new Date().getFullYear()+"T00:00:30+01:00"); // Date | Start date of the search. Date time is represented as an ISO-8601 string. For example: yyyy-MM-ddTHH:mm:ss[.mmm]Z
//         let dateEnd = new Date(new Date().getDate()+"-"+(parseInt(new Date().getMonth())+1)+"-"+new Date().getFullYear()+"T23:59:50+01:00"); // Date | End date of the search. Date time is represented as an ISO-8601 string. For example: yyyy-MM-ddTHH:mm:ss[.mmm]Z
//         let opts = {
//             "callId": "", // String | unique identification of the placed call
//             "toUser": "", // String | User to who the call was placed
//             "fromUser": "", // String | user who placed the call
//             "conversationId": conversationid // String | Unique identification of the conversation
//         };

//         // Fetch SIP metadata
//         let SIPTraces=await apiInstance.getTelephonySiptraces(dateStart, dateEnd, opts)
//         //console.log("Data",SIPTraces)
//         return SIPTraces
//         }
//     catch(err){
//         console.log(err)
//         let returndata=await ExceptionHandling(err,conversationid)
//         return returndata
//     }
    
// }

async function getsipcodes(conversationid) {
    try{
        //let accesstoken = await gettoken()
        let apiInstance = new platformClient.TelephonyApi();
        let dateStart = new Date(new Date().getDate()+"-"+(parseInt(new Date().getMonth())+1)+"-"+new Date().getFullYear()+"T00:00:30+01:00"); // Date | Start date of the search. Date time is represented as an ISO-8601 string. For example: yyyy-MM-ddTHH:mm:ss[.mmm]Z
        let dateEnd = new Date(new Date().getDate()+"-"+(parseInt(new Date().getMonth())+1)+"-"+new Date().getFullYear()+"T23:59:50+01:00"); // Date | End date of the search. Date time is represented as an ISO-8601 string. For example: yyyy-MM-ddTHH:mm:ss[.mmm]Z
        let opts = {
            "callId": "", // String | unique identification of the placed call
            "toUser": "", // String | User to who the call was placed
            "fromUser": "", // String | user who placed the call
            "conversationId": conversationid // String | Unique identification of the conversation
        };

        // Fetch SIP metadata
        let SIPTraces=await apiInstance.getTelephonySiptraces(dateStart, dateEnd, opts)
        //console.log(SIPTraces)
        return SIPTraces
    }
    catch(err){
        //console.log(err)
        let returndata=await ExceptionHandling(err,conversationid)
        return returndata
    }
    
}




app.get('/getsipcodes/:conversationid', async (req, res) => {
    try{
        console.log("token exist")
        if(process.env.TOKEN_EXPIRY && process.env.TOKEN_EXPIRY > (new Date().getTime())+2000){
                let sipcodes = await getsipcodes(req.params.conversationid)
                console.log("data received",sipcodes.count?sipcodes.count:"NULL")
                sipcodesdata=[]
                if(sipcodes){
                    for(i in sipcodes.data){
                        sipcodesobj={}
                        sipcodesobj.Method=sipcodes.data[i].method
                        sipcodesobj.Description=SIPDescription[sipcodes.data[i].method]?SIPDescription[sipcodes.data[i].method]:""
                        sipcodesdata.push(sipcodesobj)
                    }
                    console.log(req.params.conversationid)
                    // let setexternaltag=await setExternalTag(req.params.conversationid,sipcodesdata[sipcodesdata.length-1].Method)
                    // if(setExternalTag){
                    //     console.log("External Tag Set to"+setExternalTag)
                    // }
                    res.send(sipcodesdata)
                }
                else{
                    console.log("Data Unavailable")
                    res.send("Data Unavailable")
            }
            }
        else{
            await gettoken()
            let sipcodes = await getsipcodes(req.params.conversationid)
            console.log("data received",sipcodes.count?sipcodes.count:"NULL")
            sipcodesdata=[]
            if(sipcodes){
                for(i in sipcodes.data){
                    sipcodesobj={}
                    sipcodesobj.Method=sipcodes.data[i].method
                    sipcodesobj.Description=SIPDescription[sipcodes.data[i].method]?SIPDescription[sipcodes.data[i].method]:""
                    sipcodesdata.push(sipcodesobj)
                }
                console.log(req.params.conversationid)
                // let setexternaltag=await setExternalTag(req.params.conversationid,sipcodesdata[sipcodesdata.length-1].Method)
                // if(setExternalTag){
                //     console.log("External Tag Set to"+setExternalTag)
                // }
                res.send(sipcodesdata)
            }
            else{
                console.log("Data Unavailable")
                res.send("Data Unavailable")
            }
        }
    }
    catch(err){
        await ExceptionHandling(err)

    }
    
})

app.get('/gettoken', async (req, res) => {
    let token = await gettoken()
    res.send({ "token": token })
})

app.listen(process.env.SERVERPORT, () => {
    console.log("server running on port "+process.env.SERVERPORT);
});
