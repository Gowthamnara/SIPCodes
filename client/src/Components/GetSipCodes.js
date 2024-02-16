import axios from "axios";
import { useParams } from "react-router-dom";
import { useState } from "react";

export default function GetSipCodes(){
        const [sipcodes,setSipCodes]= useState([])
        const {convid}=useParams()
        console.log(convid)

        async function getsipcode(){
            try{
              const sipcodes=await axios.get('http://'+process.env.PUBLICDNS+':3005/getsipcodes/'+convid);
              console.log(sipcodes)
              setSipCodes(sipcodes.data)
              return sipcodes.data
            }
            catch(err){
              console.log(err)
            }
          }

      return (
        <div>
        <button onClick={getsipcode}>Refresh</button>
        {/* {sipcodes.map((name,index)=>{return <option key={index} value={name}>{name}</option>})} */}
        {sipcodes.map((value,index)=>{return <option key={index}>{value.Method}{value.Description?"-"+value.Description:""}</option>})}
        </div>
      )
}
