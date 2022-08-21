var express = require("express");
var app = express();
var request = require("request");
var rp = require("request-promise");
var fs = require('fs'); 
var csv = require('csv-parser');

app.set("view engine", "ejs");
app.use(express.static("public"));

var options = {
    url: "http://camaratek.com/api/views/formation.php",
    json: true
};

app.get("/",function(req, res){

    console.log("Bonjour Camara");
    var certs = [];
    rp(options)
    .then(function(data) {
        for(var i=0;i<data.result.certificats.length;i++){
            certs.push(data.result.certificats);
        }

        /*certs.forEach(function (l) {
            console.log(l);
        })*/
        getdetailsfromid(certs);
    })
    .catch((err) => console.log(err));
    
    function getdetailsfromid(id){
        var urls = [];
        for(var i=0;i<certs.length;i++){
            var url = "http://camaratek.com/api/views/formation.php?id=" + (i+1);
            //console.log(url);
            urls.push(url);
            var options = {
                url: urls[i],
                json: true
            };
            var certifs = [];
            rp(options)
            .then(function(data) {
                //console.log(data.result.certificats[0].urlpng);
                console.log(data.result.certificats[0].id);
                certifs.push({
                    id: data.result.certificats[0].id,
                    titre: data.result.certificats[0].titre,
                    numCert: data.result.certificats[0].numCert,
                    urlpng: data.result.certificats[0].urlpng,
                    description: data.result.certificats[0].description,
                    dateCertif: data.result.certificats[0].dateCertif 
                });

                if(certifs.length > certs.length-1){
                        // console.log(movie);
                        res.render("home", {certifs: certifs});
                    }
                })
            .catch((err) => console.log(err));
        }
    }
});




app.get("/certifdetails/:idcertif", function(req, res){
    var idcertif = req.params.idcertif;

    var options = {
        url: "http://camaratek.com/api/views/formation.php?id=" + idcertif,
        json: true
    }

    rp(options)
    .then(function(data){
        var clickedcertif = [];
            // console.log(data)
            clickedcertif.push({
                id: data.result.certificats[0].id,
                titre: data.result.certificats[0].titre,
                numCert: data.result.certificats[0].numCert,
                urlpng: data.result.certificats[0].urlpng,
                description: data.result.certificats[0].description,
                auteur: data.result.certificats[0].auteur,
                dateCertif: data.result.certificats[0].dateCertif,
                universite: data.result.certificats[0].universite,
                url: data.result.certificats[0].url,  
                plateforme: data.result.certificats[0].plateforme
            })
            

            var dict = {};
            var csvdata = [];
            fs.createReadStream("public/assets/Files/joined.csv")
            .pipe(csv())
            .on('data', function(data){
                try {
                    csvdata.push(data);
                }
                catch(err) {
                    console.log(err);
                }
            })
            .on('end',function(){
                    // console.log(csvdata);
                    for (var i=0;i<csvdata.length;i++){
                        dict[csvdata[i].imdbId] = csvdata[i].youtubeId;
                    } 
                    //var trailerlink = dict[clickedcertif0].imdbid.substring(2,).replace(/^0+/, '')];
                    res.render("certifdetails",{clickedcertif: clickedcertif}) 
                });
        });


});


app.get("/about",function(req, res){
    res.render("about");
});

app.get("/contact",function(req, res){
    res.render("contact");
});

app.get("/results",function(req, res){

    var listcertif = [];
    rp(options)
    .then(function(data) {
        for(var i=0;i<data.result.certificats.length;i++){
            listcertif.push(data.result.certificats);
        }


        //verication de id 
        if (req.query.searchquery == 0 || req.query.searchquery > listcertif.length)
            searchquery = 404;
        else
            searchquery = req.query.searchquery;

        console.log(searchquery);
        console.log(listcertif.length);
        var taille = listcertif.length;
        var uri= "http://camaratek.com/api/views/formation.php?id=" + searchquery;
        console.log(uri);
       request(uri, function(error,response,body){
            if(!error && response.statusCode==200){
                var certif = JSON.parse(body);
                console.log(certif.result.certificats);
                var cert = certif.result.certificats;
                res.render("results", {cert: cert, searchquery: searchquery, taille: taille});
            }
        });

    });
});


app.get("*", function(req, res){
    res.send("Error!! Sorry, Page Not Found");
});

var port = process.env.PORT || 4800;
app.listen(port, function(){
    console.log("Les certif de Camara started on port: " + port);
});