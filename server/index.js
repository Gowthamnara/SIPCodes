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
    return client.loginClientCredentialsGrant(process.env.client_id,process.env.client_secret)
        .then((authData) => {
            console.log(authData)
            console.log(`Token obtained`);
            process.env.Token = authData.accessToken
            process.env.TOKEN_EXPIRY = authData.tokenExpiryTime
            client.setAccessToken(authData.accessToken);
            return true

        })

        .catch((err) => {

            console.log('There was a failure calling loginClientCredentialsGrant');
            console.error(err);
        });

}

async function ExceptionHandling(err){
    if (err.status = 429) {
        var sleeptime = err.message.match(/\d+/)
        //var waitTill = new Date(new Date().getTime() + 60 * 1000);
        // while(waitTill > new Date()){}
        await new Promise(resolve => setTimeout(resolve, sleeptime[0] * 1000));
        await getsipcodes()
        console.log(`Resuming post Request ${startdate}`);

    }
    else{
        console.log(err)
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
        return apiInstance.getTelephonySiptraces(dateStart, dateEnd, opts)
            .then((data) => {
            //console.log(`getTelephonySiptraces success! data: ${JSON.stringify(data, null, 2)}`);
                console.log("Sip Codes API Called")
                return data
            })
            .catch((err) => {
                console.log("There was a failure calling getTelephonySiptraces");
                console.error(err);
            });
    }
    catch(err){
        await ExceptionHandling(err)
    }
    
}




app.get('/getsipcodes/:conversationid', async (req, res) => {
    try{
        if(process.env.TOKEN_EXPIRY && process.env.TOKEN_EXPIRY > (new Date().getTime())+2000){
                let sipcodes = await getsipcodes(req.params.conversationid)
                sipcodesdata=[]
                for(i in sipcodes.data){
                    sipcodesobj={}
                    sipcodesobj.Method=sipcodes.data[i].method
                    sipcodesobj.Description=SIPDescription[sipcodes.data[i].method]?SIPDescription[sipcodes.data[i].method]:""
                    sipcodesdata.push(sipcodesobj)
                }
                console.log(req.params.conversationid)
                let setexternaltag=await setExternalTag(req.params.conversationid,sipcodesdata[sipcodesdata.length-1].Method)
                if(setExternalTag){
                    console.log("External Tag Set to"+setExternalTag)
                }
                res.send(sipcodesdata)
            }
        else{
            await gettoken()
            let sipcodes = await getsipcodes(req.params.conversationid)
                sipcodesdata=[]
                for(i in sipcodes.data){
                    sipcodesobj={}
                    sipcodesobj.Method=sipcodes.data[i].method
                    sipcodesobj.Description=SIPDescription[sipcodes.data[i].method]?SIPDescription[sipcodes.data[i].method]:""
                    sipcodesdata.push(sipcodesobj)
                }
                console.log(req.params.conversationid)
                let setexternaltag=await setExternalTag(req.params.conversationid,sipcodesdata[sipcodesdata.length-1].Method)
                if(setExternalTag){
                    console.log("External Tag Set to"+setExternalTag)
                }
                res.send(sipcodesdata)
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
    console.log("server running on port 3001");
});
