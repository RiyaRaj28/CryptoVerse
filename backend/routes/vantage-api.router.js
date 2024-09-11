const router = require('express').Router();
const axios = require('axios');

router.post('/getExchangeRate', async (req, res) => {
    const currencyFrom=req.body.currencyFrom;
    const currencyTo=req.body.currencyTo;
 
  const apiRes = await axios.get('https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency='+currencyFrom+'&to_currency='+currencyTo+'&apikey='+process.env.VANTAGE_KEY)
    .then(res => { return res });
    console.log(apiRes.data['Error Message']);
    if(apiRes.data.Note){
      return res.status(429).json({ Error: "Too many requests, slow down (one search a minute)"});

    }
    
    if(apiRes.data["Error Message"]){
      console.log("reach into invalid")
      return res.status(422).json({ Error: "Invalid ISO currency code"});
    }
  return res.json(apiRes.data);

});

router.post('/getCryptoRating', async (req, res) => {
    const currencyName=req.body.currencyName;
    console.log("pr", process.env.VANTAGE_KEY);

 
    try{
      const apiRes = await axios.get('https://www.alphavantage.co/query?function=CRYPTO_RATING&symbol='+currencyName+'&apikey='+process.env.VANTAGE_KEY)
      .then(res => { return res });
      // console.log("apiRes", res);

      if(apiRes.data.Note){
        return res.status(429).json({ Error: "Too many requests, slow down (one search a minute)"});
  
      }
      if(apiRes.data["Error Message"]){
        return res.status(422).json({ Error: "Invalid ISO currency code"});
      }
      console.log("apiRes DATAAA", apiRes.data);
    return res.json(apiRes.data);

    }catch (err){
      console.log("ERROR:", err);
      return res.status(500).json({ Error: err });
    }
});

router.post('/getHistory', async (req, res) => {
    const choice=req.body.choice;

    const currencyFrom=req.body.currencyFrom;
    const currencyTo=req.body.currencyTo;

    try{
      console.log("API key", process.env.VANTAGE_KEY);
      console.log("choice", choice);
      console.log("currencyFrom", currencyFrom);
      console.log("currencyTo", currencyTo);
      const apiRes= await axios.get('https://www.alphavantage.co/query?function=DIGITAL_CURRENCY_'+choice+'&symbol='+currencyFrom+'&market='+currencyTo+'&apikey='+process.env.VANTAGE_KEY)
      .then(res => { 
        console.log("first res from getHistoryyyy", res);
        return res });
      if(apiRes.data.Note){
        console.log("api resss", apiRes.data.Note)

        return res.status(429).json({ Error: "Too many requests, slow down (one search a minute)"});
  
      }
      console.log("get history DATAAA", apiRes.data);
      if(apiRes.data["Error Message"]){
        console.log("ress", res); 
        
        // return res.status(422).json({ Error: "Invalid ISO currency code"});
      }
   
  
    return res.json(apiRes.data);
      
    } catch (err){
      console.log("ERROR in getHistory:", err);
      return res.status(500).json({ Error: err });
    }


});

module.exports = router;