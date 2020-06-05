var express = require('express');
var router = express.Router();
var userModel = require('../models/user')
var radioModel = require('../models/radio')
var request = require('sync-request');
var  btoa  = require ( 'btoa' ) ; 
/* info compte api spotify */
var client_id = 'a4468fd654fa4ee49b7a21052e9ae4c0'; // Your client id
var client_secret = 'e26ed95f1d5e43cc8f0eaf161e96bc69'; // Your secret
var redirect_uri = 'https://auth.expo.io/@mariont/Playdio'; // Your redirect uri

/* --------------------------------------------------------- */
/* Gestion API Spotify */
/* function pour refresh les tokens */
async function refreshTokens(idSpotify) {
  const credsB64 = btoa(`${client_id}:${client_secret}`);
  const user = await userModel.find({musicAccounts:{$elemMatch:{platfornUserID: idSpotify}}})
  const refreshToken = user[0].musicAccounts[0].refreshToken
  var requestSpotify = request('POST','https://accounts.spotify.com/api/token',{
    headers:{
      'Authorization': `Basic ${credsB64}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body:`grant_type=refresh_token&refresh_token=${refreshToken}`
  })
  var newToken = JSON.parse(requestSpotify.getBody())
  await userModel.updateOne(
    {musicAccounts:{$elemMatch:{platfornUserID: idSpotify}}},
    { $set: {"musicAccounts.$.accessToken": newToken.access_token}}
  )
}
/* connection Spotify  */
router.get('/autorisation',function(req,res,next){
res.json({clientId : client_id,redirectURI: redirect_uri,clientSecret:client_secret})
}) 
/* recuperation information user + token */
router.post('/saveToken',async function(req,res,next){
    var requestSpotify = request('GET','https://api.spotify.com/v1/me',{
      headers:{
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer '+req.body.accessToken
      }
    })
    var reponse = JSON.parse(requestSpotify.getBody())
    var user = await userModel.findOne({email: reponse.email})
    if(user){
      res.json({result:"l'utilisateur existe déjà"})
    }else{
          var newUser = new userModel({
      email: reponse.email
    })
      newUser.musicAccounts.push({
        platfornUserID:reponse.id,
        platformURI:reponse.uri,
        refreshToken:req.body.refreshToken,
        accessToken:req.body.accessToken
      })
      await newUser.save()
      res.json({result:true,userInfo:newUser})
    }
  }) 
  
    /* example de request spotify */
    router.get('/exempleRequest',async function(req, res, next) {
      /*information a mettre en dur pour l'instant. il faudra créer un store pour recuperer cette donnée  */
      var idSpotify = 'x7kmell0jps7njqebispe817j'
      /* info dynamique que la requette a besoin */
      var artist = "Audioslave"
      var typeInfo = "track"
      /* function qui verrifie si le tocken access et valable */
      await refreshTokens(idSpotify)
      /* recuperation du token access a partir de la bdd */
      const user = await userModel.find({musicAccounts:{$elemMatch:{platfornUserID: idSpotify}}})
      const userAccessToken =  user[0].musicAccounts[0].accessToken
      /* request vers spotify */
      var requestSpotify = request('GET','https://api.spotify.com/v1/search?q='+artist+'&type='+typeInfo,{
        headers:{
          'Authorization': 'Bearer '+userAccessToken,
        },
      })
      var response = JSON.parse(requestSpotify.getBody())

      /* renvoi du json vers le front */
      res.json({result:response})
    });
/* --------------------------------------------------------- */
/* POST sign-in */
router.post('/sign-in', function(req, res, next) {
});

/* --------------------------------------------------------- */
/* POST sign-up */
router.post('/sign-up', async function(req, res, next) {
  
  var user = await userModel.find({email:req.body.email})
  /* if(si l'utisateur n'a pas de compte musique) */
  var newUser = await new userModel({
    firtName: req.body.firtName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password,
  })
    await newUser.save()
    res.json({result:true,dataUser:newUser});
  /* } */
  res.json({result:false});

  
});

/* --------------------------------------------------------- */
/* GET home page === radio page ? */
router.get('/', function(req, res, next) {
  // Backend affiché sur Heroku
  res.render('index', { title: 'Playdio' });
});

/* --------------------------------------------------------- */
/* GET radio */
router.get('/radio', function(req, res, next) {
});

/* --------------------------------------------------------- */
/* POST radio create */
router.post('/radio-create', function(req, res, next) {
});

/* --------------------------------------------------------- */
/* PUT radio update */
router.put('/radio-update', function(req, res, next) {
});

/* --------------------------------------------------------- */
/* DELETE radio delete */
router.delete('/radio-delete', function(req, res, next) {
});

/* --------------------------------------------------------- */
/* GET search */
router.get('/search', function(req, res, next) {
});


/* --------------------------------------------------------- */
/* GET music play */
router.get('/play', function(req, res, next) {
});

/* --------------------------------------------------------- */
/* GET settings */
router.get('/settings', function(req, res, next) {
});

/* --------------------------------------------------------- */
/* DELETE account */
router.delete('/account-delete', function(req, res, next) {
});

/* --------------------------------------------------------- */
/* GET Soundiiz */
router.get('/soudiiz', function(req, res, next) {

  // req exemple : https://soundiiz.com/v1/openapi/lookup/track/US43C1603405/sources?access_token=48c1c9b73c444307914965a24ffa8c40

  let apiToken ="48c1c9b73c444307914965a24ffa8c40" // token from soundiiz
  
  let isrcTrackToSearch = "US43C1603405" // isrc of the track
  
  let urlSoundiiz ="https://soundiiz.com/v1/openapi/lookup/track/"+isrcTrackToSearch+"/sources?access_token="+apiToken
    let reqSoundiz = request('GET', urlSoundiiz);
    let repSoundiz=JSON.parse(reqSoundiz.getBody()) // ---> request result
    console.log(repSoundiz) // ---> result from the request 

    res.json({ repSoundiz });

});

/* Add soudiiz  */

/* --------------------------------------------------------- */
/* GET Spotify ?? */
router.get('/spotify', function(req, res, next) {
});

module.exports = router;

